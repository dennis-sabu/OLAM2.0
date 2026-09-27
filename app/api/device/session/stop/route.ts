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

    const actualMinutes = typeof body.actualMinutes === "number" ? body.actualMinutes : 0;

    // Fetch current task to update completed_minutes if logged
    const { data: currentTask } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", deviceUser.userId)
      .single();

    const newCompleted = (currentTask?.completed_minutes || 0) + actualMinutes;

    // 1. Reset status back to Pending (not complete)
    const { error: updateErr } = await supabaseAdmin
      .from("tasks")
      .update({
        status: "Pending",
        completed_minutes: newCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", deviceUser.userId);

    if (updateErr) {
      throw new Error(`Failed to stop session: ${updateErr.message}`);
    }

    // 2. Insert history record
    const today = new Date().toISOString().split("T")[0];
    try {
      await supabaseAdmin.from("task_history").insert({
        user_id: deviceUser.userId,
        task_id: taskId,
        task_title: currentTask?.title || "Focus Task",
        date: today,
        action: "reduced",
        previous_status: "In Progress",
        new_status: "Pending",
        actual_minutes: actualMinutes,
        note: "Session paused/stopped on ESP32-S3 Physical Companion",
      });
    } catch {}

    return NextResponse.json({
      success: true,
      taskId: taskId,
      status: "Pending",
      completedMinutes: newCompleted,
    });
  } catch (err: any) {
    console.error("Device Session Stop Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to stop focus session." },
      { status: 500 }
    );
  }
}
