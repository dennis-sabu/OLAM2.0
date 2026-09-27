import Groq from "groq-sdk";
import {
  parsedTaskResponseSchema,
  breakdownTaskResponseSchema,
  ParsedTaskResponse,
  BreakdownTaskResponse,
} from "./schemas";
import { normalizeDeadline } from "./dateNormalizer";

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }
  return new Groq({ apiKey });
}

const PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";

async function callGroqWithFallback(messages: any[]): Promise<string> {
  const client = getGroqClient();
  try {
    const completion = await client.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });
    return completion.choices[0]?.message?.content || "{}";
  } catch (err: any) {
    // If primary model fails with not found or rate limit, attempt fallback model
    if (PRIMARY_MODEL !== FALLBACK_MODEL) {
      console.warn(`Primary model ${PRIMARY_MODEL} failed, attempting ${FALLBACK_MODEL}:`, err?.message);
      const completion = await client.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        temperature: 0.1,
        response_format: { type: "json_object" },
      });
      return completion.choices[0]?.message?.content || "{}";
    }
    throw err;
  }
}

/**
 * Parses raw natural language into structured task fields using Groq.
 * Never invents information that wasn't mentioned.
 */
export async function parseTaskWithGroq(
  input: string,
  refDate: Date = new Date()
): Promise<ParsedTaskResponse> {
  const dateStr = refDate.toISOString().split("T")[0];
  const dayName = refDate.toLocaleDateString("en-US", { weekday: "long" });

  const systemPrompt = `You are FlowState's task understanding engine. Your job is to extract structured task information from student natural language.
Current Reference Date: ${dateStr} (${dayName}).

CRITICAL EXTRACTION RULES:
1. DO NOT INVENT INFORMATION.
2. If the user did NOT mention an estimated duration (e.g., "2 hours", "45 mins"), set "estimatedMinutes" to null.
3. If the user did NOT mention a deadline (e.g., "by Friday", "tomorrow"), set "deadline" to null and "rawTemporalPhrase" to null.
4. Priority must default to "Medium" unless explicit urgency or low priority words appear (e.g. "urgent", "asap", "crucial" -> "High" or "Urgent"; "not urgent", "when free" -> "Low").
5. Category must be one of: "Academics", "Projects", "Personal", "Exams" or null if ambiguous.
6. The "title" should be a clean, concise description of the core task (without the extra filler words).

OUTPUT FORMAT:
Return a JSON object with EXACTLY these keys:
{
  "title": string,
  "category": "Academics" | "Projects" | "Personal" | "Exams" | null,
  "deadline": string | null,
  "estimatedMinutes": number | null,
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "rawTemporalPhrase": string | null
}`;

  const userPrompt = `Student task input: "${input.trim()}"`;

  const rawJson = await callGroqWithFallback([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    throw new Error("Groq returned invalid JSON format.");
  }

  // Handle case where model nests response inside a key
  if (parsed.task && typeof parsed.task === "object") {
    parsed = parsed.task;
  }

  // Normalize priority casing
  if (typeof parsed.priority === "string") {
    const p = parsed.priority.toLowerCase();
    if (p === "high") parsed.priority = "High";
    else if (p === "urgent") parsed.priority = "Urgent";
    else if (p === "low") parsed.priority = "Low";
    else parsed.priority = "Medium";
  } else {
    parsed.priority = "Medium";
  }

  // Normalize category casing
  if (typeof parsed.category === "string") {
    const c = parsed.category.toLowerCase();
    if (c.includes("exam")) parsed.category = "Exams";
    else if (c.includes("acad")) parsed.category = "Academics";
    else if (c.includes("proj")) parsed.category = "Projects";
    else if (c.includes("pers")) parsed.category = "Personal";
    else parsed.category = null;
  }

  // Normalize estimatedMinutes
  if (typeof parsed.estimatedMinutes === "number") {
    parsed.estimatedMinutes = Math.round(parsed.estimatedMinutes);
    if (parsed.estimatedMinutes <= 0) parsed.estimatedMinutes = null;
  } else {
    parsed.estimatedMinutes = null;
  }

  // Apply server-side date normalization to avoid trusting model arithmetic
  const phrase = parsed.rawTemporalPhrase || parsed.deadline;
  if (phrase) {
    parsed.deadline = normalizeDeadline(phrase, refDate);
  }

  // Validate strictly with Zod
  const validationResult = parsedTaskResponseSchema.safeParse(parsed);
  if (!validationResult.success) {
    throw new Error(`Task schema validation failed: ${validationResult.error.message}`);
  }

  return validationResult.data;
}

/**
 * Generates 3 to 8 logical subtasks to break down a larger task.
 */
export async function breakdownTaskWithGroq(task: {
  title: string;
  category?: string | null;
  deadline?: string | null;
  estimatedMinutes?: number | null;
  priority?: string | null;
}): Promise<BreakdownTaskResponse> {
  const systemPrompt = `You are FlowState's task breakdown engine. Break down a student task into 3 to 8 logical, actionable subtasks.
RULES:
1. Provide between 3 and 8 subtasks.
2. Each subtask must have a concise "title" and a realistic "estimatedMinutes" (between 10 and 120 minutes).
3. The sum of estimatedMinutes should roughly align with the parent task, or represent realistic increments to complete it.
4. Output JSON ONLY with key "subtasks": array of { "title": string, "estimatedMinutes": number }.`;

  const userPrompt = `Task to break down:
Title: ${task.title}
Category: ${task.category || "Unspecified"}
Deadline: ${task.deadline || "Unspecified"}
Estimated Duration: ${task.estimatedMinutes ? `${task.estimatedMinutes} minutes` : "Unspecified"}
Priority: ${task.priority || "Medium"}`;

  const rawJson = await callGroqWithFallback([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    throw new Error("Groq returned invalid JSON for subtask breakdown.");
  }

  if (Array.isArray(parsed)) {
    parsed = { subtasks: parsed };
  }

  const validationResult = breakdownTaskResponseSchema.safeParse(parsed);
  if (!validationResult.success) {
    throw new Error(`Breakdown schema validation failed: ${validationResult.error.message}`);
  }

  return validationResult.data;
}
