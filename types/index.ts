// ── Core primitive types ──────────────────────────────────────────────────────
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type Status = "Pending" | "In Progress" | "Completed" | "Incomplete";
export type Category = "Academics" | "Projects" | "Personal" | "Exams";
export type PlanAction = "KEEP" | "REDUCE" | "MOVE" | "NONE";
export type WorkloadStatus = "BALANCED" | "TIGHT" | "OVERLOADED";
export type HistoryAction = "planned" | "started" | "completed" | "moved" | "reduced" | "missed" | "rescheduled" | "created";

// ── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  category: Category;
  /** Human-readable deadline: "Today", "Tomorrow", "Next Week", "No Deadline", ISO date string */
  deadline: string;
  estimatedDuration: number;   // minutes
  completedMinutes: number;    // minutes actually logged
  priority: Priority;
  status: Status;
  planAction: PlanAction;
  plannedMinutes?: number;     // minutes allocated by scheduler for today
  plannedDate?: string;        // ISO date string (YYYY-MM-DD) for when work is planned
  moveReason?: string;         // explanation text from engine
  urgencyScore?: number;       // computed by urgency engine, 0-100
  createdAt: string;           // ISO date string
}

// ── Daily State ───────────────────────────────────────────────────────────────
export interface DailyState {
  energy: number;         // 1-10
  stress: number;         // 1-10
  availableTime: number;  // minutes
  sleep: number;          // hours
}

// ── User Profile ──────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  focusArea: string;
}

// ── Plan Item (output of scheduler) ──────────────────────────────────────────
export interface PlanItem {
  taskId: string;
  decision: "KEEP" | "REDUCE" | "MOVE";
  plannedMinutes: number;
  plannedDate: string;   // ISO YYYY-MM-DD
  reason: string;
}

// ── Minimum Viable Day ────────────────────────────────────────────────────────
export interface MVDResult {
  tasks: Task[];
  totalMinutes: number;
  remainingCapacity: number;
  explanation: string;
}

// ── Workload analysis ─────────────────────────────────────────────────────────
export interface WorkloadAnalysis {
  totalWorkload: number;       // minutes of remaining work
  capacity: number;            // computed effective capacity
  overload: number;            // minutes over capacity (0 if balanced)
  status: WorkloadStatus;
}

// ── Task History ──────────────────────────────────────────────────────────────
export interface TaskHistory {
  id: string;
  taskId: string;
  taskTitle: string;
  date: string;              // ISO date string
  action: HistoryAction;
  previousStatus?: Status;
  newStatus?: Status;
  plannedMinutes?: number;
  actualMinutes?: number;
  note?: string;
}

// ── Daily Summary ─────────────────────────────────────────────────────────────
export interface DailySummary {
  date: string;              // YYYY-MM-DD
  availableMinutes: number;
  capacityMinutes: number;
  workloadMinutes: number;
  plannedMinutes: number;
  completedMinutes: number;
  movedMinutes: number;
  missedMinutes: number;
  energy: number;
  stress: number;
  sleep: number;
  status: WorkloadStatus;
}

// ── AI Advanced Capture Types ──────────────────────────────────────────────────
export interface ParsedTask {
  title: string;
  category: Category | null;
  deadline: string | null;
  estimatedMinutes: number | null;
  priority: Priority;
  rawTemporalPhrase?: string | null;
}

export interface SubtaskSuggestion {
  title: string;
  estimatedMinutes: number;
}

export interface TaskBreakdown {
  subtasks: SubtaskSuggestion[];
}

export interface AIError {
  error: string;
  code?: "INVALID_INPUT" | "RATE_LIMIT" | "GROQ_UNAVAILABLE" | "VALIDATION_ERROR" | "PARSE_ERROR";
}
