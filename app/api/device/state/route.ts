import { NextRequest, NextResponse } from "next/server";
import { authenticateDevice, supabaseAdmin } from "@/lib/supabase/admin";
import { calculateCapacity, schedule, applyPlanToTasks } from "@/lib/flowstate";
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const deviceUser = await authenticateDevice(authHeader);

  if (!deviceUser) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid or missing device token.", authenticated: false },
      { status: 401 }
    );
  }

  try {
    // 1. Fetch user's tasks
    const { data: rawTasks, error: tasksErr } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("user_id", deviceUser.userId)
      .neq("status", "Completed")
      .order("created_at", { ascending: true });

    if (tasksErr) {
      throw new Error(`Failed to query tasks: ${tasksErr.message}`);
    }

    const tasks: Task[] = (rawTasks || []).map(dbRowToTask);

    // 2. Fetch today's state
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: stateData } = await supabaseAdmin
      .from("daily_states")
      .select("*")
      .eq("user_id", deviceUser.userId)
      .eq("date", todayStr)
      .single();

    const currentState = stateData
      ? {
          energy: stateData.energy,
          stress: stateData.stress,
          availableTime: stateData.available_minutes,
          sleep: Number(stateData.sleep_hours || 7),
        }
      : mockDailyState;

    // 3. Run pure FlowState scheduling engine
    const plan = schedule(tasks, currentState);
    const plannedTasks = applyPlanToTasks(tasks, plan);

    // 4. Find active task
    // Priority: task currently "In Progress"
    let activeTask = plannedTasks.find((t) => t.status === "In Progress");

    // Otherwise first planned task (KEEP or REDUCE)
    if (!activeTask) {
      activeTask = plannedTasks.find(
        (t) => t.planAction === "KEEP" || t.planAction === "REDUCE"
      );
    }

    // Otherwise first pending task
    if (!activeTask && plannedTasks.length > 0) {
      activeTask = plannedTasks[0];
    }

    // 5. Find next task
    let nextTask: Task | null = null;
    if (activeTask) {
      nextTask =
        plannedTasks.find(
          (t) =>
            t.id !== activeTask!.id &&
            (t.planAction === "KEEP" || t.planAction === "REDUCE") &&
            t.status !== "Completed"
        ) || null;
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: deviceUser.userName,
        task: activeTask
          ? {
              id: activeTask.id,
              title: activeTask.title,
              category: activeTask.category,
              decision: activeTask.planAction !== "NONE" ? activeTask.planAction : "KEEP",
              plannedMinutes: activeTask.plannedMinutes ?? activeTask.estimatedDuration,
              status: activeTask.status,
            }
          : null,
        nextTask: nextTask
          ? {
              id: nextTask.id,
              title: nextTask.title,
              decision: nextTask.planAction !== "NONE" ? nextTask.planAction : "KEEP",
              plannedMinutes: nextTask.plannedMinutes ?? nextTask.estimatedDuration,
            }
          : null,
        serverTime: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Device State API Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve device state." },
      { status: 500 }
    );
  }
}
