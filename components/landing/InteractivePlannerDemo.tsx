"use client";

import React, { useState } from "react";
import { Zap, Battery, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

interface DemoTask {
  id: string;
  title: string;
  duration: number; // minutes
  priority: "High" | "Medium" | "Low";
  category: string;
}

export default function InteractivePlannerDemo() {
  const [energyLevel, setEnergyLevel] = useState<"low" | "medium" | "high">("medium");

  const tasks: DemoTask[] = [
    { id: "1", title: "Electronics Assignment", duration: 90, priority: "High", category: "Academics" },
    { id: "2", title: "Mathematics Exam Review", duration: 60, priority: "High", category: "Academics" },
    { id: "3", title: "Database Schema Diagram", duration: 45, priority: "Medium", category: "Projects" },
    { id: "4", title: "Read Operating Systems Ch. 5", duration: 75, priority: "Low", category: "Reading" },
  ];

  // Capacity calculation based on energy
  const capacityMinutes = energyLevel === "low" ? 120 : energyLevel === "medium" ? 210 : 330;
  const totalWorkloadMinutes = tasks.reduce((acc, t) => acc + t.duration, 0); // 270 min

  // Plan decisions based on capacity
  const getDecision = (task: DemoTask, index: number) => {
    if (energyLevel === "low") {
      // 120 min capacity
      if (task.id === "1") return { tag: "REDUCE", text: "Scope to 60m", color: "text-amber-400 border-amber-500/30 bg-amber-500/10", minutes: 60 };
      if (task.id === "2") return { tag: "KEEP", text: "Full 60m", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", minutes: 60 };
      return { tag: "MOVE", text: "Push to tomorrow", color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10", minutes: 0 };
    } else if (energyLevel === "medium") {
      // 210 min capacity
      if (task.id === "1") return { tag: "KEEP", text: "90m core focus", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", minutes: 90 };
      if (task.id === "2") return { tag: "KEEP", text: "60m review", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", minutes: 60 };
      if (task.id === "3") return { tag: "KEEP", text: "45m diagram", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", minutes: 45 };
      return { tag: "MOVE", text: "Low urgency · Push", color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10", minutes: 0 };
    } else {
      // 330 min capacity
      return { tag: "KEEP", text: `${task.duration}m planned`, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", minutes: task.duration };
    }
  };

  const capacityHours = Math.floor(capacityMinutes / 60);
  const capacityMins = capacityMinutes % 60;

  return (
    <div className="w-full relative rounded-2xl overflow-hidden glass-card border border-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-ui text-primary font-semibold mb-2">
            <Sparkles className="w-3 h-3" /> Live Capacity Simulator
          </div>
          <h3 className="font-ui text-xl md:text-2xl font-bold text-white">
            Watch the planning engine adapt in real time
          </h3>
          <p className="font-body text-xs md:text-sm text-white/50 mt-1">
            Toggle your simulated energy level to see how FlowState protects your bandwidth.
          </p>
        </div>

        {/* Energy Toggles */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/50 border border-white/10 rounded-xl shrink-0 self-start md:self-auto">
          {[
            { id: "low", label: "Drained (3/10)", icon: AlertTriangle, color: "text-amber-400" },
            { id: "medium", label: "Balanced (6/10)", icon: Battery, color: "text-primary" },
            { id: "high", label: "Locked In (9/10)", icon: Zap, color: "text-emerald-400" },
          ].map((mode) => {
            const Icon = mode.icon;
            const active = energyLevel === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setEnergyLevel(mode.id as any)}
                className={`px-3 py-2 rounded-lg font-ui text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-primary text-white shadow-lg glow-primary"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : mode.color}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle: Capacity vs Workload Bar */}
      <div className="py-6 border-b border-white/8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-1">
          <p className="font-ui text-xs text-white/40 uppercase tracking-wider font-semibold">Today's Human Capacity</p>
          <p className="font-display text-3xl font-bold text-primary">
            {capacityHours}h {capacityMins > 0 ? `${capacityMins}m` : ""}
          </p>
          <p className="font-ui text-xs text-white/50">
            {energyLevel === "low" ? "Low energy protects core essentials only" : energyLevel === "medium" ? "Standard balanced academic day" : "Peak focus: ideal for deep work sprints"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-ui text-xs text-white/40 uppercase tracking-wider font-semibold">Total Raw Workload</p>
          <p className="font-display text-3xl font-bold text-white">4h 30m</p>
          <p className="font-ui text-xs text-white/50">4 active pending tasks</p>
        </div>

        <div className="space-y-2 bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-xs font-ui">
            <span className="text-white/60">Bandwidth Health:</span>
            <span className={energyLevel === "low" ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
              {energyLevel === "low" ? "Protected (-2h 30m deferred)" : energyLevel === "medium" ? "Calibrated (1 task moved)" : "100% Cleared"}
            </span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                energyLevel === "low" ? "bg-amber-400" : energyLevel === "medium" ? "bg-primary" : "bg-emerald-400"
              }`}
              style={{
                width: `${Math.min(100, Math.round((capacityMinutes / totalWorkloadMinutes) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Plan List */}
      <div className="pt-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-ui text-white/40 uppercase tracking-wider font-semibold mb-2">
          <span>Task Schedule Result</span>
          <span>Engine Verdict</span>
        </div>

        {tasks.map((task, idx) => {
          const decision = getDecision(task, idx);
          const isMoved = decision.tag === "MOVE";

          return (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                isMoved
                  ? "bg-white/[0.02] border-white/5 opacity-50"
                  : "bg-black/30 border-white/8 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    decision.tag === "KEEP"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : decision.tag === "REDUCE"
                      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                      : "bg-indigo-400"
                  }`}
                />
                <div>
                  <p className="font-ui text-sm font-semibold text-white">{task.title}</p>
                  <p className="font-ui text-xs text-white/40">
                    {task.category} · Estimated {task.duration} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-ui text-xs text-white/60 hidden sm:inline-block">
                  {decision.text}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border tracking-wider ${decision.color}`}
                >
                  {decision.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA footer */}
      <div className="mt-6 pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-ui">
        <span className="text-white/50 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Deterministic calculation. Never hallucinated. Runs locally and syncs to Supabase.
        </span>
        <Link
          href="/auth/sign-up"
          className="text-primary hover:text-accent font-semibold flex items-center gap-1 transition-colors"
        >
          Try on your own syllabus <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
