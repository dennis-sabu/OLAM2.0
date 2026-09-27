/**
 * FlowState Workload Engine
 *
 * Calculates remaining workload from tasks and compares it against capacity
 * to produce a WorkloadAnalysis.
 */

import { Task, WorkloadAnalysis, WorkloadStatus } from "@/types";

// ── Thresholds ────────────────────────────────────────────────────────────────

/** Tight threshold: workload within this many minutes of capacity triggers TIGHT */
const TIGHT_BUFFER_MINUTES = 20;

// ── Remaining minutes per task ────────────────────────────────────────────────

export function remainingMinutes(task: Task): number {
  return Math.max(0, task.estimatedDuration - (task.completedMinutes ?? 0));
}

// ── Total workload ────────────────────────────────────────────────────────────

/**
 * Returns total remaining work across all tasks that are not yet completed
 * and not explicitly moved to a future date.
 */
export function calculateWorkload(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status !== "Completed" && t.planAction !== "MOVE")
    .reduce((sum, t) => sum + remainingMinutes(t), 0);
}

/**
 * Returns total workload for tasks active today (not moved, not completed).
 * Used by dashboard and planner for "today's workload".
 */
export function todaysWorkload(tasks: Task[]): number {
  return tasks
    .filter(
      (t) =>
        t.status !== "Completed" &&
        t.planAction !== "MOVE" &&
        (t.deadline === "Today" ||
          t.deadline === "Tomorrow" ||
          t.status === "In Progress" ||
          t.planAction === "KEEP" ||
          t.planAction === "REDUCE")
    )
    .reduce((sum, t) => {
      // For REDUCE tasks use their plannedMinutes if set; else full duration
      const mins =
        t.planAction === "REDUCE" && t.plannedMinutes
          ? t.plannedMinutes
          : remainingMinutes(t);
      return sum + mins;
    }, 0);
}

// ── Status classification ─────────────────────────────────────────────────────

export function workloadStatus(workload: number, capacity: number): WorkloadStatus {
  if (workload <= capacity - TIGHT_BUFFER_MINUTES) return "BALANCED";
  if (workload <= capacity) return "TIGHT";
  return "OVERLOADED";
}

// ── Full analysis ─────────────────────────────────────────────────────────────

export function analyseWorkload(tasks: Task[], capacity: number): WorkloadAnalysis {
  const totalWorkload = todaysWorkload(tasks);
  const overload = Math.max(0, totalWorkload - capacity);
  const status = workloadStatus(totalWorkload, capacity);

  return { totalWorkload, capacity, overload, status };
}
