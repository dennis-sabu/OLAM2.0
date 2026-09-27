/**
 * FlowState Scheduler
 *
 * Receives tasks + daily state and returns a list of PlanItems with
 * deterministic KEEP / REDUCE / MOVE decisions.
 *
 * Algorithm:
 * 1. Score and sort tasks by urgency.
 * 2. Fill capacity greedily from highest urgency to lowest.
 *    - KEEP if the full remaining duration fits.
 *    - REDUCE if the task is too important to skip but only a focused
 *      block fits.
 *    - MOVE if neither KEEP nor REDUCE is possible/warranted.
 * 3. Return PlanItems — one per incomplete task.
 *
 * The scheduler is deterministic: the same input always produces the same output.
 */

import { Task, DailyState, PlanItem } from "@/types";
import { calculateCapacity } from "./capacity";
import { remainingMinutes } from "./workload";
import { taskUrgencyScore, deadlineUrgency, sortByUrgency } from "./priority";
import { keepReason, reduceReason, moveReason } from "./explanations";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Minimum urgency score required for a REDUCE (rather than MOVE).
 * Tasks below this threshold get moved if they don't fully fit.
 */
const REDUCE_URGENCY_THRESHOLD = 35;

/**
 * Minimum focused block size (minutes) for a REDUCE decision.
 * We won't schedule fewer than this for a partial session.
 */
const MIN_REDUCE_BLOCK = 20;

/**
 * When reducing, cap the planned block at this fraction of remaining duration.
 * Ensures the block is meaningful but not misleading.
 */
const REDUCE_BLOCK_FRACTION = 0.5;

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/**
 * Choose a sensible planned date for a MOVE'd task based on its deadline.
 * Never schedules past the deadline itself.
 */
function movePlannedDate(task: Task): string {
  const urgency = deadlineUrgency(task.deadline);
  switch (urgency) {
    case "overdue":
    case "today":
      // Should not be moved, but if forced, keep today
      return todayISO();
    case "tomorrow":
      return tomorrowISO();
    case "this-week":
      return daysFromNow(2);
    case "next-week":
      return daysFromNow(4);
    default:
      return daysFromNow(3);
  }
}

// ── Main scheduler ────────────────────────────────────────────────────────────

export function schedule(
  tasks: Task[],
  dailyState: DailyState
): PlanItem[] {
  const capacity = calculateCapacity(dailyState);
  let remainingCapacity = capacity;
  const today = todayISO();

  // Only consider incomplete tasks
  const eligible = tasks.filter(
    (t) => t.status !== "Completed"
  );

  // Sort by urgency descending
  const sorted = sortByUrgency(eligible);

  const plan: PlanItem[] = [];

  for (const task of sorted) {
    const needed = remainingMinutes(task);
    const urgency = taskUrgencyScore(task);
    const du = deadlineUrgency(task.deadline);

    // Task already completed — skip
    if (needed <= 0) continue;

    if (remainingCapacity <= 0) {
      // No capacity left — move everything
      plan.push({
        taskId: task.id,
        decision: "MOVE",
        plannedMinutes: 0,
        plannedDate: movePlannedDate(task),
        reason: moveReason(task, dailyState),
      });
      continue;
    }

    if (needed <= remainingCapacity) {
      // Full task fits — KEEP
      plan.push({
        taskId: task.id,
        decision: "KEEP",
        plannedMinutes: needed,
        plannedDate: today,
        reason: keepReason(task, dailyState),
      });
      remainingCapacity -= needed;
    } else {
      // Doesn't fully fit
      const blockSize = Math.max(
        MIN_REDUCE_BLOCK,
        Math.min(remainingCapacity, Math.round(needed * REDUCE_BLOCK_FRACTION))
      );

      if (urgency >= REDUCE_URGENCY_THRESHOLD && blockSize <= remainingCapacity) {
        // Important enough to REDUCE — schedule a focused block
        plan.push({
          taskId: task.id,
          decision: "REDUCE",
          plannedMinutes: blockSize,
          plannedDate: today,
          reason: reduceReason(task, blockSize, dailyState),
        });
        remainingCapacity -= blockSize;
      } else {
        // Not critical enough — MOVE
        plan.push({
          taskId: task.id,
          decision: "MOVE",
          plannedMinutes: 0,
          plannedDate: movePlannedDate(task),
          reason: moveReason(task, dailyState),
        });
      }
    }
  }

  // Tasks with no urgency data that weren't in sorted list — shouldn't happen but guard
  return plan;
}

/**
 * Apply PlanItems back onto Task objects, returning updated tasks.
 * Used by FlowStateProvider to sync decisions to task state.
 */
export function applyPlanToTasks(tasks: Task[], plan: PlanItem[]): Task[] {
  const planMap = new Map(plan.map((p) => [p.taskId, p]));

  return tasks.map((task) => {
    const item = planMap.get(task.id);
    if (!item) return task; // completed or no-plan tasks unchanged

    return {
      ...task,
      planAction: item.decision,
      plannedMinutes: item.plannedMinutes,
      plannedDate: item.plannedDate,
      moveReason: item.reason,
      urgencyScore: taskUrgencyScore(task),
    };
  });
}
