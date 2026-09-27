/**
 * FlowState Minimum Viable Day Engine
 *
 * Identifies the smallest realistic set of important work for today.
 * The goal is NOT to maximize tasks — it's to define the minimum that
 * constitutes a successful day.
 *
 * Priority order:
 * 1. Overdue work
 * 2. Tasks due today
 * 3. Urgent/High-priority tasks
 * 4. Important near-term deadlines (tomorrow / this-week)
 * 5. Meaningful project milestones
 */

import { Task, DailyState, MVDResult } from "@/types";
import { calculateCapacity } from "./capacity";
import { remainingMinutes } from "./workload";
import { taskUrgencyScore, deadlineUrgency } from "./priority";

// ── MVD eligibility ───────────────────────────────────────────────────────────

/** A task is MVD-eligible if it is not completed and not low-urgency filler. */
function isMVDEligible(task: Task): boolean {
  if (task.status === "Completed") return false;
  if (task.planAction === "MOVE") return false;

  const urgency = deadlineUrgency(task.deadline);
  const isPriorityWorthy =
    task.priority === "Urgent" ||
    task.priority === "High" ||
    urgency === "overdue" ||
    urgency === "today" ||
    urgency === "tomorrow";

  return isPriorityWorthy;
}

// ── Main MVD calculation ──────────────────────────────────────────────────────

export function calculateMinimumViableDay(
  tasks: Task[],
  dailyState: DailyState
): MVDResult {
  const capacity = calculateCapacity(dailyState);

  // Eligible tasks sorted by urgency
  const eligible = tasks
    .filter(isMVDEligible)
    .sort((a, b) => taskUrgencyScore(b) - taskUrgencyScore(a));

  const selected: Task[] = [];
  let usedMinutes = 0;

  for (const task of eligible) {
    const needed = remainingMinutes(task);
    if (needed <= 0) continue;

    // Use full duration if it fits, otherwise skip (MVD is strict — don't partially fill)
    if (usedMinutes + needed <= capacity) {
      selected.push(task);
      usedMinutes += needed;
    }
    // Don't REDUCE in MVD — only include tasks that fully fit
  }

  const remainingCapacity = Math.max(0, capacity - usedMinutes);

  let explanation: string;
  if (selected.length === 0) {
    explanation = `No critical tasks found for today. Your capacity is ${capacity}m — great time to get ahead on upcoming work.`;
  } else {
    explanation =
      `Your MVD requires ${usedMinutes}m of your ${capacity}m capacity. ` +
      `Complete these ${selected.length} task${selected.length > 1 ? "s" : ""} to have a successful day, ` +
      `regardless of what else happens.`;
  }

  return {
    tasks: selected,
    totalMinutes: usedMinutes,
    remainingCapacity,
    explanation,
  };
}
