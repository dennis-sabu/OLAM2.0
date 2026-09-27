"use client";

import { useState, useEffect } from "react";
import { Battery, Zap, Clock, Moon, RefreshCw, TrendingUp } from "lucide-react";
import { formatDuration, calculateCapacity, capacityExplanation } from "@/lib/flowstate";
import { useFlowState } from "@/lib/FlowStateProvider";
import { useRouter } from "next/navigation";
import type { DailyState } from "@/types";

export default function DailyState() {
  const { state: globalState, setState, tasks, analysis, capacity } = useFlowState();
  const [localState, setLocalState] = useState<DailyState>(globalState);
  const [isCalculating, setIsCalculating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLocalState(globalState);
  }, [globalState]);

  // Live preview capacity as the user moves sliders
  const previewCapacity = calculateCapacity(localState);
  const previewExplanation = capacityExplanation(localState);

  const handleField = (field: keyof DailyState, value: number) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogAndPlan = async () => {
    setIsCalculating(true);
    try {
      await setState(localState); // triggers database persist + engine recalculation
      router.push("/app/planner");
    } catch (err) {
      console.error("Failed to save daily state:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const overload = Math.max(0, analysis.totalWorkload - previewCapacity);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

      <header className="space-y-4">
        <h1 className="font-display text-3xl md:text-4xl text-white">Your Daily State</h1>
        <p className="font-ui text-white/60">
          FlowState adapts to your human limits. Update your metrics to see how your capacity changes.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Input Sliders */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">

            <div className="space-y-3">
              <label className="flex justify-between text-sm font-ui text-white">
                <span className="flex items-center gap-2"><Battery className="w-4 h-4 text-primary" /> Energy Level</span>
                <span className="font-bold">{localState.energy}/10</span>
              </label>
              <input
                type="range" min="1" max="10"
                value={localState.energy}
                onChange={(e) => handleField("energy", parseInt(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <label className="flex justify-between text-sm font-ui text-white">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-reduce" /> Stress Level</span>
                <span className="font-bold">{localState.stress}/10</span>
              </label>
              <input
                type="range" min="1" max="10"
                value={localState.stress}
                onChange={(e) => handleField("stress", parseInt(e.target.value))}
                className="w-full accent-reduce bg-white/10 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <label className="flex justify-between text-sm font-ui text-white">
                <span className="flex items-center gap-2"><Moon className="w-4 h-4 text-move" /> Sleep (hours)</span>
                <span className="font-bold">{localState.sleep}h</span>
              </label>
              <input
                type="range" min="0" max="12" step="0.5"
                value={localState.sleep}
                onChange={(e) => handleField("sleep", parseFloat(e.target.value))}
                className="w-full accent-move bg-white/10 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <label className="flex justify-between text-sm font-ui text-white">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Available Study Time</span>
                <span className="font-bold">{formatDuration(localState.availableTime)}</span>
              </label>
              <input
                type="range" min="30" max="480" step="30"
                value={localState.availableTime}
                onChange={(e) => handleField("availableTime", parseInt(e.target.value))}
                className="w-full accent-white bg-white/10 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleLogAndPlan}
            disabled={isCalculating}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-ui font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 glow-primary"
          >
            <RefreshCw className={`w-5 h-5 ${isCalculating ? "animate-spin" : ""}`} />
            {isCalculating ? "Calculating capacity..." : "Log State & Plan Day"}
          </button>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Live Capacity Card */}
          <div className="glass-card p-6 md:p-8 flex flex-col justify-center space-y-8 relative overflow-hidden bg-primary/[0.02]">
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <h3 className="font-ui text-white/60 text-sm uppercase tracking-wider">Estimated Capacity</h3>
              <p className="font-display text-5xl md:text-6xl text-white">
                {isCalculating ? "..." : formatDuration(previewCapacity)}
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-sm font-ui border-b border-white/10 pb-4">
                <span className="text-white/60">Today's Workload</span>
                <span className="text-white font-bold">{formatDuration(analysis.totalWorkload)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-ui">
                <span className="text-white/60">Overload Deficit</span>
                <span className={overload > 0 ? "text-reduce font-bold" : "text-keep font-bold"}>
                  {overload > 0 ? formatDuration(overload) : "Balanced ✓"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10 font-ui text-sm text-white/70 relative z-10 leading-relaxed">
              <strong className="text-white block mb-1">FlowState Note:</strong>
              {previewExplanation}
            </div>
          </div>

          {/* Recent History Mock Chart */}
          <div className="glass-card p-6 relative overflow-hidden">
            <h3 className="font-ui text-white/80 font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Recent History (Energy vs Stress)
            </h3>

            <div className="h-32 flex items-end gap-2 sm:gap-4 w-full justify-between mt-8 relative">
              <div className="absolute top-0 w-full border-t border-white/5" />
              <div className="absolute top-1/2 w-full border-t border-white/5" />
              <div className="absolute bottom-0 w-full border-t border-white/20" />

              {[
                { day: "M", e: 8, s: 4 },
                { day: "T", e: 7, s: 5 },
                { day: "W", e: 4, s: 8 },
                { day: "T", e: 6, s: 7 },
                { day: "F", e: 9, s: 3 },
                { day: "S", e: 5, s: 2 },
                { day: "Today", e: localState.energy, s: localState.stress },
              ].map((data, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 relative group">
                  <div className="flex items-end gap-1 w-full justify-center h-24">
                    <div className="w-full max-w-[12px] bg-primary/80 rounded-t-sm transition-all duration-300" style={{ height: `${(data.e / 10) * 100}%` }} />
                    <div className="w-full max-w-[12px] bg-reduce/80 rounded-t-sm transition-all duration-300" style={{ height: `${(data.s / 10) * 100}%` }} />
                  </div>
                  <span className="text-xs font-ui text-white/40 group-hover:text-white transition-colors">{data.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-xs font-ui text-white/60">
                <div className="w-3 h-3 rounded-sm bg-primary/80" /> Energy
              </div>
              <div className="flex items-center gap-2 text-xs font-ui text-white/60">
                <div className="w-3 h-3 rounded-sm bg-reduce/80" /> Stress
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
