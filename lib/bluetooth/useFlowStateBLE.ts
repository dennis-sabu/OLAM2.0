"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Task, DailyState, PlanItem } from "@/types";

export const FLOWSTATE_SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
export const FLOWSTATE_RX_CHAR_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"; // Web -> ESP32
export const FLOWSTATE_TX_CHAR_UUID = "19b10002-e8f2-537e-4f6c-d104768a1214"; // ESP32 -> Web

export interface CompanionPayload {
  focus: string;
  sub?: string;
  mins: number;
  status: string;
  energy: number;
  capacity: number;
  keep1?: string;
  keep1_mins?: number;
  keep1_sub?: string;
  keep2?: string;
  reduce?: string;
  moveCount: number;
  running?: boolean;
}

export type BLEStatus = "disconnected" | "connecting" | "connected" | "error";
export type ConnectionType = "bluetooth" | "serial" | null;

export function useFlowStateBLE() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSerialSupported, setIsSerialSupported] = useState(false);
  const [status, setStatus] = useState<BLEStatus>("disconnected");
  const [connectionType, setConnectionType] = useState<ConnectionType>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [lastHardwareEvent, setLastHardwareEvent] = useState<string | null>(null);

  const deviceRef = useRef<any>(null);
  const rxCharRef = useRef<any>(null);
  const txCharRef = useRef<any>(null);
  const portRef = useRef<any>(null);
  // Refs so sendPayload always reads the live value, not stale closure state
  const statusRef = useRef<BLEStatus>("disconnected");
  const connectionTypeRef = useRef<ConnectionType>(null);

  // Helper wrappers to keep refs in sync with state
  const setStatusSynced = (s: BLEStatus) => { statusRef.current = s; setStatus(s); };
  const setConnectionTypeSynced = (t: ConnectionType) => { connectionTypeRef.current = t; setConnectionType(t); };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("bluetooth" in navigator) setIsSupported(true);
      if ("serial" in navigator) setIsSerialSupported(true);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current && deviceRef.current.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
      if (portRef.current) {
        portRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleTxNotification = useCallback((event: any) => {
    try {
      const value = event.target.value;
      const decoder = new TextDecoder("utf-8");
      const msg = decoder.decode(value);
      console.log("[Web Bluetooth TX Received]:", msg);
      
      const parsed = JSON.parse(msg);
      if (parsed.event) {
        setLastHardwareEvent(`${parsed.event} @ ${new Date().toLocaleTimeString()}`);
      }
    } catch (e) {
      console.error("[Web Bluetooth] Failed to decode notification:", e);
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !("bluetooth" in navigator)) {
      setError("Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.");
      setStatusSynced("error");
      return false;
    }

    try {
      setStatusSynced("connecting");
      setError(null);

      const nav = navigator as any;

      // Try strict filter first (works best when ESP32 is powered and advertising)
      // We add the service UUID to filters so Chrome on Windows can discover it.
      // If that finds nothing, fallback to acceptAllDevices so user can manually pick.
      let device: any;
      try {
        device = await nav.bluetooth.requestDevice({
          filters: [
            { name: "FlowState-Display" },
            { namePrefix: "FlowState" },
            { services: [FLOWSTATE_SERVICE_UUID] },
          ],
          optionalServices: [FLOWSTATE_SERVICE_UUID],
        });
      } catch (filterErr: any) {
        // If the filtered chooser was cancelled, propagate immediately
        if (filterErr.name === "NotFoundError" || filterErr.message?.includes("cancelled") || filterErr.message?.includes("User cancelled")) {
          throw filterErr;
        }
        // Otherwise try acceptAllDevices fallback (lets user pick any nearby BLE device)
        console.warn("[BLE] Filtered scan failed, trying acceptAllDevices fallback:", filterErr.message);
        device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [FLOWSTATE_SERVICE_UUID],
        });
      }

      deviceRef.current = device;
      setDeviceName(device.name || "FlowState-Display");
      setConnectionTypeSynced("bluetooth");

      device.addEventListener("gattserverdisconnected", () => {
        console.log("[Web Bluetooth] Device disconnected");
        setStatusSynced("disconnected");
        setDeviceName(null);
        setConnectionTypeSynced(null);
        rxCharRef.current = null;
        txCharRef.current = null;
      });

      console.log("[Web Bluetooth] Connecting to GATT server...");
      const server = await device.gatt.connect();

      console.log("[Web Bluetooth] Getting primary service...");
      const service = await server.getPrimaryService(FLOWSTATE_SERVICE_UUID);

      console.log("[Web Bluetooth] Getting characteristics...");
      const rxChar = await service.getCharacteristic(FLOWSTATE_RX_CHAR_UUID);
      rxCharRef.current = rxChar;

      try {
        const txChar = await service.getCharacteristic(FLOWSTATE_TX_CHAR_UUID);
        txCharRef.current = txChar;
        await txChar.startNotifications();
        txChar.addEventListener("characteristicvaluechanged", handleTxNotification);
      } catch (txErr) {
        console.warn("[Web Bluetooth] TX notifications not enabled:", txErr);
      }

      setStatusSynced("connected");
      console.log("[Web Bluetooth] Successfully connected!");
      return true;
    } catch (err: any) {
      console.error("[Web Bluetooth Connection Error]:", err);
      
      if (err.message?.includes("globally disabled") || err.message?.includes("disabled")) {
        setError("Web Bluetooth is disabled in Chrome flags. Enable it at chrome://flags/#enable-web-bluetooth or connect directly via USB cable below.");
        setStatusSynced("error");
      } else if (err.name === "NotFoundError" || err.message?.includes("cancelled") || err.message?.includes("User cancelled")) {
        setStatusSynced("disconnected");
      } else {
        setError(err.message || "Failed to connect to Bluetooth companion");
        setStatusSynced("error");
      }
      return false;
    }
  }, [handleTxNotification]);

  const connectSerial = useCallback(async () => {
    if (typeof window === "undefined" || !("serial" in navigator)) {
      setError("Web Serial is not supported in this browser. Please use Chrome or Edge.");
      setStatusSynced("error");
      return false;
    }

    try {
      setStatusSynced("connecting");
      setError(null);

      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;

      // Give the serial port 600ms to fully initialise before sending data
      await new Promise((res) => setTimeout(res, 600));

      setConnectionTypeSynced("serial");
      setDeviceName("ESP32 Companion (USB)");
      setStatusSynced("connected");
      return true;
    } catch (err: any) {
      console.error("[Web Serial Connection Error]:", err);
      if (err.name === "NotFoundError" || err.message?.includes("cancelled") || err.message?.includes("No port selected")) {
        setStatusSynced("disconnected");
      } else {
        setError(err.message || "Failed to open USB Serial port");
        setStatusSynced("error");
      }
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (deviceRef.current && deviceRef.current.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    if (portRef.current) {
      portRef.current.close().catch(() => {});
      portRef.current = null;
    }
    setStatusSynced("disconnected");
    setConnectionTypeSynced(null);
    setDeviceName(null);
    rxCharRef.current = null;
    txCharRef.current = null;
  }, []);

  const sendPayload = useCallback(async (payload: CompanionPayload) => {
    // Use refs to avoid stale closure — status/connectionType may not yet be updated in React state
    // when sendPayload is called immediately after connect()
    const liveStatus = statusRef.current;
    const liveConnectionType = connectionTypeRef.current;

    if (liveStatus !== "connected") {
      console.warn("[Companion] Cannot send: not connected (status:", liveStatus, ")");
      return false;
    }

    try {
      const jsonString = JSON.stringify(payload) + "\n";
      const encoder = new TextEncoder();
      const data = encoder.encode(jsonString);

      // Handle Web Serial transmission
      if (liveConnectionType === "serial" && portRef.current?.writable) {
        const writer = portRef.current.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
        setLastSynced(new Date());
        console.log("[Web Serial] Payload synced successfully:", payload);
        return true;
      }

      // Handle Web Bluetooth transmission
      if (liveConnectionType === "bluetooth" && rxCharRef.current) {
        const CHUNK_SIZE = 100;
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
          const chunk = data.slice(i, i + CHUNK_SIZE);
          if (rxCharRef.current.writeValueWithoutResponse) {
            await rxCharRef.current.writeValueWithoutResponse(chunk);
          } else {
            await rxCharRef.current.writeValue(chunk);
          }
          if (i + CHUNK_SIZE < data.length) {
            await new Promise((res) => setTimeout(res, 25));
          }
        }
        setLastSynced(new Date());
        console.log("[Web Bluetooth] Payload synced successfully:", payload);
        return true;
      }

      return false;
    } catch (err: any) {
      console.error("[Companion Send Error]:", err);
      setError("Failed to transmit data to ESP32: " + err.message);
      return false;
    }
  }, []); // no deps — uses refs for live values


  const syncTodayPlan = useCallback(
    async (
      tasks: Task[],
      state: DailyState,
      capacity: number,
      plan: PlanItem[]
    ) => {
      // Active = not completed. Include Pending, In Progress, Incomplete.
      const activeTasks = tasks.filter(
        (t) => t.status !== "Completed"
      );

      // In-progress takes highest priority for focus
      const inProgressTask = activeTasks.find((t) => t.status === "In Progress");

      // KEEP tasks = planAction is KEEP, NONE (not yet decided), or empty/undefined
      // NONE means the engine hasn't run or hasn't made a decision — treat as KEEP
      const keepTasks = activeTasks.filter(
        (t) => t.planAction === "KEEP" || t.planAction === "NONE" || !t.planAction
      );

      const reduceTasks = activeTasks.filter((t) => t.planAction === "REDUCE");
      const moveTasks = activeTasks.filter((t) => t.planAction === "MOVE");

      // Priority order: in-progress → keep → reduce → any active task
      const focusTask =
        inProgressTask ||
        keepTasks[0] ||
        reduceTasks[0] ||
        activeTasks[0];

      if (!focusTask) {
        // Truly nothing to do
        const payload: CompanionPayload = {
          focus: "All Caught Up!",
          sub: "Great job today",
          mins: 0,
          status: "COMPLETED",
          energy: state.energy,
          capacity,
          moveCount: 0,
          running: false,
        };
        return sendPayload(payload);
      }

      const planItem = plan.find((p) => p.taskId === focusTask.id);
      const durationMins =
        planItem?.plannedMinutes || focusTask.estimatedDuration || 30;

      // Other keeps shown as secondary tasks (exclude the focus itself)
      const otherKeeps = keepTasks.filter((t) => t.id !== focusTask.id);

      // Determine status label
      let statusLabel: string;
      if (inProgressTask) {
        statusLabel = "IN PROGRESS";
      } else if (focusTask.planAction === "REDUCE") {
        statusLabel = "REDUCE";
      } else {
        statusLabel = "KEEP";
      }

      const payload: CompanionPayload = {
        focus: focusTask.title,
        sub: focusTask.category || "Priority Task",
        mins: durationMins,
        status: statusLabel,
        energy: state.energy,
        capacity,
        keep1: otherKeeps[0]?.title || "",
        keep1_mins: otherKeeps[0]?.estimatedDuration || 30,
        keep1_sub: otherKeeps[0]?.category || "General",
        keep2: otherKeeps[1]?.title || "",
        reduce: reduceTasks[0]?.title || "",
        moveCount: moveTasks.length,
        running: inProgressTask ? true : false,
      };

      console.log("[Companion Sync] Sending payload:", JSON.stringify(payload));
      return sendPayload(payload);
    },
    [sendPayload]
  );

  return {
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
    sendPayload,
    syncTodayPlan,
  };
}
