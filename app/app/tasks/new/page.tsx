"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Clock, CalendarDays, Flag, Tag, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useFlowState } from "@/lib/FlowStateProvider";
import { Category, Priority } from "@/types";

export default function NewTask() {
  const router = useRouter();
  const { addTask } = useFlowState();
  
  const [nlInput, setNlInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Academics");
  const [duration, setDuration] = useState("60");
  const [deadline, setDeadline] = useState("Today");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [isSaving, setIsSaving] = useState(false);

  const handleNLExtract = async () => {
    if (!nlInput.trim() || isExtracting) return;
    setIsExtracting(true);
    setExtractError(null);
    setExtractedNotice(null);

    try {
      const res = await fetch("/api/ai/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: nlInput.trim(),
          currentDate: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze task description.");
      }

      if (data.title) setTitle(data.title);
      if (data.category) setCategory(data.category);
      if (data.estimatedMinutes) setDuration(String(data.estimatedMinutes));
      if (data.deadline) setDeadline(data.deadline);
      if (data.priority) setPriority(data.priority);

      setExtractedNotice("Task understood! Review or adjust the fields on the right, then save.");
    } catch (err: any) {
      setExtractError(err?.message || "Could not extract task details. You can enter them manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    
    try {
      setIsSaving(true);
      await addTask({
        title: title.trim(),
        category,
        deadline: deadline || "No Deadline",
        estimatedDuration: parseInt(duration, 10) || 60,
        completedMinutes: 0,
        priority,
        status: "Pending",
        planAction: "NONE",
      });
      router.push("/app/tasks");
    } catch (err) {
      console.error("Failed to create task:", err);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      <header className="space-y-4">
        <Link href="/app/tasks" className="text-white/50 hover:text-white font-ui text-sm flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </Link>
        <h1 className="font-display text-3xl md:text-4xl text-white">Create Task</h1>
      </header>

      <div className="grid md:grid-cols-5 gap-8">
        
        {/* AI Input Panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card p-6 border-primary/30 bg-primary/[0.03] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="font-ui font-semibold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" /> Groq AI Input
            </h3>
            <p className="font-ui text-xs text-white/60 mb-4">
              Describe your task naturally. Groq will structure the title, category, duration, and deadline.
            </p>
            <textarea
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder='e.g. "Finish my electronics assignment on MOSFETs by Friday. It should take about 2 hours."'
              className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-white font-ui text-sm focus:outline-none focus:border-primary transition-colors resize-none mb-3"
            />

            {extractError && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-ui leading-relaxed">{extractError}</span>
              </div>
            )}

            {extractedNotice && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-ui leading-relaxed">{extractedNotice}</span>
              </div>
            )}

            <button 
              onClick={handleNLExtract}
              disabled={isExtracting || !nlInput.trim()}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-ui text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-primary cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Understanding your task…
                </>
              ) : (
                <>
                  Understand Task <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Manual / Review Form */}
        <div className="md:col-span-3 glass-card p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-ui text-white/80">Task Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-ui text-white/80 flex items-center gap-2"><Tag className="w-4 h-4" /> Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="Academics">Academics</option>
                  <option value="Projects">Projects</option>
                  <option value="Personal">Personal</option>
                  <option value="Exams">Exams</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-ui text-white/80 flex items-center gap-2"><Clock className="w-4 h-4" /> Est. Duration (min)</label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  min="5"
                  max="1440"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-ui text-white/80 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Deadline</label>
                <input 
                  type="text" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. Today, Friday, 2026-10-02"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-ui text-white/80 flex items-center gap-2"><Flag className="w-4 h-4" /> Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-ui focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
             <Link 
               href="/app/tasks"
               className="px-6 py-3 rounded-lg border border-white/10 text-white font-ui hover:bg-white/5 transition-colors"
             >
               Cancel
             </Link>
             <button 
               onClick={handleSave}
               disabled={!title.trim() || isSaving}
               className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-ui font-medium transition-colors glow-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
             >
               {isSaving ? "Saving…" : "Save Task"}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
