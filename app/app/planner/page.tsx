"use client";

import { useState, useEffect } from "react";
import {
  Clock, AlertTriangle, ArrowRightCircle, Battery, Brain, Check, RefreshCw,
} from "lucide-react";
import { formatDuration, calculateCapacity } from "@/lib/flowstate";
import { useFlowState } from "@/lib/FlowStateProvider";
import { useRouter } from "next/navigation";

export default function Planner() {
  const {
    tasks,
    state,
    setState,
    plan,
    analysis,
    capacity,
    updateTask,
    recalculatePlan,
  } = useFlowState();
  const router = useRouter();

  // Local overrides for capacity sliders (don't commit until Confirm)
  const [localEnergy, setLocalEnergy] = useState(state.energy);
  const [localTime, setLocalTime] = useState(state.availableTime);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocalEnergy(state.energy);
    setLocalTime(state.availableTime);
  }, [state.energy, state.availableTime]);

  // Compute preview capacity with local overrides
  const previewCapacity: number = calculateCapacity({ ...state, energy: localEnergy, availableTime: localTime });

  // Only show tasks that have a plan decision (not completed, not NONE)
  const plannerTasks = tasks.filter(
    (t) =>
      t.status !== "Completed" &&
      (t.planAction === "KEEP" || t.planAction === "REDUCE" || t.planAction === "MOVE")
  );

  // Local override of individual task decisions
  const [localOverrides, setLocalOverrides] = useState<Record<string, "KEEP" | "REDUCE" | "MOVE">>({});

  const getDecision = (taskId: string): "KEEP" | "REDUCE" | "MOVE" => {
    if (localOverrides[taskId]) return localOverrides[taskId];
    const planItem = plan.find((p) => p.taskId === taskId);
    return planItem?.decision ?? "MOVE";
  };

  const getReason = (taskId: string): string => {
    const planItem = plan.find((p) => p.taskId === taskId);
    return planItem?.reason ?? tasks.find((t) => t.id === taskId)?.moveReason ?? "";
  };

  const getPlannedMins = (taskId: string): number => {
    const planItem = plan.find((p) => p.taskId === taskId);
    return planItem?.plannedMinutes ?? tasks.find((t) => t.id === taskId)?.estimatedDuration ?? 0;
  };

  const overrideDecision = (id: string, action: "KEEP" | "REDUCE" | "MOVE") => {
    setLocalOverrides((prev) => ({ ...prev, [id]: action }));
  };

  // Calculated totals from current plan (including overrides)
  const plannedMinutes = plannerTasks.reduce((sum, task) => {
    const dec = getDecision(task.id);
    if (dec === "MOVE") return sum;
    return sum + (dec === "REDUCE" ? getPlannedMins(task.id) : task.estimatedDuration);
  }, 0);

  const handleConfirmPlan = async () => {
    try {
      setIsSubmitting(true);
      // Apply state changes
      await setState({ ...state, energy: localEnergy, availableTime: localTime });
      // Apply local overrides to tasks
      for (const task of plannerTasks) {
        if (localOverrides[task.id]) {
          await updateTask({ ...task, planAction: localOverrides[task.id] });
        }
      }
      recalculatePlan();
      router.push("/app/dashboard");
    } catch (err) {
      console.error("Failed to confirm plan:", err);
      setIsSubmitting(false);
    }
  };

  const isOverloaded = plannedMinutes > previewCapacity;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-28 animate-in fade-in duration-500">

      <header className="space-y-4">
        <h1 className="font-display text-3xl md:text-4xl text-white">Adaptive Planner</h1>
        <p className="font-ui text-white/60">
          FlowState analyzes your capacity and suggests realistic actions. Adjust if needed and confirm your plan.
        </p>
      </header>

      {/* Step 1 & 2: Capacity & Workload */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-white">1. Verify Capacity</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-ui text-white/80">
                <span>Available Time</span>
                <span className="font-bold">{formatDuration(localTime)}</span>
              </div>
              <input
                type="range" min="30" max="480" step="30"
                value={localTime}
                onChange={(e) => setLocalTime(Number(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-ui text-white/80">
                <span>Energy Level</span>
                <span className="font-bold">{localEnergy}/10</span>
              </div>
              <input
                type="range" min="1" max="10" step="1"
                value={localEnergy}
                onChange={(e) => setLocalEnergy(Number(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-2 p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-ui text-white/50">
              Effective capacity: <span className="text-primary font-bold">{formatDuration(previewCapacity)}</span>
            </div>
          </div>
        </div>

        <div
          className="glass-card p-6 space-y-4 border-l-4"
          style={{ borderLeftColor: isOverloaded ? "var(--color-reduce)" : "var(--color-keep)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-white" />
            <h2 className="font-display text-xl text-white">2. Workload Analysis</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-ui text-white/60 mb-1">Planned Workload</p>
              <p className="text-2xl font-display text-white">{formatDuration(plannedMinutes)}</p>
            </div>
            <div>
              <p className="text-sm font-ui text-white/60 mb-1">Status</p>
              {isOverloaded ? (
                <div className="flex items-center gap-2 text-reduce">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xl font-display">+{formatDuration(plannedMinutes - previewCapacity)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-keep">
                  <Check className="w-5 h-5" />
                  <span className="text-xl font-display">Balanced</span>
                </div>
              )}
            </div>
          </div>
          {isOverloaded && (
            <p className="text-xs font-ui text-reduce/80">
              You are over capacity. Consider reducing scope or moving lower-priority tasks.
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Plan Items */}
      <div className="space-y-6 relative mt-12">
        <h2 className="font-display text-2xl text-white mb-6">3. Recommended Actions</h2>

        <div className="absolute left-6 md:left-[120px] top-14 bottom-4 w-px bg-white/10 -z-10" />

        {plannerTasks.length === 0 && (
          <div className="glass-card p-8 text-center text-white/40 font-ui">
            No tasks to plan. Add some tasks first.
          </div>
        )}

        {plannerTasks.map((task) => {
          const decision = getDecision(task.id);
          const reason = getReason(task.id);
          const plannedMins = getPlannedMins(task.id);

          return (
            <div key={task.id} className="flex flex-col md:flex-row gap-6 md:gap-8 group">

              {/* Timeline Left */}
              <div className="md:w-[120px] pt-4 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 relative">
                <div className={`absolute top-5 -left-1 md:right-[-9px] md:left-auto w-4 h-4 rounded-full border-4 border-background z-10 ${
                  decision === "KEEP" ? "bg-keep" :
                  decision === "REDUCE" ? "bg-reduce" : "bg-move"
                }`} />
                <div className="pl-8 md:pl-0 font-ui text-sm text-white/40 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {decision === "REDUCE" ? (
                    <>
                      <span className="line-through opacity-50 mr-1">{formatDuration(task.estimatedDuration)}</span>
                      <span className="text-reduce font-bold">{formatDuration(plannedMins)}</span>
                    </>
                  ) : (
                    <span>{formatDuration(task.estimatedDuration)}</span>
                  )}
                </div>
              </div>

              {/* Task Card */}
              <div className="flex-1 glass-card p-5 md:p-6 ml-6 md:ml-0 relative overflow-hidden transition-all hover:bg-white/[0.03]">

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className={`font-ui text-lg font-medium ${decision === "MOVE" ? "text-white/40" : "text-white"}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-ui">
                      <span className="text-white/50 bg-white/5 px-2 py-0.5 rounded">{task.category}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        task.priority === "High" || task.priority === "Urgent" ? "text-reduce/80 bg-reduce/10" :
                        task.priority === "Medium" ? "text-primary/80 bg-primary/10" :
                        "text-white/50 bg-white/10"
                      }`}>{task.priority} Priority</span>
                      <span className="text-white/30">{task.deadline}</span>
                    </div>
                  </div>

                  {/* Decision Toggle */}
                  <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 shrink-0 h-fit">
                    {(["KEEP", "REDUCE", "MOVE"] as const).map((action) => (
                      <button
                        key={action}
                        onClick={() => overrideDecision(task.id, action)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          decision === action
                            ? action === "KEEP" ? "bg-keep/20 text-keep" :
                              action === "REDUCE" ? "bg-reduce/20 text-reduce" :
                              "bg-move/20 text-move"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                {(decision === "REDUCE" || decision === "MOVE") && reason && (
                  <div className={`mt-4 p-3 rounded-lg text-sm font-ui flex gap-3 ${
                    decision === "REDUCE" ? "bg-reduce/5 border border-reduce/10" : "bg-move/5 border border-move/10"
                  }`}>
                    {decision === "REDUCE" ? (
                      <AlertTriangle className="w-5 h-5 text-reduce shrink-0" />
                    ) : (
                      <ArrowRightCircle className="w-5 h-5 text-move shrink-0" />
                    )}
                    <div>
                      <strong className={decision === "REDUCE" ? "text-reduce" : "text-move"}>
                        Why {decision.toLowerCase()}?
                      </strong>
                      <p className="text-white/70 mt-1">{reason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-6 bg-background/80 backdrop-blur-xl border-t border-white/10 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-ui text-white/60">Planned Workload</p>
            <p className="text-xl font-display text-white">
              {formatDuration(plannedMinutes)} / {formatDuration(previewCapacity)}
            </p>
          </div>
          <button
            onClick={handleConfirmPlan}
            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-ui font-medium rounded-lg transition-colors glow-primary flex items-center gap-2"
          >
            Confirm Plan <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
