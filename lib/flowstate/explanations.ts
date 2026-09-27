/**
 * FlowState Explanation Engine
 *
 * Generates deterministic, human-readable explanations for KEEP / REDUCE / MOVE
 * decisions based on the same variables used by the scheduler.
 * Does not call an LLM.
 */

import { Task, DailyState } from "@/types";
import { deadlineUrgency } from "./priority";
import { calculateCapacity } from "./capacity";

// ── KEEP explanations ─────────────────────────────────────────────────────────

export function keepReason(task: Task, dailyState: DailyState): string {
  const urgency = deadlineUrgency(task.deadline);
  const cap = calculateCapacity(dailyState);

  if (urgency === "overdue") {
    return `Kept because this task is overdue. It must be addressed today.`;
  }
  if (urgency === "today") {
    return `Kept because the deadline is today. This must be completed before the end of the day.`;
  }
  if (urgency === "tomorrow") {
    return `Kept because the deadline is tomorrow and the task fits within today's capacity of ${cap}m.`;
  }
  if (task.priority === "Urgent" || task.priority === "High") {
    return `Kept because this is a high-priority task and its estimated duration fits today's available capacity.`;
  }
  return `Kept because the task is important and can realistically be completed within today's capacity.`;
}

// ── REDUCE explanations ───────────────────────────────────────────────────────

export function reduceReason(
  task: Task,
  plannedMinutes: number,
  _dailyState: DailyState
): string {
  const original = task.estimatedDuration - (task.completedMinutes ?? 0);
  return (
    `Reduced from ${original}m to ${plannedMinutes}m because the task is important but its full ` +
    `estimated duration exceeds today's remaining capacity. A focused block has been allocated to make meaningful progress.`
  );
}

// ── MOVE explanations ─────────────────────────────────────────────────────────

export function moveReason(task: Task, _dailyState: DailyState): string {
  const urgency = deadlineUrgency(task.deadline);

  if (urgency === "none") {
    return `Moved because the task has no firm deadline and today's capacity should be reserved for more urgent work.`;
  }
  if (urgency === "later" || urgency === "next-week") {
    return `Moved because the deadline is not imminent and higher-urgency tasks have consumed today's available capacity.`;
  }
  if (task.priority === "Low") {
    return `Moved because this is a low-priority task. Today's limited capacity is better spent on more critical work.`;
  }
  return `Moved because today's remaining capacity cannot accommodate this task alongside higher-priority work.`;
}
