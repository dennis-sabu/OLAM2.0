"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

type FlashStep =
  | "idle"
  | "connecting"
  | "erasing"
  | "flashing"
  | "done"
  | "error";

interface FlashLog {
  type: "info" | "success" | "error" | "progress";
  msg: string;
  ts: number;
}

const MANIFEST_URL = "/firmware/manifest.json";
// esp-web-tools CDN build (no npm install needed)
const ESP_WEB_TOOLS_CDN =
  "https://unpkg.com/esp-web-tools@10/dist/web/install-button.js";

/**
 * FirmwareFlashPanel – flashes the FlowState companion firmware onto any
 * ESP32 directly from the browser using esp-web-tools (loaded from CDN).
 *
 * Works via USB / Web Serial – no local toolchain needed.
 */
export function FirmwareFlashPanel() {
  const [step, setStep] = useState<FlashStep>("idle");
  const [logs, setLogs] = useState<FlashLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [toolReady, setToolReady] = useState(false);
  const [isSerialSupported, setIsSerialSupported] = useState(false);
  const installBtnRef = useRef<HTMLElement | null>(null);

  const addLog = (type: FlashLog["type"], msg: string) =>
    setLogs((prev) => [...prev.slice(-200), { type, msg, ts: Date.now() }]);

  // Web Serial support check
  useEffect(() => {
    setIsSerialSupported("serial" in navigator);
  }, []);

  // Dynamically load esp-web-tools from CDN once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (customElements.get("esp-web-install-button")) {
      setToolReady(true);
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = ESP_WEB_TOOLS_CDN;
    script.onload = () => setToolReady(true);
    script.onerror = () => console.warn("esp-web-tools CDN load failed");
    document.head.appendChild(script);
  }, []);

  // Wire up custom-element event listeners after it mounts
  useEffect(() => {
    const btn = installBtnRef.current;
    if (!btn) return;

    const handler = (e: Event) => {
      const state = (e as CustomEvent).detail?.state as string | undefined;
      if (!state) return;
      if (state === "initializing") {
        setStep("connecting");
        setProgress(0);
        addLog("info", "Connecting to ESP32…");
      } else if (state === "preparing") {
        setStep("erasing");
        addLog("info", "Erasing flash memory…");
      } else if (state === "writing") {
        setStep("flashing");
        const pct = (e as CustomEvent).detail?.details?.percentage ?? 0;
        setProgress(Math.round(pct));
        addLog("progress", `Writing firmware… ${Math.round(pct)}%`);
      } else if (state === "finished") {
        setStep("done");
        setProgress(100);
        addLog("success", "✅ Firmware flashed successfully! Reboot ESP32.");
      } else if (state === "error") {
        setStep("error");
        addLog(
          "error",
          (e as CustomEvent).detail?.message || "Flash failed. Check connection and retry."
        );
      }
    };

    btn.addEventListener("state-changed", handler);
    return () => btn.removeEventListener("state-changed", handler);
  }, [toolReady]);

  // Auto-scroll logs
  useEffect(() => {
    if (showLogs) logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, showLogs]);

  const stepLabel: Record<FlashStep, string> = {
    idle: "Ready to Flash",
    connecting: "Connecting to ESP32…",
    erasing: "Erasing flash memory…",
    flashing: "Flashing firmware…",
    done: "Flash Complete!",
    error: "Flash Failed",
  };

  const stepColor: Record<FlashStep, string> = {
    idle: "text-white/50",
    connecting: "text-yellow-400",
    erasing: "text-amber-400",
    flashing: "text-primary",
    done: "text-emerald-400",
    error: "text-red-400",
  };

  return (
    <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Cpu className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-ui font-semibold text-white flex items-center gap-2">
            Flash FlowState Firmware
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              v1.0.0
            </span>
          </h4>
          <p className="text-[11px] font-ui text-white/50 mt-0.5">
            Flash the companion firmware to any ESP32-WROOM-32 — no IDE needed.
          </p>
        </div>
      </div>

      {/* Requirements note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] font-ui text-blue-200/80 leading-relaxed">
          <strong className="text-blue-300">Requirements:</strong> Chrome or
          Edge on desktop · USB cable connected to ESP32 · No other serial
          monitor open on the same COM port.
        </p>
      </div>

      {/* Target hardware info */}
      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
        {[
          ["Board", "ESP32-WROOM-32"],
          ["Display", "ST7789 240×320"],
          ["Interface", "BLE + USB Serial"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="px-2.5 py-2 rounded-lg bg-black/40 border border-white/5 space-y-0.5"
          >
            <div className="text-white/30 text-[9px] uppercase tracking-wide">
              {k}
            </div>
            <div className="text-white/70 leading-tight">{v}</div>
          </div>
        ))}
      </div>

      {/* ── Main Flash Button ── */}
      {isSerialSupported ? (
        <div className="space-y-2">
          <p className="text-[11px] font-ui text-white/50">
            Click the button below — select your ESP32 COM port and the firmware
            will be written automatically.
          </p>

          {toolReady ? (
            /* esp-web-install-button is a native custom element */
            // @ts-ignore
            <esp-web-install-button
              ref={(el: HTMLElement | null) => {
                installBtnRef.current = el;
              }}
              manifest={MANIFEST_URL}
            >
              <button
                slot="activate"
                className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-ui font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                Flash ESP32 with FlowState Firmware
              </button>
              {/* Slot for unsupported message (auto shown by lib when no Web Serial) */}
              <span slot="unsupported" className="hidden" />
            </esp-web-install-button>
          ) : (
            <button
              disabled
              className="w-full px-5 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/50 text-sm font-ui font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading flash tool…
            </button>
          )}
        </div>
      ) : (
        /* No Web Serial support */
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-ui font-semibold text-red-300">
              Web Serial not supported
            </p>
            <p className="text-[11px] font-ui text-red-200/70 leading-relaxed">
              Use <strong>Chrome</strong> or <strong>Edge</strong> on desktop.
              Firefox and Safari do not support Web Serial.
            </p>
          </div>
        </div>
      )}

      {/* Status row */}
      {step !== "idle" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-ui font-medium flex items-center gap-1.5 ${stepColor[step]}`}
            >
              {(step === "connecting" || step === "erasing" || step === "flashing") && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              {step === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {step === "error" && <AlertCircle className="w-3.5 h-3.5" />}
              {stepLabel[step]}
            </span>
            {step === "flashing" && (
              <span className="text-[11px] font-mono text-white/40">
                {progress}%
              </span>
            )}
          </div>
          {(step === "flashing" || step === "done") && (
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  step === "done"
                    ? "bg-emerald-400"
                    : "bg-gradient-to-r from-primary to-amber-400"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {step === "done" && (
            <p className="text-[11px] font-ui text-emerald-400/80">
              🎉 Reboot your ESP32 (press RST or replug USB). It will show
              "READY TO PAIR" and start advertising BLE.
            </p>
          )}
        </div>
      )}

      {/* Footer: manual download + log toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <a
          href="/firmware/firmware.bin"
          download="flowstate-firmware.bin"
          className="text-[11px] font-ui text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3 h-3" />
          Download .bin (manual flash)
        </a>
        <button
          onClick={() => setShowLogs((v) => !v)}
          className="text-[11px] font-ui text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showLogs ? "Hide" : "Show"} log
        </button>
      </div>

      {/* Log console */}
      {showLogs && (
        <div className="p-3 rounded-lg bg-black/70 border border-white/5 text-[11px] font-mono max-h-36 overflow-y-auto space-y-0.5">
          {logs.length === 0 && (
            <span className="text-white/20">No log entries yet.</span>
          )}
          {logs.map((l, i) => (
            <div
              key={i}
              className={
                l.type === "error"
                  ? "text-red-400"
                  : l.type === "success"
                  ? "text-emerald-400"
                  : l.type === "progress"
                  ? "text-amber-400"
                  : "text-white/50"
              }
            >
              <span className="text-white/20">
                [{new Date(l.ts).toLocaleTimeString([], { hour12: false })}]
              </span>{" "}
              {l.msg}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}
