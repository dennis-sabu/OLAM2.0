/**
 * FlowState History Engine
 *
 * Creates and manages TaskHistory and DailySummary records.
 * All data is stored locally (localStorage) for now.
 */

import { Task, TaskHistory, DailySummary, DailyState, WorkloadStatus, HistoryAction, Status } from "@/types";
import { calculateCapacity } from "./capacity";
import { analyseWorkload } from "./workload";

// ── ID generation ─────────────────────────────────────────────────────────────

function historyId(): string {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ── History event factory ─────────────────────────────────────────────────────

export function createHistoryEvent(params: {
  task: Task;
  action: HistoryAction;
  previousStatus?: Status;
  newStatus?: Status;
  plannedMinutes?: number;
  actualMinutes?: number;
  note?: string;
}): TaskHistory {
  return {
    id: historyId(),
    taskId: params.task.id,
    taskTitle: params.task.title,
    date: todayISO(),
    action: params.action,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    plannedMinutes: params.plannedMinutes,
    actualMinutes: params.actualMinutes,
    note: params.note,
  };
}

// ── DailySummary ──────────────────────────────────────────────────────────────

export function buildDailySummary(
  tasks: Task[],
  dailyState: DailyState
): DailySummary {
  const capacity = calculateCapacity(dailyState);
  const analysis = analyseWorkload(tasks, capacity);

  const completedMinutes = tasks
    .filter((t) => t.status === "Completed")
    .reduce((s, t) => s + (t.completedMinutes ?? t.estimatedDuration), 0);

  const movedMinutes = tasks
    .filter((t) => t.planAction === "MOVE")
    .reduce((s, t) => s + t.estimatedDuration, 0);

  const missedMinutes = tasks
    .filter((t) => t.status === "Incomplete")
    .reduce((s, t) => s + (t.estimatedDuration - (t.completedMinutes ?? 0)), 0);

  const plannedMinutes = tasks
    .filter((t) => t.planAction === "KEEP" || t.planAction === "REDUCE")
    .reduce((s, t) => s + (t.plannedMinutes ?? t.estimatedDuration), 0);

  return {
    date: todayISO(),
    availableMinutes: dailyState.availableTime,
    capacityMinutes: capacity,
    workloadMinutes: analysis.totalWorkload,
    plannedMinutes,
    completedMinutes,
    movedMinutes,
    missedMinutes,
    energy: dailyState.energy,
    stress: dailyState.stress,
    sleep: dailyState.sleep,
    status: analysis.status,
  };
}

// ── localStorage persistence ──────────────────────────────────────────────────

const HISTORY_KEY = "fs_history";
const SUMMARIES_KEY = "fs_summaries";

export function loadHistory(): TaskHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as TaskHistory[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: TaskHistory[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function appendHistory(event: TaskHistory): TaskHistory[] {
  const existing = loadHistory();
  const updated = [event, ...existing].slice(0, 500); // keep last 500 events
  saveHistory(updated);
  return updated;
}

export function loadSummaries(): DailySummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUMMARIES_KEY);
    return raw ? (JSON.parse(raw) as DailySummary[]) : [];
  } catch {
    return [];
  }
}

export function saveDailySummary(summary: DailySummary): DailySummary[] {
  const existing = loadSummaries();
  // Replace today's summary if it exists
  const filtered = existing.filter((s) => s.date !== summary.date);
  const updated = [summary, ...filtered].slice(0, 90); // keep 90 days
  localStorage.setItem(SUMMARIES_KEY, JSON.stringify(updated));
  return updated;
}
