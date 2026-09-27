/**
 * FlowState Priority & Urgency Engine
 *
 * Computes a deterministic urgency score for each task based on deadline
 * proximity and task priority. Higher score = more urgent = should be
 * handled sooner / less likely to be MOVE'd.
 */

import { Task, Priority } from "@/types";

// ── Priority score mapping ────────────────────────────────────────────────────

const PRIORITY_SCORES: Record<Priority, number> = {
  Urgent: 40,
  High: 30,
  Medium: 20,
  Low: 10,
};

// ── Deadline urgency ──────────────────────────────────────────────────────────

export type DeadlineUrgency =
  | "overdue"
  | "today"
  | "tomorrow"
  | "this-week"
  | "next-week"
  | "later"
  | "none";

/**
 * Maps a deadline string to a normalized urgency category.
 * Accepts both human-readable strings and ISO date strings.
 */
export function deadlineUrgency(deadline: string): DeadlineUrgency {
  if (!deadline || deadline === "No Deadline") return "none";

  const dl = deadline.toLowerCase().trim();

  if (dl === "overdue" || dl === "yesterday") return "overdue";
  if (dl === "today") return "today";
  if (dl === "tomorrow") return "tomorrow";
  if (
    dl === "this week" ||
    dl === "in 3 days" ||
    dl === "in 4 days" ||
    dl === "in 5 days" ||
    dl === "in 6 days" ||
    dl === "in 2 days"
  )
    return "this-week";
  if (dl === "next week" || dl === "in 7 days" || dl === "in 8 days") return "next-week";

  // Try parsing an ISO date
  const date = new Date(deadline);
  if (!isNaN(date.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    if (diffDays <= 6) return "this-week";
    if (diffDays <= 13) return "next-week";
    return "later";
  }

  return "later";
}

/**
 * Returns a numeric deadline urgency score (0–60) — higher is more urgent.
 */
export function deadlineScore(deadline: string): number {
  const urgency = deadlineUrgency(deadline);
  const scores: Record<DeadlineUrgency, number> = {
    overdue: 60,
    today: 50,
    tomorrow: 40,
    "this-week": 25,
    "next-week": 15,
    later: 5,
    none: 0,
  };
  return scores[urgency];
}

/**
 * Returns a deterministic urgency score for a task (0–100).
 * Higher = more urgent = prioritize in plan.
 */
export function taskUrgencyScore(task: Task): number {
  const deadline = deadlineScore(task.deadline);
  const priority = PRIORITY_SCORES[task.priority] ?? 10;
  // Normalize to 0–100
  return Math.min(100, deadline + priority);
}

/**
 * Sorts tasks by urgency, highest first.
 */
export function sortByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => taskUrgencyScore(b) - taskUrgencyScore(a)
  );
}
