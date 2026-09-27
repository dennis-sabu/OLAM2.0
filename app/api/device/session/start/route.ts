import { NextRequest, NextResponse } from "next/server";
import { authenticateDevice, supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const deviceUser = await authenticateDevice(authHeader);

  if (!deviceUser) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid device token." },
      { status: 401 }
    );
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const taskId = body.taskId;
    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId." }, { status: 400 });
    }

    // 1. Update task to In Progress
    const { data: updatedTask, error: updateErr } = await supabaseAdmin
      .from("tasks")
      .update({
        status: "In Progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", deviceUser.userId)
      .select()
      .single();

    if (updateErr) {
      throw new Error(`Failed to start task session: ${updateErr.message}`);
    }

    // 2. Insert task history audit
    const today = new Date().toISOString().split("T")[0];
    try {
      await supabaseAdmin.from("task_history").insert({
        user_id: deviceUser.userId,
        task_id: taskId,
        task_title: updatedTask?.title || "Focus Task",
        date: today,
        action: "started",
        previous_status: "Pending",
        new_status: "In Progress",
        planned_minutes: updatedTask?.planned_minutes ?? updatedTask?.estimated_minutes,
        note: "Started via ESP32-S3 Physical Companion",
      });
    } catch {}

    return NextResponse.json({
      success: true,
      taskId: taskId,
      status: "In Progress",
      startedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Device Session Start Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to start focus session." },
      { status: 500 }
    );
  }
}
