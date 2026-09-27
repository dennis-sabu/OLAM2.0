/**
 * FlowState Engine — Public API
 *
 * Central re-export for all engine modules.
 * Import from here rather than individual engine files.
 */

// Capacity
export { calculateCapacity, capacityExplanation, energyFactor, stressFactor, sleepFactor } from "./capacity";

// Workload
export { calculateWorkload, todaysWorkload, analyseWorkload, workloadStatus, remainingMinutes } from "./workload";

// Priority & Urgency
export { taskUrgencyScore, deadlineUrgency, deadlineScore, sortByUrgency } from "./priority";
export type { DeadlineUrgency } from "./priority";

// Explanations
export { keepReason, reduceReason, moveReason } from "./explanations";

// Scheduler
export { schedule, applyPlanToTasks } from "./scheduler";

// Minimum Viable Day
export { calculateMinimumViableDay } from "./minimum-day";

// History
export {
  createHistoryEvent,
  buildDailySummary,
  loadHistory,
  saveHistory,
  appendHistory,
  loadSummaries,
  saveDailySummary,
} from "./history";

// ── Re-export formatDuration helper ──────────────────────────────────────────
export { formatDuration } from "../mockData";
