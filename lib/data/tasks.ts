/**
 * FlowState Data Layer — Tasks
 *
 * All Supabase queries for the tasks table.
 * RLS ensures the authenticated user only sees their own rows.
 *
 * Architecture: UI → FlowStateProvider → here → Supabase
 */

import { supabase } from "@/lib/supabase/client";
import { Task, Priority, Status, PlanAction } from "@/types";

// ── DB row type ───────────────────────────────────────────────

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  deadline: string | null;
  estimated_minutes: number;
  completed_minutes: number;
  priority: string;
  status: string;
  plan_action: string;
  planned_minutes: number | null;
  planned_date: string | null;
  move_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Mapper ────────────────────────────────────────────────────

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    category: (row.category as Task["category"]) ?? "Academics",
    deadline: row.deadline ?? "No Deadline",
    estimatedDuration: row.estimated_minutes,
    completedMinutes: row.completed_minutes,
    priority: (row.priority as Priority) ?? "Medium",
    status: (row.status as Status) ?? "Pending",
    planAction: (row.plan_action as PlanAction) ?? "NONE",
    plannedMinutes: row.planned_minutes ?? undefined,
    plannedDate: row.planned_date ?? undefined,
    moveReason: row.move_reason ?? undefined,
    createdAt: row.created_at,
  };
}

function taskToRow(task: Omit<Task, "id" | "createdAt">, userId: string): Omit<TaskRow, "id" | "created_at" | "updated_at" | "completed_at"> {
  return {
    title: task.title,
    category: task.category,
    deadline: task.deadline === "No Deadline" ? null : task.deadline,
    estimated_minutes: task.estimatedDuration,
    completed_minutes: task.completedMinutes ?? 0,
    priority: task.priority,
    status: task.status,
    plan_action: task.planAction,
    planned_minutes: task.plannedMinutes ?? null,
    planned_date: task.plannedDate ?? null,
    move_reason: task.moveReason ?? null,
    user_id: userId,
  };
}

// ── Queries ───────────────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`getTasks: ${error.message}`);
  return (data as TaskRow[]).map(rowToTask);
}

export async function createTask(task: Omit<Task, "id" | "createdAt">, userId: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(taskToRow(task, userId))
    .select()
    .single();

  if (error) throw new Error(`createTask: ${error.message}`);
  return rowToTask(data as TaskRow);
}

export async function updateTaskInDB(task: Task, userId: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update(taskToRow(task, userId))
    .eq("id", task.id)
    .select()
    .single();

  if (error) throw new Error(`updateTask: ${error.message}`);
  return rowToTask(data as TaskRow);
}

export async function deleteTaskFromDB(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(`deleteTask: ${error.message}`);
}

export async function completeTaskInDB(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: "Completed",
      completed_minutes: undefined, // will be set by caller
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`completeTask: ${error.message}`);
  return rowToTask(data as TaskRow);
}

/** Bulk-upsert an array of tasks (used after recalculatePlan to sync decisions). */
export async function upsertTasks(tasks: Task[], userId: string): Promise<void> {
  if (tasks.length === 0) return;

  const rows = tasks.map((t) => ({
    ...taskToRow(t, userId),
    id: t.id,
  }));

  const { error } = await supabase
    .from("tasks")
    .upsert(rows, { onConflict: "id" });

  if (error) throw new Error(`upsertTasks: ${error.message}`);
}
