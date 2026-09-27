"use client";

import { useState, useEffect } from "react";
import { User, Bell, Shield, Smartphone, ChevronRight, Check, Copy, Eye, EyeOff, Cpu, Wifi, RefreshCw } from "lucide-react";
import { useFlowState } from "@/lib/FlowStateProvider";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Settings() {
  const { profile, setProfile } = useFlowState();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  
  // Local state for profile edits
  const [localName, setLocalName] = useState(profile.name);
  const [localFocus, setLocalFocus] = useState(profile.focusArea);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hardware Companion state
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [deviceLastSeen, setDeviceLastSeen] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  useEffect(() => {
    setLocalName(profile.name);
    setLocalFocus(profile.focusArea);
  }, [profile.name, profile.focusArea]);

  useEffect(() => {
    if (activeTab === "Devices") {
      fetchDeviceDetails();
    }
  }, [activeTab]);

  const fetchDeviceDetails = async () => {
    setIsTokenLoading(true);
    try {
      const res = await fetch("/api/device/token");
      if (res.ok) {
        const data = await res.json();
        setDeviceToken(data.deviceToken);
        setDeviceLastSeen(data.deviceLastSeen);
      }
    } catch (e) {
      console.error("Failed to load device details:", e);
    } finally {
      setIsTokenLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    setIsTokenLoading(true);
    try {
      const res = await fetch("/api/device/token", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDeviceToken(data.deviceToken);
        setShowToken(true);
      }
    } catch (e) {
      console.error("Failed to generate device token:", e);
    } finally {
      setIsTokenLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!confirm("Are you sure you want to disconnect this device?")) return;
    setIsTokenLoading(true);
    try {
      const res = await fetch("/api/device/token", { method: "DELETE" });
      if (res.ok) {
        setDeviceToken(null);
        setDeviceLastSeen(null);
      }
    } catch (e) {
      console.error("Failed to revoke device token:", e);
    } finally {
      setIsTokenLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (!deviceToken) return;
    navigator.clipboard.writeText(deviceToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const tabs = ["Profile", "Preferences", "Devices", "Security"];

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await setProfile({ ...profile, name: localName, focusArea: localFocus });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      <header className="space-y-2">
        <h1 className="font-display text-3xl md:text-4xl text-white">Settings</h1>
      </header>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        
        {/* Navigation Tabs */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-ui text-sm transition-all ${
                activeTab === tab 
                  ? "bg-primary text-white font-medium" 
                  : "bg-transparent text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {tab === "Profile" && <User className="w-4 h-4" />}
                {tab === "Preferences" && <Bell className="w-4 h-4" />}
                {tab === "Devices" && <Smartphone className="w-4 h-4" />}
                {tab === "Security" && <Shield className="w-4 h-4" />}
                {tab}
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === tab ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {activeTab === "Profile" && (
            <div className="glass-card p-6 md:p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-display text-white mb-2">Profile Information</h2>
                <p className="text-sm font-ui text-white/50">Update your account details.</p>
              </div>
              
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-ui text-white/80">First Name</label>
                  <input 
                    type="text" 
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white font-ui focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-ui text-white/80">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ""} 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white/60 font-ui focus:outline-none border-dashed transition-colors cursor-not-allowed" 
                    disabled
                  />
                  <p className="text-xs text-white/40">Managed by your authentication account.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-ui text-white/80">Primary Focus Area</label>
                  <select 
                    value={localFocus}
                    onChange={(e) => setLocalFocus(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white font-ui focus:outline-none focus:border-primary transition-colors appearance-none"
                  >
                    <option>Academics</option>
                    <option>Projects</option>
                    <option>Personal</option>
                    <option>Exams</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-ui text-sm font-medium transition-colors glow-primary disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saveSuccess && <Check className="w-4 h-4 text-emerald-300" />}
                  {isSaving ? "Saving…" : saveSuccess ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Preferences" && (
            <div className="glass-card p-6 md:p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-display text-white mb-2">Preferences</h2>
                <p className="text-sm font-ui text-white/50">Manage your theme and notifications.</p>
              </div>
              
              <div className="space-y-6">
                 {/* Theme */}
                 <div className="space-y-3">
                   <h3 className="font-ui text-white font-medium">Theme</h3>
                   <div className="flex gap-4">
                     <button className="flex-1 p-4 rounded-lg border-2 border-primary bg-primary/10 flex flex-col items-center justify-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-[#110C1B] border border-white/20 flex items-center justify-center">
                         <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                       </div>
                       <span className="text-sm font-ui text-white">FlowState Dark</span>
                     </button>
                     <button className="flex-1 p-4 rounded-lg border-2 border-white/5 bg-white/5 flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                       <div className="w-8 h-8 rounded-full bg-white border border-black/20 flex items-center justify-center">
                         <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                       </div>
                       <span className="text-sm font-ui text-white">Light Mode</span>
                     </button>
                   </div>
                 </div>

                 {/* Notifications */}
                 <div className="space-y-3">
                   <h3 className="font-ui text-white font-medium">Notifications</h3>
                   <div className="space-y-2">
                     <label className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/40">
                       <span className="text-sm font-ui text-white">Daily Planning Reminder</span>
                       <input type="checkbox" defaultChecked className="accent-primary w-4 h-4 cursor-pointer" />
                     </label>
                     <label className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/40">
                       <span className="text-sm font-ui text-white">Task Deadline Alerts</span>
                       <input type="checkbox" defaultChecked className="accent-primary w-4 h-4 cursor-pointer" />
                     </label>
                     <label className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/40">
                       <span className="text-sm font-ui text-white">Capacity Warnings</span>
                       <input type="checkbox" defaultChecked className="accent-primary w-4 h-4 cursor-pointer" />
                     </label>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "Devices" && (
            <div className="glass-card p-6 md:p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display text-white mb-1">Hardware Companion</h2>
                  <p className="text-sm font-ui text-white/50">
                    Connect your physical ESP32-S3 desk display to track focus in real-time.
                  </p>
                </div>
                <button
                  onClick={fetchDeviceDetails}
                  disabled={isTokenLoading}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-ui flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTokenLoading ? "animate-spin" : ""}`} /> Refresh Status
                </button>
              </div>

              {/* Status Card */}
              <div className="p-5 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Cpu className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-ui text-white font-medium flex items-center gap-2">
                      ESP32-S3 Desk Companion
                      {deviceToken ? (
                        deviceLastSeen ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-ui px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-ui px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Token Active (Waiting for device)
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] font-ui px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                          Disconnected
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-ui text-white/40 mt-1">
                      Display: GMT028-05 V1.1 (240×320 ILI9341 SPI)
                      {deviceLastSeen && ` · Last synced: ${new Date(deviceLastSeen).toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>

                {!deviceToken ? (
                  <button
                    onClick={handleGenerateToken}
                    disabled={isTokenLoading}
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-ui font-medium transition-colors glow-primary shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    Pair Device
                  </button>
                ) : (
                  <button
                    onClick={handleRevokeToken}
                    disabled={isTokenLoading}
                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs font-ui transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    Revoke Token
                  </button>
                )}
              </div>

              {/* Device Token Section */}
              {deviceToken && (
                <div className="space-y-3 p-5 rounded-xl border border-primary/20 bg-primary/[0.02]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-ui uppercase font-semibold tracking-wider text-primary">
                      Device Authentication Token
                    </label>
                    <span className="text-xs text-white/40 font-ui">Required in ESP32 firmware</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showToken ? "text" : "password"}
                        value={deviceToken}
                        readOnly
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setShowToken(!showToken)}
                      title={showToken ? "Hide token" : "Show token"}
                      className="p-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleCopyToken}
                      title="Copy to clipboard"
                      className="px-4 py-2.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-sm font-ui flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {tokenCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-white/40 font-ui leading-relaxed">
                    Paste this token into <code className="text-white/70">config.h</code> in the ESP32 firmware. Keep it secret.
                  </p>
                </div>
              )}

              {/* Wiring Guide */}
              <div className="space-y-4 pt-2">
                <h3 className="font-ui text-sm font-semibold text-white/90">
                  Confirmed Hardware Wiring (ESP32-S3 ↔ GMT028-05 V1.1)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-ui">
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-white/40 block">TFT SCK (Clock)</span>
                    <span className="font-mono text-primary font-bold text-sm">GPIO 12</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-white/40 block">TFT SDA (MOSI)</span>
                    <span className="font-mono text-primary font-bold text-sm">GPIO 11</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-white/40 block">TFT CS (Chip Select)</span>
                    <span className="font-mono text-primary font-bold text-sm">GPIO 14</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-white/40 block">TFT DC (Data/Cmd)</span>
                    <span className="font-mono text-primary font-bold text-sm">GPIO 9</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-white/40 block">TFT RST (Reset)</span>
                    <span className="font-mono text-primary font-bold text-sm">GPIO 10</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-white/40 block">BOOT Button (Action)</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">GPIO 0</span>
                  </div>
                </div>
                <p className="text-xs text-white/40 font-ui">
                  Power: Connect TFT VCC to 3.3V and GND to GND. Backlight is hardwired on the GMT028-05 board.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="glass-card p-6 md:p-8 text-center py-20 text-white/40 font-ui animate-in slide-in-from-right-4 duration-300">
              Security settings coming soon.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
