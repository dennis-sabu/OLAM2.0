"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, CheckCircle2, Clock, TrendingDown, Layers, PieChart } from "lucide-react";
import { formatDuration } from "@/lib/flowstate";
import { useFlowState } from "@/lib/FlowStateProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getRecentSummaries } from "@/lib/data/state";
import type { DailySummary } from "@/types";

export default function Insights() {
  const { tasks, analysis, capacity, history } = useFlowState();
  const { user } = useAuth();
  const [recentSummaries, setRecentSummaries] = useState<DailySummary[]>([]);

  useEffect(() => {
    if (user?.id) {
      getRecentSummaries(user.id, 7)
        .then((data) => setRecentSummaries(data))
        .catch((e) => console.warn("Failed to load summaries:", e));
    }
  }, [user?.id, tasks.length, capacity]);

  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const pendingTasks = tasks.filter((t) => t.status === "Pending");
  const incompleteTasks = tasks.filter((t) => t.status === "Incomplete");
  const movedTasks = tasks.filter((t) => t.planAction === "MOVE");

  const timeSpent = completedTasks.reduce(
    (acc, t) => acc + (t.completedMinutes ?? t.estimatedDuration),
    0
  );

  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const plannedTasks = tasks.filter(
    (t) => t.planAction === "KEEP" || t.planAction === "REDUCE"
  );

  // Category breakdown from real tasks
  const categoryMap = tasks.reduce<Record<string, { count: number; mins: number }>>((acc, t) => {
    const cat = t.category || "General";
    if (!acc[cat]) acc[cat] = { count: 0, mins: 0 };
    acc[cat].count += 1;
    acc[cat].mins += t.estimatedDuration;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryMap);

  // Dynamic 7-day timeline ending in Today
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    const dayLabel = i === 6 ? "Today" : daysOfWeek[d.getDay()];

    if (i === 6) {
      return {
        day: dayLabel,
        date: iso,
        w: analysis.totalWorkload,
        c: capacity,
        wPercent: Math.min(100, Math.round((analysis.totalWorkload / 360) * 100)),
        cPercent: Math.min(100, Math.round((capacity / 360) * 100)),
        isToday: true,
      };
    }

    const found = recentSummaries.find((s) => s.date === iso);
    const wMins = found?.workloadMinutes ?? 0;
    const cMins = found?.capacityMinutes ?? 0;

    return {
      day: dayLabel,
      date: iso,
      w: wMins,
      c: cMins,
      wPercent: Math.min(100, Math.round((wMins / 360) * 100)),
      cPercent: Math.min(100, Math.round((cMins / 360) * 100)),
      isToday: false,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="font-display text-3xl md:text-4xl text-white">Insights</h1>
        <p className="font-ui text-white/60">
          Real-time productivity, capacity adherence, and workload analytics.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-keep" /> Completion Rate
          </div>
          <p className="font-display text-3xl text-white">{completionRate}%</p>
          <p className="text-xs text-white/30 font-ui">
            {completedTasks.length} of {tasks.length} tasks completed
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" /> Time Tracked
          </div>
          <p className="font-display text-3xl text-white">{formatDuration(timeSpent)}</p>
          <p className="text-xs text-white/30 font-ui">across completed items</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" /> Capacity Today
          </div>
          <p className="font-display text-3xl text-white">{formatDuration(capacity)}</p>
          <p className="text-xs text-white/30 font-ui">
            {analysis.status === "BALANCED"
              ? "✓ Balanced Workload"
              : analysis.status === "TIGHT"
              ? "⚠ Tight Schedule"
              : "⚠ Workload Overloaded"}
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="text-white/60 font-ui text-sm flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-move" /> Postponed
          </div>
          <p className="font-display text-3xl text-white">{movedTasks.length}</p>
          <p className="text-xs text-white/30 font-ui">
            {movedTasks.length} moved to preserve quality
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Real Workload Chart */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-ui text-lg text-white font-medium">Workload vs Capacity (7 Days)</h3>
            <span className="text-xs text-white/40 font-ui">Live data</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 px-2 relative border-b border-l border-white/10 pb-2 pl-2">
            <div className="absolute left-[-26px] top-0 bottom-0 flex flex-col justify-between text-[10px] text-white/40 font-ui pb-2">
              <span>6h</span>
              <span>4h</span>
              <span>2h</span>
              <span>0h</span>
            </div>

            {weekData.map((d, i) => (
              <div key={i} className="flex-1 flex justify-center group relative h-full items-end gap-1">
                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/90 border border-white/20 text-[10px] text-white px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                  <span>
                    {d.day} ({d.date}): Work {formatDuration(d.w)} / Cap {formatDuration(d.c)}
                  </span>
                </div>

                <div
                  className={`w-[30%] rounded-t-sm transition-all group-hover:brightness-125 ${
                    d.isToday ? "bg-white/60 glow-white" : "bg-white/20"
                  }`}
                  style={{ height: `${Math.max(4, d.wPercent)}%` }}
                />
                <div
                  className={`w-[30%] rounded-t-sm transition-all group-hover:brightness-125 ${
                    d.isToday ? "bg-primary glow-primary" : "bg-primary/60"
                  }`}
                  style={{ height: `${Math.max(4, d.cPercent)}%` }}
                />
                <div
                  className={`absolute -bottom-6 text-[10px] font-ui transition-colors ${
                    d.isToday ? "text-primary font-bold" : "text-white/40 group-hover:text-white"
                  }`}
                >
                  {d.day}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-ui">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white/40 rounded" /> Workload (mins)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" /> Capacity (mins)
            </div>
          </div>
        </div>

        {/* Real Tasks Breakdown */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-ui text-lg text-white font-medium">Task Portfolio Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-ui text-white/70">Total Active Tasks</span>
              <strong className="text-white">{tasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-ui text-white/70">Completed</span>
              <strong className="text-keep">{completedTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-ui text-white/70">In Progress</span>
              <strong className="text-emerald-400">{inProgressTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-ui text-white/70">Pending Today</span>
              <strong className="text-white">{pendingTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-ui text-white/70">Planned (Keep/Reduce)</span>
              <strong className="text-primary">{plannedTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-ui text-white/70">Moved by Adaptive Planner</span>
              <strong className="text-move">{movedTasks.length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-ui text-white/70">Current Workload Status</span>
              <strong
                className={
                  analysis.status === "BALANCED"
                    ? "text-keep"
                    : analysis.status === "TIGHT"
                    ? "text-yellow-400"
                    : "text-reduce"
                }
              >
                {analysis.status}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Real Category Workload Distribution */}
      {categoryEntries.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-ui text-lg text-white font-medium flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Workload by Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {categoryEntries.map(([category, stats]) => (
              <div
                key={category}
                className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-1"
              >
                <div className="text-xs font-ui text-white/50 uppercase tracking-wider">{category}</div>
                <div className="text-lg font-display text-white">{formatDuration(stats.mins)}</div>
                <div className="text-xs font-ui text-white/40">
                  {stats.count} task{stats.count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent History from Database */}
      <div className="glass-card p-6">
        <h3 className="font-ui text-lg text-white font-medium mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Recent Activity Stream
        </h3>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between text-sm font-ui border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      event.action === "completed"
                        ? "bg-keep"
                        : event.action === "missed"
                        ? "bg-reduce"
                        : event.action === "moved" || event.action === "rescheduled"
                        ? "bg-move"
                        : "bg-primary"
                    }`}
                  />
                  <span className="text-white/80">{event.taskTitle}</span>
                </div>
                <div className="flex items-center gap-3 text-white/30">
                  <span className="capitalize">{event.action}</span>
                  <span className="text-xs">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-ui text-white/40">
            No task activity logged yet. Tasks you complete, reschedule, or move will appear here in real time.
          </p>
        )}
      </div>
    </div>
  );
}
