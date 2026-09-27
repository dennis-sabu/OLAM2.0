"use client";

import React, { useState } from "react";
import {
  Bluetooth,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  Smartphone,
  Cable,
  Copy,
  Radio,
  Zap,
} from "lucide-react";
import { useBLECompanion } from "@/lib/bluetooth/FlowStateBLEContext";
import { useFlowState } from "@/lib/FlowStateProvider";
import {
  FLOWSTATE_SERVICE_UUID,
} from "@/lib/bluetooth/useFlowStateBLE";

interface BLECompanionWidgetProps {
  variant?: "compact" | "full";
}

export function BLECompanionWidget({ variant = "compact" }: BLECompanionWidgetProps) {
  const {
    isSupported,
    isSerialSupported,
    status,
    connectionType,
    deviceName,
    error,
    lastSynced,
    lastHardwareEvent,
    connect,
    connectSerial,
    disconnect,
    syncTodayPlan,
  } = useBLECompanion();

  const { tasks, state, capacity, plan } = useFlowState();
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [flagCopied, setFlagCopied] = useState(false);
  const [uuidCopied, setUuidCopied] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const ok = await syncTodayPlan(tasks, state, capacity, plan);
      if (ok) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2500);
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // BLE connect: filtered scan → auto-sync
  const handleConnectBLE = async () => {
    const success = await connect();
    if (success) {
      // Small delay to allow GATT service discovery to settle
      await new Promise((res) => setTimeout(res, 500));
      setIsSyncing(true);
      try {
        await syncTodayPlan(tasks, state, capacity, plan);
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2500);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // USB connect → auto-sync (port is already open with 600ms delay inside hook)
  const handleConnectUSB = async () => {
    const success = await connectSerial();
    if (success) {
      setIsSyncing(true);
      try {
        await syncTodayPlan(tasks, state, capacity, plan);
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2500);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const copyFlag = () => {
    navigator.clipboard.writeText("chrome://flags/#enable-web-bluetooth");
    setFlagCopied(true);
    setTimeout(() => setFlagCopied(false), 2500);
  };

  const copyUUID = () => {
    navigator.clipboard.writeText(FLOWSTATE_SERVICE_UUID);
    setUuidCopied(true);
    setTimeout(() => setUuidCopied(false), 2500);
  };

  // ── Build live payload preview from current tasks ─────────────
  const activeTasks = tasks.filter((t) => t.status !== "Completed");
  const inProgress = activeTasks.find((t) => t.status === "In Progress");
  const keepTasks = activeTasks.filter(
    (t) => t.planAction === "KEEP" || t.planAction === "NONE" || !t.planAction
  );
  const focusTask = inProgress || keepTasks[0] || activeTasks[0];
  const previewPayload = {
    focus: focusTask?.title || "No active tasks",
    mins: focusTask?.estimatedDuration || 0,
    status: inProgress ? "IN PROGRESS" : focusTask ? "KEEP" : "IDLE",
    energy: state.energy,
    capacity: `${Math.round(capacity / 60)} hrs`,
    keep: keepTasks
      .filter((t) => t.id !== focusTask?.id)
      .slice(0, 2)
      .map((t) => t.title),
    reduce: activeTasks.find((t) => t.planAction === "REDUCE")?.title || "None",
    move: activeTasks.filter((t) => t.planAction === "MOVE").length,
  };

  // ── Compact variant ──────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div className="glass-card p-5 relative overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                status === "connected"
                  ? "bg-primary/20 border border-primary/40 text-primary glow-primary"
                  : status === "connecting"
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : "bg-black/40 border border-white/10 text-white/40"
              }`}
            >
              {connectionType === "serial" ? (
                <Cable className="w-5 h-5 text-emerald-400" />
              ) : status === "connecting" ? (
                <Bluetooth className="w-5 h-5 text-yellow-400 animate-pulse" />
              ) : (
                <Bluetooth className={`w-5 h-5`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-ui font-medium text-white text-sm">FlowState Companion</h3>
                {status === "connected" && (
                  <span className="flex items-center gap-1 text-[10px] font-ui px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                {status === "connected"
                  ? `${deviceName || "ESP32"}${
                      lastSynced
                        ? ` · Synced ${new Date(lastSynced).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""
                    }`
                  : status === "connecting"
                  ? "Opening connection..."
                  : "ESP32 + GMT028-05 V1.1 Display"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === "connected" ? (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                title="Sync today's priorities to desk display"
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-ui font-medium transition-all glow-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {justSynced ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Synced!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Sending..." : "Sync"}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleConnectBLE}
                  disabled={status === "connecting" || !isSupported}
                  title="Connect via Web Bluetooth"
                  className="px-2.5 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary hover:text-white text-xs font-ui font-medium transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>BLE</span>
                </button>
                <button
                  onClick={handleConnectUSB}
                  disabled={status === "connecting" || !isSerialSupported}
                  title="Connect via USB Cable (Web Serial)"
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-ui font-medium transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                >
                  <Cable className="w-3.5 h-3.5 text-emerald-400" />
                  <span>USB</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-amber-300 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0 text-amber-400" />
            <span>{error}</span>
          </p>
        )}

        {lastHardwareEvent && status === "connected" && (
          <div className="mt-2 text-[10px] text-white/40 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary shrink-0" />
            <span>Hardware: {lastHardwareEvent}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Full variant for Settings > Devices tab ───────────────────
  return (
    <div className="space-y-5">

      {/* ── Main Connection Card ── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-black/40 space-y-6">

        {/* Top: Device Info & Live Status */}
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              status === "connected"
                ? "bg-primary/20 border border-primary/40 glow-primary"
                : status === "connecting"
                ? "bg-yellow-500/10 border border-yellow-500/30 animate-pulse"
                : "bg-white/5 border border-white/10"
            }`}
          >
            {connectionType === "serial" ? (
              <Cable className="w-7 h-7 text-emerald-400" />
            ) : (
              <Bluetooth
                className={`w-7 h-7 ${
                  status === "connected"
                    ? "text-primary"
                    : status === "connecting"
                    ? "text-yellow-400"
                    : "text-white/40"
                }`}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-ui text-white font-semibold text-lg md:text-xl truncate">
                ESP32-WROOM-32 Desk Companion
              </h3>
              {status === "connected" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-ui px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected · {deviceName || (connectionType === "serial" ? "USB Serial" : "Bluetooth")}
                </span>
              ) : status === "connecting" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-ui px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 font-medium">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Connecting...
                </span>
              ) : (
                <span className="text-xs font-ui px-3 py-1 rounded-full bg-white/5 text-white/50 border border-white/10">
                  Ready to Pair
                </span>
              )}
            </div>

            <p className="text-xs md:text-sm font-ui text-white/60 mt-1">
              Hardware: GMT028-05 V1.1 · 2.8&quot; 240×320 TFT (ST7789 SPI Portrait)
            </p>

            {lastSynced && status === "connected" && (
              <p className="text-xs font-ui text-emerald-400 mt-2 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Tasks and priorities synced at {new Date(lastSynced).toLocaleTimeString()}
              </p>
            )}

            {lastHardwareEvent && status === "connected" && (
              <p className="text-xs font-mono text-primary/80 mt-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                Hardware Event: {lastHardwareEvent}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: Dedicated Action Panel */}
        <div className="pt-4 border-t border-white/10">
          {status === "connected" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 min-w-[200px] px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-ui font-semibold transition-all glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                <span>
                  {justSynced ? "Synced to Display! ✓" : isSyncing ? "Transmitting Plan..." : "Sync Today's Plan to Screen"}
                </span>
              </button>
              <button
                onClick={disconnect}
                className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-ui transition-colors cursor-pointer"
              >
                Disconnect Device
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleConnectBLE}
                disabled={status === "connecting" || !isSupported}
                className="w-full p-4 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-left transition-all glow-primary cursor-pointer disabled:opacity-40 flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/30 border border-primary/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bluetooth className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-ui text-white font-semibold text-sm">
                    {status === "connecting" && connectionType !== "serial" ? "Scanning for BLE..." : "Pair via Web Bluetooth"}
                  </div>
                  <div className="text-[11px] font-ui text-white/50 truncate">
                    Wireless connection · FlowState-Display
                  </div>
                </div>
              </button>

              <button
                onClick={handleConnectUSB}
                disabled={status === "connecting" || !isSerialSupported}
                className="w-full p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all cursor-pointer disabled:opacity-40 flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Cable className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-ui text-emerald-300 font-semibold text-sm">
                    {status === "connecting" && connectionType === "serial" ? "Opening COM Port..." : "Connect via USB (Serial)"}
                  </div>
                  <div className="text-[11px] font-ui text-emerald-200/50 truncate">
                    Direct COM port (e.g. COM13) · Fast sync
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Step-by-Step BLE Setup Guide (shown when not connected) ── */}
      {status !== "connected" && (
        <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <h4 className="text-sm font-ui font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            How to Connect via Web Bluetooth
          </h4>

          {/* Windows note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs font-ui text-emerald-200/90 leading-relaxed">
              <strong className="text-emerald-300">Good news for Windows users:</strong> Web Bluetooth works natively in Chrome on Windows — no flags to enable.
              The <code className="text-[11px] bg-black/40 px-1 rounded">chrome://flags/#enable-web-bluetooth</code> flag is Linux-only and won&apos;t appear here.
            </p>
          </div>

          <ol className="space-y-3">
            {[
              {
                n: 1,
                title: "Flash your ESP32 with the updated firmware",
                desc: 'Open FlowState_H1/FlowState_H1.ino in Arduino IDE → Select your ESP32 board → Upload. The TFT screen will show "READY TO PAIR" and show a blue STANDBY badge.',
              },
              {
                n: 2,
                title: "Make sure the ESP32 is powered on and within 5 metres",
                desc: "BLE has limited range. Keep the ESP32 close to your laptop, powered via USB or a power bank. The TFT should be lit up showing the pairing screen.",
              },
              {
                n: 3,
                title: 'Click "Pair via Web Bluetooth" above',
                desc: 'A system chooser will pop up. Look for "FlowState-Display" in the list. If the list is empty, the ESP32 is not advertising yet — try pressing RST on the board.',
              },
              {
                n: 4,
                title: "Data syncs automatically on connect",
                desc: "Your today's tasks, energy level, and priorities are sent to the display immediately. The TFT switches from 'READY TO PAIR' to your current focus task.",
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold font-ui flex items-center justify-center shrink-0 mt-0.5">
                  {step.n}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-ui font-medium text-white">{step.title}</p>
                  <p className="text-xs font-ui text-white/50 leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* USB alternative callout */}
          <div className="mt-2 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
            <Cable className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs font-ui text-emerald-200/80 leading-relaxed">
              <strong className="text-emerald-300">Easiest option — no Bluetooth needed:</strong> Plug your ESP32 via USB and click{" "}
              <strong className="text-emerald-300">&quot;Connect via USB (Serial)&quot;</strong> above. Select your COM port (e.g. COM13) and your data syncs instantly.
            </p>
          </div>
        </div>
      )}

      {/* ── Error box ── */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="text-xs font-ui font-semibold text-amber-200">{error}</p>
            {/* Bluetooth not supported at all */}
            {!isSupported && (
              <p className="text-xs font-ui text-amber-200/70">
                Your browser doesn&apos;t support Web Bluetooth. Please use <strong>Chrome</strong> or <strong>Edge</strong> on desktop.
              </p>
            )}
            {/* Suggest USB as fallback */}
            {isSerialSupported && (
              <p className="text-xs font-ui text-emerald-300/80">
                → Try <strong>Connect via USB (Serial)</strong> instead — it works on any Chrome/Edge version.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Hardware Config + Live Payload ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pinout */}
        <div className="p-5 rounded-xl border border-white/10 bg-black/30 space-y-3">
          <h4 className="text-xs font-ui uppercase font-semibold tracking-wider text-white/70 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-primary" /> Verified Wiring (LOCKED)
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {[
              ["TFT_CS", "GPIO 5"],
              ["TFT_DC", "GPIO 21"],
              ["TFT_RST", "GPIO 22"],
              ["TFT_SCLK", "GPIO 18"],
              ["TFT_MOSI", "GPIO 23"],
              ["MISO", "Not Connected"],
            ].map(([pin, gpio]) => (
              <div key={pin} className="p-2 rounded bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-white/40">{pin}</span>
                <span className={gpio === "Not Connected" ? "text-white/25 italic" : "text-primary font-bold"}>
                  {gpio}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-1 space-y-1">
            <p className="text-[11px] text-white/40">ST7789 · SPI VSPI · 240×320 Portrait</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-mono text-white/30 truncate">BLE: {FLOWSTATE_SERVICE_UUID}</p>
              <button onClick={copyUUID} className="text-[10px] font-ui text-white/40 hover:text-white transition-colors cursor-pointer shrink-0">
                {uuidCopied ? "✓" : <Copy className="w-2.5 h-2.5 inline" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Payload Preview */}
        <div className="p-5 rounded-xl border border-white/10 bg-black/30 space-y-3">
          <h4 className="text-xs font-ui uppercase font-semibold tracking-wider text-white/70 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Live Priorities Payload
          </h4>
          <div className="text-xs font-mono bg-black/60 p-3 rounded-lg border border-white/5 text-white/70 overflow-x-auto leading-relaxed">
            <pre>{JSON.stringify(previewPayload, null, 2)}</pre>
          </div>
          {focusTask ? (
            <p className="text-[11px] text-emerald-400/70 flex items-center gap-1">
              <Check className="w-3 h-3" /> {activeTasks.length} active task{activeTasks.length !== 1 ? "s" : ""} ready to sync
            </p>
          ) : (
            <p className="text-[11px] text-white/30">No tasks yet — add tasks in the Tasks tab first.</p>
          )}
        </div>
      </div>
    </div>
  );
}
