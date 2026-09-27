import { NextRequest, NextResponse } from "next/server";
import { parseTaskInputSchema } from "@/lib/ai/schemas";
import { parseTaskWithGroq } from "@/lib/ai/groq";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body.", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const validation = parseTaskInputSchema.safeParse(body);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstIssue, code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { input, currentDate } = validation.data;
    const refDate = currentDate ? new Date(currentDate) : new Date();

    const parsedTask = await parseTaskWithGroq(input, refDate);

    return NextResponse.json(parsedTask, { status: 200 });
  } catch (err: any) {
    console.error("AI Parse Task Error:", err?.message);

    const message = err?.message || "";
    if (message.includes("GROQ_API_KEY is not configured")) {
      return NextResponse.json(
        {
          error: "AI service is currently unconfigured. You can still create your task manually.",
          code: "GROQ_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
        {
          error: "AI rate limit reached. Please wait a moment or enter task details manually.",
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Couldn't understand that task. Try adding a deadline or estimated time, or fill the details manually.",
        code: "PARSE_ERROR",
      },
      { status: 500 }
    );
  }
}
