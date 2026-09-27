import { Task, DailyState, UserProfile } from "@/types";

export const mockProfile: UserProfile = {
  name: "Alex",
  focusArea: "Academics",
};

export const mockDailyState: DailyState = {
  energy: 6,
  stress: 5,
  availableTime: 210, // 3h 30m — matches Phase 2 demo scenario
  sleep: 7,
};

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Electronics Assignment",
    category: "Academics",
    deadline: "Tomorrow",
    estimatedDuration: 90,
    completedMinutes: 0,
    priority: "High",
    status: "Pending",
    planAction: "NONE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Mathematics Preparation",
    category: "Academics",
    deadline: "Tomorrow",
    estimatedDuration: 60,
    completedMinutes: 0,
    priority: "High",
    status: "Pending",
    planAction: "NONE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Project Report",
    category: "Projects",
    deadline: "Next Week",
    estimatedDuration: 120,
    completedMinutes: 0,
    priority: "Medium",
    status: "Pending",
    planAction: "NONE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t4",
    title: "Java Practice (Interfaces)",
    category: "Personal",
    deadline: "No Deadline",
    estimatedDuration: 60,
    completedMinutes: 0,
    priority: "Low",
    status: "Pending",
    planAction: "NONE",
    createdAt: new Date().toISOString(),
  },
];

// ── Utility kept for backwards compatibility ──────────────────────────────────

/** @deprecated Use analyseWorkload from @/lib/flowstate instead */
export const calculateDashboardStats = (tasks: Task[], state: DailyState) => {
  const totalWorkload = tasks.reduce(
    (acc, t) => acc + (t.planAction !== "MOVE" ? t.estimatedDuration : 0),
    0
  );
  const capacity = state.availableTime;
  const overload = totalWorkload > capacity ? totalWorkload - capacity : 0;
  return { totalWorkload, capacity, overload };
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};
