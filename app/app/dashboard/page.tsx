"use client";

import { useState, useEffect } from "react";
import { useFlowState } from "@/lib/FlowStateProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatDuration } from "@/lib/flowstate";
import {
  Battery, Brain, Clock, Zap, CheckCircle2, ChevronRight,
  Play, Check, RefreshCw, XCircle, Plus, Sparkles, ShieldAlert, Cpu,
} from "lucide-react";
import Link from "next/link";
import { Task } from "@/types";

export default function Dashboard() {
  const {
    tasks,
    state,
    profile,
    analysis,
    mvd,
    capacity,
    plan,
    completeTask,
    markIncomplete,
    rescheduleTask,
    updateTask,
    recalculatePlan,
  } = useFlowState();
  const { user } = useAuth();

  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const rawName = profile?.name?.trim() || user?.user_metadata?.name || user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "") || "Student";
  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "Student";

  // Today's tasks = tasks that have a KEEP or REDUCE decision (or are In Progress)
  const todaysTasks = tasks.filter(
    (t) =>
      (t.planAction === "KEEP" || t.planAction === "REDUCE" || t.status === "In Progress") &&
      t.status !== "Completed"
  );

  const movedTasks = tasks.filter((t) => t.planAction === "MOVE" && t.status !== "Completed");

  const keepCount = plan.filter((p) => p.decision === "KEEP").length;
  const reduceCount = plan.filter((p) => p.decision === "REDUCE").length;
  const moveCount = plan.filter((p) => p.decision === "MOVE").length;

  const handleStart = (task: Task) => updateTask({ ...task, status: "In Progress" });
  const handleComplete = (id: string) => completeTask(id);
  const handleCantFinish = (id: string) => markIncomplete(id);
  const handleReschedule = (id: string) => {
    rescheduleTask(id, "Tomorrow");
    setReschedulingId(null);
  };

  const statusColor = {
    BALANCED: "bg-keep/50",
    TIGHT: "bg-reduce/50",
    OVERLOADED: "bg-reduce/50",
  }[analysis.status];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-white">{greeting}, {displayName}.</h1>
          <p className="font-ui text-white/60 mt-1">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} —{" "}
            <span className={
              analysis.status === "BALANCED" ? "text-keep" :
              analysis.status === "TIGHT" ? "text-reduce" : "text-reduce"
            }>
              {analysis.status === "BALANCED" ? "Workload is balanced." :
               analysis.status === "TIGHT" ? "Workload is tight today." :
               "You are over capacity."}
            </span>
          </p>
        </div>
        <button
          onClick={recalculatePlan}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg font-ui text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Recalculate My Day
        </button>
      </header>

      {/* Top Stats Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <span className="text-white/60 font-ui text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" /> Capacity
          </span>
          <p className="text-3xl font-display text-white">{formatDuration(capacity)}</p>
          <div className="absolute bottom-0 left-0 h-1 bg-keep/50 w-full" />
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <span className="text-white/60 font-ui text-sm flex items-center gap-2">
            <Brain className="w-4 h-4" /> Workload
          </span>
          <p className="text-3xl font-display text-white">{formatDuration(analysis.totalWorkload)}</p>
          <div className="absolute bottom-0 left-0 h-1 bg-primary/50 w-full" />
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <span className="text-white/60 font-ui text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-reduce" /> Overload
          </span>
          <p className={`text-3xl font-display ${analysis.overload > 0 ? "text-reduce" : "text-keep"}`}>
            {analysis.overload > 0 ? `+${formatDuration(analysis.overload)}` : "None"}
          </p>
          <div className={`absolute bottom-0 left-0 h-1 w-full ${statusColor}`} />
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <span className="text-white/60 font-ui text-sm flex items-center gap-2">
            <Battery className="w-4 h-4" /> State
          </span>
          <div className="flex gap-3">
            <p className="text-xl font-display text-white"><span className="text-white/40 text-sm">E:</span> {state.energy}/10</p>
            <p className="text-xl font-display text-white"><span className="text-white/40 text-sm">S:</span> {state.stress}/10</p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Today's Plan */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> TODAY'S PLAN
              </h2>
              <Link href="/app/planner" className="text-sm font-ui text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
                View Planner <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {todaysTasks.length === 0 ? (
                <div className="glass-card p-8 text-center text-white/50 font-ui">
                  Your plan is clear. Add tasks or log your daily state to get started.
                </div>
              ) : todaysTasks.map((task) => {
                const planItem = plan.find((p) => p.taskId === task.id);
                const plannedMins = planItem?.plannedMinutes ?? task.estimatedDuration;

                return (
                  <div
                    key={task.id}
                    className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors border-l-4"
                    style={{
                      borderLeftColor:
                        task.planAction === "KEEP" ? "var(--color-keep)" :
                        task.planAction === "REDUCE" ? "var(--color-reduce)" :
                        "var(--color-move)",
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          task.planAction === "KEEP" ? "bg-keep/20 text-keep" :
                          task.planAction === "REDUCE" ? "bg-reduce/20 text-reduce" :
                          "bg-move/20 text-move"
                        }`}>
                          {task.planAction}
                        </span>
                        <h3 className={`font-ui font-medium text-lg ${task.status === "Completed" ? "line-through text-white/30" : "text-white"}`}>
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.planAction === "REDUCE"
                            ? <><span className="line-through opacity-40 mr-1">{formatDuration(task.estimatedDuration)}</span>{formatDuration(plannedMins)}</>
                            : formatDuration(plannedMins)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10">{task.category}</span>
                        <span className={task.priority === "High" || task.priority === "Urgent" ? "text-reduce" : ""}>{task.priority} Priority</span>
                        <span className="text-white/30">{task.deadline}</span>
                        {task.status !== "Pending" && <span className="text-primary">{task.status}</span>}
                      </div>
                    </div>

                    {task.status !== "Completed" && (
                      <div className="flex items-center gap-2 shrink-0">
                        {task.status === "Pending" && (
                          <button onClick={() => handleStart(task)} title="Start" className="p-2 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleComplete(task.id)} title="Complete" className="p-2 rounded hover:bg-keep/20 text-keep/60 hover:text-keep transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReschedule(task.id)} title="Reschedule to Tomorrow" className="p-2 rounded hover:bg-move/20 text-move/60 hover:text-move transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleCantFinish(task.id)} title="Couldn't Finish" className="p-2 rounded hover:bg-reduce/20 text-reduce/60 hover:text-reduce transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Moved tasks — collapsed view */}
            {movedTasks.length > 0 && (
              <div className="glass-card p-4 opacity-50 space-y-2">
                <p className="text-xs font-ui text-white/40 uppercase tracking-wider">Moved to later ({movedTasks.length})</p>
                {movedTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-sm font-ui text-white/30">
                    <span className="text-[10px] px-1.5 py-0.5 bg-move/10 text-move/50 rounded">MOVE</span>
                    {t.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/app/tasks/new" className="glass-card p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-white/5 transition-colors border-dashed border-white/20 group">
              <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-ui font-semibold text-white/80">Quick Add Task</h3>
            </Link>
            <Link href="/app/tasks/new?ai=true" className="glass-card p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-white/5 transition-colors group border-primary/20 bg-primary/[0.02]">
              <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary transition-colors relative">
                <Sparkles className="w-5 h-5" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full animate-ping" />
              </div>
              <h3 className="font-ui font-semibold text-primary/80">AI Quick Capture</h3>
            </Link>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">

          {/* Plan Summary */}
          <div className="glass-card p-5 flex justify-between items-center">
            <div className="text-center space-y-1">
              <div className="text-2xl font-display text-keep">{keepCount}</div>
              <div className="text-[10px] uppercase font-bold text-white/40">KEEP</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-display text-reduce">{reduceCount}</div>
              <div className="text-[10px] uppercase font-bold text-white/40">REDUCE</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-display text-move">{moveCount}</div>
              <div className="text-[10px] uppercase font-bold text-white/40">MOVE</div>
            </div>
          </div>

          {/* Minimum Viable Day */}
          <div className="glass-card p-6 border-keep/20 relative overflow-hidden bg-keep/[0.02]">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-keep/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-display text-xl text-white flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-keep" /> MINIMUM VIABLE DAY
            </h3>
            <p className="text-xs text-white/60 mb-4 font-body leading-relaxed">
              {mvd.explanation}
            </p>
            <ul className="space-y-3">
              {mvd.tasks.map((task) => (
                <li key={task.id} className="text-sm text-white/90 font-ui flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-keep mt-1.5 flex-shrink-0" />
                  <span>{task.title}</span>
                  <span className="ml-auto text-white/30 text-xs shrink-0">{formatDuration(task.estimatedDuration)}</span>
                </li>
              ))}
              {mvd.tasks.length === 0 && (
                <li className="text-sm text-white/40 italic">No critical tasks found for today.</li>
              )}
            </ul>
            {mvd.tasks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs font-ui text-white/40">
                <span>MVD Total</span>
                <span className="text-keep">{formatDuration(mvd.totalMinutes)} / {formatDuration(capacity)}</span>
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-card p-6">
            <h3 className="font-ui font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-reduce" /> UPCOMING DEADLINES
            </h3>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.deadline !== "No Deadline" && t.status !== "Completed")
                .slice(0, 4)
                .map((task) => (
                  <div key={task.id} className="flex justify-between items-center text-sm font-ui">
                    <span className="text-white truncate pr-4">{task.title}</span>
                    <span className="text-reduce/80 whitespace-nowrap bg-reduce/10 px-2 py-0.5 rounded text-xs">{task.deadline}</span>
                  </div>
                ))}
              {tasks.filter((t) => t.deadline !== "No Deadline" && t.status !== "Completed").length === 0 && (
                <p className="text-xs text-white/30 italic">No upcoming deadlines.</p>
              )}
            </div>
          </div>

          {/* FlowState Device */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <h3 className="font-ui font-medium text-white text-sm">FlowState Device</h3>
                <p className="text-xs text-white/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Not connected
                </p>
              </div>
            </div>
            <Link href="/app/settings" className="text-xs text-primary hover:underline">Setup</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
