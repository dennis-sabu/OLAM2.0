import { NextRequest, NextResponse } from "next/server";
import { breakdownTaskInputSchema } from "@/lib/ai/schemas";
import { breakdownTaskWithGroq } from "@/lib/ai/groq";

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

    const validation = breakdownTaskInputSchema.safeParse(body);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Invalid task data";
      return NextResponse.json(
        { error: firstIssue, code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { task } = validation.data;
    const result = await breakdownTaskWithGroq(task);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("AI Breakdown Task Error:", err?.message);

    const message = err?.message || "";
    if (message.includes("GROQ_API_KEY is not configured")) {
      return NextResponse.json(
        {
          error: "AI service is currently unconfigured.",
          code: "GROQ_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
        {
          error: "AI rate limit reached. Please wait a moment before breaking down another task.",
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to generate task breakdown at this moment. You can add subtasks manually.",
        code: "PARSE_ERROR",
      },
      { status: 500 }
    );
  }
}
