/**
 * FlowState Data Layer — Daily State & Summaries
 */

import { supabase } from "@/lib/supabase/client";
import { DailyState, DailySummary, TaskHistory } from "@/types";

// ── Daily State ───────────────────────────────────────────────

interface DailyStateRow {
  id: string;
  user_id: string;
  date: string;
  energy: number;
  stress: number;
  available_minutes: number;
  sleep_hours: number | null;
  capacity_minutes: number | null;
  created_at: string;
  updated_at: string;
}

function rowToDailyState(row: DailyStateRow): DailyState {
  return {
    energy: row.energy,
    stress: row.stress,
    availableTime: row.available_minutes,
    sleep: row.sleep_hours ?? 7,
  };
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export async function getTodayState(userId: string): Promise<DailyState | null> {
  let { data, error } = await supabase
    .from("daily_states")
    .select("*")
    .eq("user_id", userId)
    .eq("date", todayISO())
    .single();

  if (error && (error.message?.includes("future") || error.message?.includes("JWT"))) {
    await new Promise((res) => setTimeout(res, 1500));
    const retry = await supabase
      .from("daily_states")
      .select("*")
      .eq("user_id", userId)
      .eq("date", todayISO())
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (error.code === "PGRST116") return null;
    console.warn(`getTodayState: ${error.message}`);
    return null;
  }
  return data ? rowToDailyState(data as DailyStateRow) : null;
}

export async function upsertDailyState(
  userId: string,
  state: DailyState,
  capacityMinutes?: number
): Promise<void> {
  const { error } = await supabase.from("daily_states").upsert(
    {
      user_id: userId,
      date: todayISO(),
      energy: state.energy,
      stress: state.stress,
      available_minutes: state.availableTime,
      sleep_hours: state.sleep,
      capacity_minutes: capacityMinutes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );

  if (error) throw new Error(`upsertDailyState: ${error.message}`);
}

export async function getRecentDailyStates(
  userId: string,
  days = 7
): Promise<{ date: string; energy: number; stress: number; sleep: number; capacity: number }[]> {
  const { data, error } = await supabase
    .from("daily_states")
    .select("date, energy, stress, sleep_hours, capacity_minutes")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .limit(days);

  if (error) {
    console.warn(`getRecentDailyStates: ${error.message}`);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) || []).map((row) => ({
    date: row.date,
    energy: row.energy,
    stress: row.stress,
    sleep: Number(row.sleep_hours) || 7,
    capacity: row.capacity_minutes || 0,
  }));
}

// ── Task History ──────────────────────────────────────────────

interface TaskHistoryRow {
  id: string;
  user_id: string;
  task_id: string | null;
  task_title: string;
  date: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  planned_minutes: number | null;
  actual_minutes: number | null;
  note: string | null;
  created_at: string;
}

function rowToHistory(row: TaskHistoryRow): TaskHistory {
  return {
    id: row.id,
    taskId: row.task_id ?? "",
    taskTitle: row.task_title,
    date: row.date,
    action: row.action as TaskHistory["action"],
    previousStatus: (row.previous_status as TaskHistory["previousStatus"]) ?? undefined,
    newStatus: (row.new_status as TaskHistory["newStatus"]) ?? undefined,
    plannedMinutes: row.planned_minutes ?? undefined,
    actualMinutes: row.actual_minutes ?? undefined,
    note: row.note ?? undefined,
  };
}

export async function getRecentHistory(userId: string, limit = 50): Promise<TaskHistory[]> {
  let { data, error } = await supabase
    .from("task_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error && (error.message?.includes("future") || error.message?.includes("JWT"))) {
    await new Promise((res) => setTimeout(res, 1500));
    const retry = await supabase
      .from("task_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.warn(`getRecentHistory: ${error.message}`);
    return [];
  }
  return ((data as TaskHistoryRow[]) || []).map(rowToHistory);
}

export async function insertHistoryEvent(
  userId: string,
  event: Omit<TaskHistory, "id">
): Promise<void> {
  const { error } = await supabase.from("task_history").insert({
    user_id: userId,
    task_id: event.taskId || null,
    task_title: event.taskTitle,
    date: event.date,
    action: event.action,
    previous_status: event.previousStatus ?? null,
    new_status: event.newStatus ?? null,
    planned_minutes: event.plannedMinutes ?? null,
    actual_minutes: event.actualMinutes ?? null,
    note: event.note ?? null,
  });

  if (error) throw new Error(`insertHistoryEvent: ${error.message}`);
}

// ── Daily Summaries ───────────────────────────────────────────

export async function upsertDailySummary(
  userId: string,
  summary: DailySummary
): Promise<void> {
  const { error } = await supabase.from("daily_summaries").upsert(
    {
      user_id: userId,
      date: summary.date,
      available_minutes: summary.availableMinutes,
      capacity_minutes: summary.capacityMinutes,
      workload_minutes: summary.workloadMinutes,
      planned_minutes: summary.plannedMinutes,
      completed_minutes: summary.completedMinutes,
      moved_minutes: summary.movedMinutes,
      missed_minutes: summary.missedMinutes,
      energy: summary.energy,
      stress: summary.stress,
      sleep_hours: summary.sleep,
      status: summary.status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );

  if (error) throw new Error(`upsertDailySummary: ${error.message}`);
}

export async function getRecentSummaries(userId: string, days = 30): Promise<DailySummary[]> {
  const { data, error } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(days);

  if (error) throw new Error(`getRecentSummaries: ${error.message}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    date: row.date,
    availableMinutes: row.available_minutes,
    capacityMinutes: row.capacity_minutes,
    workloadMinutes: row.workload_minutes,
    plannedMinutes: row.planned_minutes,
    completedMinutes: row.completed_minutes,
    movedMinutes: row.moved_minutes,
    missedMinutes: row.missed_minutes,
    energy: row.energy,
    stress: row.stress,
    sleep: row.sleep_hours,
    status: row.status,
  })) as DailySummary[];
}
