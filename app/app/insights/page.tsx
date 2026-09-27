"use client";

import { BarChart3, TrendingUp, CheckCircle2, Clock, TrendingDown } from "lucide-react";
import { formatDuration } from "@/lib/flowstate";
import { useFlowState } from "@/lib/FlowStateProvider";

export default function Insights() {
  const { tasks, analysis, capacity, history } = useFlowState();

  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const incompleteTasks = tasks.filter((t) => t.status === "Incomplete");
  const movedTasks = tasks.filter((t) => t.planAction === "MOVE");

  const timeSpent = completedTasks.reduce(
    (acc, t) => acc + (t.completedMinutes ?? t.estimatedDuration),
    0
  );

  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const plannedTasks = tasks.filter(
    (t) => t.planAction === "KEEP" || t.planAction === "REDUCE"
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

      <header className="space-y-4">
        <h1 className="font-display text-3xl md:text-4xl text-white">Insights</h1>
        <p className="font-ui text-white/60">
          Understand your productivity patterns over time.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-keep" /> Completion Rate
          </div>
          <p className="font-display text-3xl text-white">{completionRate}%</p>
          <p className="text-xs text-white/30 font-ui">{completedTasks.length} of {tasks.length} tasks</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" /> Time Spent
          </div>
          <p className="font-display text-3xl text-white">{formatDuration(timeSpent)}</p>
          <p className="text-xs text-white/30 font-ui">total tracked</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" /> Capacity Today
          </div>
          <p className="font-display text-3xl text-white">{formatDuration(capacity)}</p>
          <p className="text-xs text-white/30 font-ui">
            {analysis.status === "BALANCED" ? "✓ Balanced" :
             analysis.status === "TIGHT" ? "⚠ Tight" : "⚠ Overloaded"}
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-move" /> Moved / Missed
          </div>
          <p className="font-display text-3xl text-white">{movedTasks.length + incompleteTasks.length}</p>
          <p className="text-xs text-white/30 font-ui">{movedTasks.length} moved · {incompleteTasks.length} missed</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Workload Chart */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-ui text-lg text-white font-medium">Workload vs Capacity</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2 relative border-b border-l border-white/10 pb-2 pl-2">
            <div className="absolute left-[-24px] top-0 bottom-0 flex flex-col justify-between text-[10px] text-white/40 font-ui pb-2">
              <span>6h</span>
              <span>4h</span>
              <span>2h</span>
              <span>0h</span>
            </div>
            {[
              { day: "Mon", w: 80, c: 90 },
              { day: "Tue", w: 100, c: 70 },
              { day: "Wed", w: 60, c: 60 },
              { day: "Thu", w: 40, c: 80 },
              { day: "Fri", w: 90, c: 50 },
              { day: "Sat", w: 30, c: 100 },
              {
                day: "Today",
                w: Math.min(100, Math.round((analysis.totalWorkload / 360) * 100)),
                c: Math.min(100, Math.round((capacity / 360) * 100)),
              },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex justify-center group relative h-full items-end gap-1">
                <div
                  className={`w-[30%] rounded-t-sm transition-all group-hover:brightness-125 ${i === 6 ? "bg-white/40" : "bg-white/20"}`}
                  style={{ height: `${d.w}%` }}
                />
                <div
                  className={`w-[30%] rounded-t-sm transition-all group-hover:brightness-125 ${i === 6 ? "bg-primary" : "bg-primary/60"}`}
                  style={{ height: `${d.c}%` }}
                />
                <div className="absolute -bottom-6 text-[10px] text-white/40 font-ui">{d.day}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-ui">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white/20 rounded" /> Workload</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary/60 rounded" /> Capacity</div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-ui text-lg text-white font-medium">Today's Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="font-ui text-white/70">Total Tasks</span>
              <strong className="text-white">{tasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="font-ui text-white/70">Completed</span>
              <strong className="text-keep">{completedTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="font-ui text-white/70">Planned for Today</span>
              <strong className="text-white">{plannedTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="font-ui text-white/70">Moved / Incomplete</span>
              <strong className="text-reduce">{movedTasks.length + incompleteTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-ui text-white/70">Workload Status</span>
              <strong className={
                analysis.status === "BALANCED" ? "text-keep" :
                analysis.status === "TIGHT" ? "text-reduce" : "text-reduce"
              }>{analysis.status}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-ui text-lg text-white font-medium mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {history.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between text-sm font-ui border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    event.action === "completed" ? "bg-keep" :
                    event.action === "missed" ? "bg-reduce" :
                    event.action === "moved" || event.action === "rescheduled" ? "bg-move" :
                    "bg-primary"
                  }`} />
                  <span className="text-white/80">{event.taskTitle}</span>
                </div>
                <div className="flex items-center gap-3 text-white/30">
                  <span className="capitalize">{event.action}</span>
                  <span className="text-xs">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
