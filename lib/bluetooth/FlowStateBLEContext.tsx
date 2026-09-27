"use client";

import React, { createContext, useContext } from "react";
import { useFlowStateBLE, BLEStatus, ConnectionType, CompanionPayload } from "./useFlowStateBLE";
import { Task, DailyState, PlanItem } from "@/types";

interface FlowStateBLEContextType {
  isSupported: boolean;
  isSerialSupported: boolean;
  status: BLEStatus;
  connectionType: ConnectionType;
  deviceName: string | null;
  error: string | null;
  lastSynced: Date | null;
  lastHardwareEvent: string | null;
  connect: () => Promise<boolean>;
  connectSerial: () => Promise<boolean>;
  disconnect: () => void;
  sendPayload: (payload: CompanionPayload) => Promise<boolean>;
  syncTodayPlan: (
    tasks: Task[],
    state: DailyState,
    capacity: number,
    plan: PlanItem[]
  ) => Promise<boolean>;
}

const FlowStateBLEContext = createContext<FlowStateBLEContextType | null>(null);

export function FlowStateBLEProvider({ children }: { children: React.ReactNode }) {
  const ble = useFlowStateBLE();

  return (
    <FlowStateBLEContext.Provider value={ble}>
      {children}
    </FlowStateBLEContext.Provider>
  );
}

export function useBLECompanion() {
  const ctx = useContext(FlowStateBLEContext);
  if (!ctx) {
    throw new Error("useBLECompanion must be used within a FlowStateBLEProvider");
  }
  return ctx;
}
