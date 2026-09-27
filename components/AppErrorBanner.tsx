"use client";

import { useFlowState } from "@/lib/FlowStateProvider";
import { AlertCircle, X } from "lucide-react";

export function AppErrorBanner() {
  const { error, clearError } = useFlowState();

  if (!error) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
      <div className="glass-card p-4 border border-red-500/30 bg-red-950/60 shadow-2xl flex items-start gap-3 backdrop-blur-xl">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Sync Notice</p>
          <p className="text-sm font-ui text-white/90 leading-snug">{error}</p>
        </div>
        <button
          onClick={clearError}
          className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
