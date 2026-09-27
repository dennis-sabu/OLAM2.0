"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Wifi, Radio, Power, CheckCircle2, Pause, Play, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HardwareCompanionSection() {
  const [seconds, setSeconds] = useState(2537); // 42:17
  const [isRunning, setIsRunning] = useState(true);

  // Local simulated ticker for the display
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-28 relative z-10">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Label */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 font-ui text-xs text-primary font-semibold uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5" /> Physical Desk Companion · Phase 5
        </span>
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight">
          Deep work belongs on your desk,{" "}
          <span className="italic text-accent">not your phone.</span>
        </h2>
        <p className="font-body text-base md:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
          Tired of picking up your phone to check a timer and ending up on social media? The FlowState ESP32-S3 companion sits by your monitor — distraction-free, physical, and in sync with your cloud plan.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: Device Specs and Features */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-ui text-base font-semibold text-white">Cloud Synced over 2.4 GHz Wi-Fi</h4>
                <p className="font-body text-xs text-white/50">Auto-polls state every 20 seconds. Zero Bluetooth pairing hassle.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-ui text-base font-semibold text-white">Local Hardware Countdown</h4>
                <p className="font-body text-xs text-white/50">Runs independently on dual-core Xtensa MCU. Never stalls or makes 1-second HTTP requests.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-ui text-base font-semibold text-white">Single-Button Tactile Flow</h4>
                <p className="font-body text-xs text-white/50">Click BOOT button to Start/Pause. Long-press to mark Complete and queue the next task.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/app/settings"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-ui text-sm font-semibold transition-colors flex items-center gap-2"
            >
              Configure in Settings <Cpu className="w-4 h-4 text-primary" />
            </Link>
            <span className="font-ui text-xs text-white/40">
              Compatible with GMT028-05 V1.1 (ILI9341 SPI)
            </span>
          </div>
        </div>

        {/* Right: Realistic Device Mockup */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative">
            {/* Device Enclosure Outer Shadow & Glow */}
            <div className="absolute -inset-4 bg-primary/20 rounded-[36px] blur-2xl -z-10" />

            {/* Hardware PCB / Enclosure Frame */}
            <div className="w-[340px] sm:w-[380px] bg-[#120e20] p-6 rounded-[28px] border-2 border-white/15 shadow-2xl relative">
              {/* Subtle screw details */}
              <div className="absolute top-3 left-3 w-2 h-2 rounded-full border border-white/20 bg-white/5" />
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full border border-white/20 bg-white/5" />
              <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full border border-white/20 bg-white/5" />
              <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full border border-white/20 bg-white/5" />

              {/* Hardware silkscreen branding */}
              <div className="flex items-center justify-between mb-3 px-1 text-[11px] font-mono text-white/30 tracking-wider">
                <span>FLOWSTATE H1</span>
                <span>ESP32-S3 · 240x320</span>
              </div>

              {/* 240x320 Screen Bezel */}
              <div className="w-full h-[255px] bg-black rounded-xl p-4 border border-white/20 shadow-inner flex flex-col justify-between overflow-hidden relative font-mono">
                {/* Screen Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8b5cf6] font-bold text-xs tracking-wider">FLOWSTATE</span>
                    <span className="text-white/40 text-[10px]">· FOCUS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-white/50">ONLINE</span>
                  </div>
                </div>

                {/* Screen Task Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <p className="text-white text-xs font-bold truncate max-w-[170px]">
                      Electronics Assignment
                    </p>
                    <p className="text-white/40 text-[10px]">Academics</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-bold">
                    KEEP
                  </span>
                </div>

                {/* Big Countdown Digits */}
                <div className="text-center py-2">
                  <div className="text-white font-mono text-4xl sm:text-5xl font-bold tracking-wider text-shadow">
                    {timeFormatted}
                  </div>
                  <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest mt-1">
                    FOCUSING
                  </p>
                </div>

                {/* Screen Bottom Actions */}
                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[10px] text-white/50">
                  <span>CLICK: {isRunning ? "PAUSE" : "RESUME"}</span>
                  <span>HOLD: COMPLETE</span>
                </div>
              </div>

              {/* Physical Tactile BOOT Button simulation */}
              <div className="mt-4 flex items-center justify-between pt-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/70 animate-ping" />
                  <span className="text-[11px] font-mono text-white/40">GPIO 0 (BOOT)</span>
                </div>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  <span>Press Button</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
