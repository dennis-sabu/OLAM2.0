"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Check, Loader2, AlertCircle, Plus } from "lucide-react";
import { Task, Category, Priority } from "@/types";
import { formatDuration } from "@/lib/flowstate";

interface SubtaskItem {
  id: string;
  title: string;
  estimatedMinutes: number;
  selected: boolean;
}

interface TaskBreakdownModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onAddSubtasks: (
    newTasks: {
      title: string;
      category: Category;
      deadline: string;
      estimatedDuration: number;
      priority: Priority;
    }[]
  ) => Promise<void>;
}

export function TaskBreakdownModal({
  task,
  isOpen,
  onClose,
  onAddSubtasks,
}: TaskBreakdownModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isOpen || !task) {
      setSubtasks([]);
      setError(null);
      setLoading(false);
      return;
    }

    async function fetchBreakdown() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/breakdown-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: {
              title: task!.title,
              category: task!.category,
              deadline: task!.deadline,
              estimatedMinutes: task!.estimatedDuration,
              priority: task!.priority,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to generate task breakdown.");
        }

        const items: SubtaskItem[] = (data.subtasks || []).map(
          (s: { title: string; estimatedMinutes: number }, idx: number) => ({
            id: `subtask-${idx}-${Date.now()}`,
            title: s.title,
            estimatedMinutes: s.estimatedMinutes,
            selected: true,
          })
        );

        setSubtasks(items);
      } catch (err: any) {
        setError(err?.message || "Could not generate subtasks at this moment.");
      } finally {
        setLoading(false);
      }
    }

    fetchBreakdown();
  }, [isOpen, task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !task) return null;

  const toggleSelect = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const selectedCount = subtasks.filter((s) => s.selected).length;
  const totalSelectedMinutes = subtasks
    .filter((s) => s.selected)
    .reduce((sum, s) => sum + s.estimatedMinutes, 0);

  const handleConfirm = async () => {
    const toAdd = subtasks
      .filter((s) => s.selected)
      .map((s) => ({
        title: s.title,
        category: task.category,
        deadline: task.deadline,
        estimatedDuration: s.estimatedMinutes,
        priority: task.priority,
      }));

    if (toAdd.length === 0) return;

    try {
      setIsAdding(true);
      await onAddSubtasks(toAdd);
      onClose();
    } catch (err) {
      console.error("Failed to add subtasks:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-card border border-primary/30 bg-[#0d0918]/95 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-ui font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Task Breakdown
            </div>
            <h2 className="font-display text-2xl text-white line-clamp-1">{task.title}</h2>
            <p className="font-ui text-xs text-white/50 mt-1">
              Groq generated actionable subtasks for your schedule. Select the ones you want to add.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-ui text-sm text-white/60">Breaking down task into logical steps…</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide">Breakdown notice</p>
                <p className="mt-1 font-ui leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && subtasks.length === 0 && (
            <div className="py-8 text-center text-white/40 font-ui text-sm">
              No subtasks generated. You can close this window and organize the task manually.
            </div>
          )}

          {!loading && subtasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-ui text-white/40 pb-1">
                <span>Suggested Subtasks ({subtasks.length})</span>
                <span>Selected: {formatDuration(totalSelectedMinutes)}</span>
              </div>

              {subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSelect(st.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                    st.selected
                      ? "bg-primary/10 border-primary/40 text-white"
                      : "bg-black/30 border-white/5 text-white/40 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        st.selected
                          ? "bg-primary border-primary text-white"
                          : "border-white/20 bg-black/40"
                      }`}
                    >
                      {st.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="font-ui text-sm truncate">{st.title}</span>
                  </div>

                  <span className="text-xs font-ui text-white/50 shrink-0 px-2 py-0.5 rounded bg-white/5">
                    {formatDuration(st.estimatedMinutes)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 bg-black/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-white font-ui text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading || selectedCount === 0 || isAdding}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-ui text-sm font-medium transition-colors glow-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add {selectedCount} Selected
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
