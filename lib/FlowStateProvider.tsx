"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Task, DailyState, UserProfile, PlanItem, MVDResult, WorkloadAnalysis, TaskHistory } from "@/types";
import { mockDailyState, mockProfile } from "./mockData";
import {
  schedule,
  applyPlanToTasks,
  calculateCapacity,
  analyseWorkload,
  calculateMinimumViableDay,
  createHistoryEvent,
  buildDailySummary,
} from "./flowstate";
import { useAuth } from "./auth/AuthProvider";
import { getTasks, createTask, updateTaskInDB, deleteTaskFromDB, upsertTasks } from "@/lib/data/tasks";
import { getProfile, upsertProfile } from "@/lib/data/profile";
import { getTodayState, upsertDailyState, getRecentHistory, insertHistoryEvent, upsertDailySummary } from "@/lib/data/state";

// ── Context shape ─────────────────────────────────────────────

interface FlowStateContextType {
  tasks: Task[];
  state: DailyState;
  profile: UserProfile;
  history: TaskHistory[];
  plan: PlanItem[];
  mvd: MVDResult;
  analysis: WorkloadAnalysis;
  capacity: number;
  isLoading: boolean;
  error: string | null;

  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  markIncomplete: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDeadline: string) => Promise<void>;
  setState: (state: DailyState) => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  recalculatePlan: () => void;
  clearError: () => void;
}

const FlowStateContext = createContext<FlowStateContextType | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────

const EMPTY_MVD: MVDResult = { tasks: [], totalMinutes: 0, remainingCapacity: 0, explanation: "" };
const EMPTY_ANALYSIS: WorkloadAnalysis = { totalWorkload: 0, capacity: 0, overload: 0, status: "BALANCED" };

// ── Provider ──────────────────────────────────────────────────

export function FlowStateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [tasks, setTasksRaw] = useState<Task[]>([]);
  const [dailyState, setDailyStateRaw] = useState<DailyState>(mockDailyState);
  const [profile, setProfileRaw] = useState<UserProfile>(mockProfile);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [mvd, setMvd] = useState<MVDResult>(EMPTY_MVD);
  const [analysis, setAnalysis] = useState<WorkloadAnalysis>(EMPTY_ANALYSIS);
  const [capacity, setCapacity] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Engine run ──────────────────────────────────────────────

  const runEngine = useCallback((currentTasks: Task[], currentState: DailyState): Task[] => {
    const cap = calculateCapacity(currentState);
    const newPlan = schedule(currentTasks, currentState);
    const tasksWithPlan = applyPlanToTasks(currentTasks, newPlan);
    const newAnalysis = analyseWorkload(tasksWithPlan, cap);
    const newMvd = calculateMinimumViableDay(tasksWithPlan, currentState);

    setPlan(newPlan);
    setAnalysis(newAnalysis);
    setMvd(newMvd);
    setCapacity(cap);

    return tasksWithPlan;
  }, []);

  // ── Load all data from Supabase on user change ──────────────

  useEffect(() => {
    if (!user) {
      // Unauthenticated: reset to clean state
      setTasksRaw([]);
      setPlan([]);
      setAnalysis(EMPTY_ANALYSIS);
      setMvd(EMPTY_MVD);
      setCapacity(0);
      setHistory([]);
      setIsLoading(false);
      return;
    }

    async function loadAll() {
      setIsLoading(true);
      setError(null);
      try {
        const [loadedTasks, loadedProfile, loadedState, loadedHistory] = await Promise.all([
          getTasks(),
          getProfile(user!.id),
          getTodayState(user!.id),
          getRecentHistory(user!.id, 50),
        ]);

        const userMetaName = user!.user_metadata?.name || user!.user_metadata?.full_name;
        const fallbackName = userMetaName || (user!.email ? user!.email.split("@")[0] : "Student");
        const resolvedName = (loadedProfile?.name && loadedProfile.name.trim().length > 0)
          ? loadedProfile.name.trim()
          : fallbackName;

        const resolvedProfile: UserProfile = {
          name: resolvedName,
          focusArea: loadedProfile?.focusArea || "Academics",
        };

        // If DB had empty or missing name, save the resolved name to Supabase
        if (!loadedProfile?.name || !loadedProfile.name.trim()) {
          upsertProfile(user!.id, resolvedProfile, user!.email).catch(() => {});
        }

        const resolvedState = loadedState ?? mockDailyState;

        setProfileRaw(resolvedProfile);
        setDailyStateRaw(resolvedState);
        setHistory(loadedHistory);

        const tasksWithPlan = runEngine(loadedTasks, resolvedState);
        setTasksRaw(tasksWithPlan);
      } catch (e) {
        setError(`Failed to load your data: ${(e as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadAll();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist summary after state settles ─────────────────────

  useEffect(() => {
    if (!user || isLoading || tasks.length === 0) return;
    const summary = buildDailySummary(tasks, dailyState);
    upsertDailySummary(user.id, summary).catch(() => {/* non-critical */});
  }, [tasks, dailyState, user?.id, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── recalculatePlan ─────────────────────────────────────────

  const recalculatePlan = useCallback(() => {
    setTasksRaw((currentTasks) => {
      const updated = runEngine(currentTasks, dailyState);
      if (user) {
        upsertTasks(updated, user.id).catch((e) => setError(`Sync error: ${e.message}`));
      }
      return updated;
    });
  }, [runEngine, dailyState, user]);

  // ── Helper: push a history event to Supabase + local state ──

  const pushHistory = useCallback(async (event: Omit<TaskHistory, "id">) => {
    setHistory((prev) => [{ ...event, id: `local-${Date.now()}` }, ...prev]);
    if (user) {
      try {
        await insertHistoryEvent(user.id, event);
      } catch {
        // non-critical — local history already updated
      }
    }
  }, [user]);

  // ── Task mutations ──────────────────────────────────────────

  const addTask = useCallback(async (taskInput: Omit<Task, "id" | "createdAt">) => {
    if (!user) return;
    setError(null);
    try {
      const created = await createTask(taskInput, user.id);
      setTasksRaw((prev) => {
        const updated = runEngine([...prev, created], dailyState);
        upsertTasks(updated, user.id).catch(() => {});
        return updated;
      });
      const evt = createHistoryEvent({ task: { ...created }, action: "created", newStatus: created.status });
      await pushHistory(evt);
    } catch (e) {
      setError(`Failed to add task: ${(e as Error).message}`);
    }
  }, [user, runEngine, dailyState, pushHistory]);

  const updateTask = useCallback(async (task: Task) => {
    if (!user) return;
    setError(null);
    // Optimistic update
    setTasksRaw((prev) => {
      const updated = prev.map((t) => (t.id === task.id ? task : t));
      const withPlan = runEngine(updated, dailyState);
      upsertTasks(withPlan, user.id).catch(() => {});
      return withPlan;
    });
    try {
      await updateTaskInDB(task, user.id);
    } catch (e) {
      // Rollback not implemented for simplicity — re-fetch if needed
      setError(`Failed to update task: ${(e as Error).message}`);
    }
  }, [user, runEngine, dailyState]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    setError(null);
    setTasksRaw((prev) => {
      const updated = runEngine(prev.filter((t) => t.id !== id), dailyState);
      return updated;
    });
    try {
      await deleteTaskFromDB(id);
    } catch (e) {
      setError(`Failed to delete task: ${(e as Error).message}`);
    }
  }, [user, runEngine, dailyState]);

  const completeTask = useCallback(async (id: string) => {
    if (!user) return;
    setError(null);
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const completed: Task = { ...task, status: "Completed", completedMinutes: task.estimatedDuration };

    setTasksRaw((prev) => {
      const updated = prev.map((t) => t.id === id ? completed : t);
      const withPlan = runEngine(updated, dailyState);
      upsertTasks(withPlan, user.id).catch(() => {});
      return withPlan;
    });

    try {
      await updateTaskInDB(completed, user.id);
      await pushHistory(createHistoryEvent({
        task: completed,
        action: "completed",
        previousStatus: task.status,
        newStatus: "Completed",
        actualMinutes: task.estimatedDuration,
        plannedMinutes: task.plannedMinutes,
      }));
    } catch (e) {
      setError(`Failed to complete task: ${(e as Error).message}`);
    }
  }, [user, tasks, runEngine, dailyState, pushHistory]);

  const markIncomplete = useCallback(async (id: string) => {
    if (!user) return;
    setError(null);
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const incomplete: Task = { ...task, status: "Incomplete" };

    setTasksRaw((prev) => {
      const updated = prev.map((t) => t.id === id ? incomplete : t);
      const withPlan = runEngine(updated, dailyState);
      upsertTasks(withPlan, user.id).catch(() => {});
      return withPlan;
    });

    try {
      await updateTaskInDB(incomplete, user.id);
      await pushHistory(createHistoryEvent({
        task: incomplete,
        action: "missed",
        previousStatus: task.status,
        newStatus: "Incomplete",
        plannedMinutes: task.plannedMinutes,
      }));
    } catch (e) {
      setError(`Failed to update task: ${(e as Error).message}`);
    }
  }, [user, tasks, runEngine, dailyState, pushHistory]);

  const rescheduleTask = useCallback(async (id: string, newDeadline: string) => {
    if (!user) return;
    setError(null);
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const rescheduled: Task = { ...task, deadline: newDeadline, planAction: "NONE" };

    setTasksRaw((prev) => {
      const updated = prev.map((t) => t.id === id ? rescheduled : t);
      const withPlan = runEngine(updated, dailyState);
      upsertTasks(withPlan, user.id).catch(() => {});
      return withPlan;
    });

    try {
      await updateTaskInDB(rescheduled, user.id);
      await pushHistory(createHistoryEvent({
        task: rescheduled,
        action: "rescheduled",
        note: `Rescheduled to: ${newDeadline}`,
      }));
    } catch (e) {
      setError(`Failed to reschedule task: ${(e as Error).message}`);
    }
  }, [user, tasks, runEngine, dailyState, pushHistory]);

  // ── State mutations ─────────────────────────────────────────

  const setState = useCallback(async (newState: DailyState) => {
    setDailyStateRaw(newState);
    setTasksRaw((currentTasks) => {
      const updated = runEngine(currentTasks, newState);
      if (user) {
        upsertTasks(updated, user.id).catch(() => {});
        const cap = calculateCapacity(newState);
        upsertDailyState(user.id, newState, cap).catch(() => {});
      }
      return updated;
    });
  }, [runEngine, user]);

  const setProfile = useCallback(async (newProfile: UserProfile) => {
    setProfileRaw(newProfile);
    if (user) {
      try {
        await upsertProfile(user.id, newProfile, user.email);
      } catch (e) {
        setError(`Failed to save profile: ${(e as Error).message}`);
      }
    }
  }, [user]);

  // ── Render ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 font-ui text-sm">Loading FlowState…</p>
        </div>
      </div>
    );
  }

  return (
    <FlowStateContext.Provider
      value={{
        tasks,
        state: dailyState,
        profile,
        history,
        plan,
        mvd,
        analysis,
        capacity,
        isLoading,
        error,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        markIncomplete,
        rescheduleTask,
        setState,
        setProfile,
        recalculatePlan,
        clearError,
      }}
    >
      {children}
    </FlowStateContext.Provider>
  );
}

export function useFlowState() {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error("useFlowState must be used within a FlowStateProvider");
  }
  return context;
}
