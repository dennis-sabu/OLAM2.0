import { NextRequest, NextResponse } from "next/server";
import { authenticateDevice, supabaseAdmin } from "@/lib/supabase/admin";
import { schedule, applyPlanToTasks } from "@/lib/flowstate";
import { mockDailyState } from "@/lib/mockData";
import { Task, Priority, Status, PlanAction } from "@/types";

function dbRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? "Academics",
    deadline: row.deadline ?? "No Deadline",
    estimatedDuration: row.estimated_minutes ?? 30,
    completedMinutes: row.completed_minutes ?? 0,
    priority: (row.priority as Priority) ?? "Medium",
    status: (row.status as Status) ?? "Pending",
    planAction: (row.plan_action as PlanAction) ?? "NONE",
    plannedMinutes: row.planned_minutes ?? undefined,
    plannedDate: row.planned_date ?? undefined,
    moveReason: row.move_reason ?? undefined,
    createdAt: row.created_at,
  };
}

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

    const actualMinutes = typeof body.actualMinutes === "number" ? body.actualMinutes : undefined;

    // 1. Get task data
    const { data: existingTask, error: fetchErr } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", deviceUser.userId)
      .single();

    if (fetchErr || !existingTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    // 2. Mark complete in DB
    const finalMinutes = actualMinutes ?? existingTask.estimated_minutes;
    const { error: completeErr } = await supabaseAdmin
      .from("tasks")
      .update({
        status: "Completed",
        completed_minutes: finalMinutes,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", deviceUser.userId);

    if (completeErr) {
      throw new Error(`Failed to complete task: ${completeErr.message}`);
    }

    // 3. Write task history record
    const today = new Date().toISOString().split("T")[0];
    try {
      await supabaseAdmin.from("task_history").insert({
        user_id: deviceUser.userId,
        task_id: taskId,
        task_title: existingTask.title,
        date: today,
        action: "completed",
        previous_status: existingTask.status,
        new_status: "Completed",
        planned_minutes: existingTask.planned_minutes ?? existingTask.estimated_minutes,
        actual_minutes: finalMinutes,
        note: "Completed via ESP32-S3 Physical Companion",
      });
    } catch {}

    // 4. Query remaining tasks to calculate nextTask for immediate display
    const { data: rawTasks } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("user_id", deviceUser.userId)
      .neq("status", "Completed")
      .order("created_at", { ascending: true });

    const remainingTasks = (rawTasks || []).map(dbRowToTask);

    const { data: stateData } = await supabaseAdmin
      .from("daily_states")
      .select("*")
      .eq("user_id", deviceUser.userId)
      .eq("date", today)
      .single();

    const currentState = stateData
      ? {
          energy: stateData.energy,
          stress: stateData.stress,
          availableTime: stateData.available_minutes,
          sleep: Number(stateData.sleep_hours || 7),
        }
      : mockDailyState;

    const plan = schedule(remainingTasks, currentState);
    const plannedRemaining = applyPlanToTasks(remainingTasks, plan);

    const nextTask =
      plannedRemaining.find(
        (t) => t.planAction === "KEEP" || t.planAction === "REDUCE"
      ) ||
      (plannedRemaining.length > 0 ? plannedRemaining[0] : null);

    return NextResponse.json({
      success: true,
      completedTaskId: taskId,
      completedTaskTitle: existingTask.title,
      nextTask: nextTask
        ? {
            id: nextTask.id,
            title: nextTask.title,
            category: nextTask.category,
            decision: nextTask.planAction !== "NONE" ? nextTask.planAction : "KEEP",
            plannedMinutes: nextTask.plannedMinutes ?? nextTask.estimatedDuration,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Device Task Complete Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to mark task complete." },
      { status: 500 }
    );
  }
}
