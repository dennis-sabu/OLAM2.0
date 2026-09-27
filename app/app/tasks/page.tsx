"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Clock, CheckCircle2, Circle, Trash2, Sparkles } from "lucide-react";
import { useFlowState } from "@/lib/FlowStateProvider";
import { formatDuration } from "@/lib/flowstate";
import { Task, Category, Priority } from "@/types";
import { TaskBreakdownModal } from "@/components/TaskBreakdownModal";

export default function Tasks() {
  const { tasks, addTask, completeTask, markIncomplete, deleteTask, isLoading } = useFlowState();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);

  const categories = ["All", "Academics", "Projects", "Personal", "Exams"];

  const filteredTasks = tasks.filter(t => {
    if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (task.status === "Completed") {
      await markIncomplete(id);
    } else {
      await completeTask(id);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTask(id);
  };

  const handleAddSubtasks = async (
    newSubtasks: {
      title: string;
      category: Category;
      deadline: string;
      estimatedDuration: number;
      priority: Priority;
    }[]
  ) => {
    for (const sub of newSubtasks) {
      await addTask({
        title: sub.title,
        category: sub.category,
        deadline: sub.deadline,
        estimatedDuration: sub.estimatedDuration,
        completedMinutes: 0,
        priority: sub.priority,
        status: "Pending",
        planAction: "NONE",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-white">All Tasks</h1>
          <p className="font-ui text-white/60">Manage your entire workload repository.</p>
        </div>
        <Link 
          href="/app/tasks/new"
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-ui font-medium transition-colors flex items-center justify-center gap-2 glow-primary"
        >
          <Plus className="w-5 h-5" /> New Task
        </Link>
      </header>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white font-ui text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter className="w-4 h-4 text-white/40 hidden md:block" />
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-ui whitespace-nowrap transition-colors ${
                categoryFilter === c 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 z-10 relative">
        {isLoading ? (
          <div className="text-center py-20 text-white/40 font-ui flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading tasks from database…</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 text-white/40 font-ui space-y-3">
            <p className="text-lg text-white/70">No tasks yet</p>
            <p className="text-sm text-white/40">Add your first task to start organizing your day.</p>
            <div className="pt-2">
              <Link 
                href="/app/tasks/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 font-ui text-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Create First Task
              </Link>
            </div>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group border-l-2" 
              style={{borderLeftColor: task.priority === 'High' ? 'var(--color-reduce)' : task.priority === 'Medium' ? 'var(--color-primary)' : 'transparent'}}
            >
              <div className="flex items-start sm:items-center gap-4">
                <button 
                  onClick={() => toggleStatus(task.id)}
                  className="mt-1 sm:mt-0 text-white/40 hover:text-keep transition-colors cursor-pointer"
                  title={task.status === "Completed" ? "Mark incomplete" : "Mark completed"}
                >
                  {task.status === "Completed" ? (
                    <CheckCircle2 className="w-6 h-6 text-keep" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                <div>
                  <h3 className={`font-ui font-medium text-lg ${task.status === 'Completed' ? 'text-white/40 line-through' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-ui">
                    <span className={`px-2 py-0.5 rounded border ${
                      task.priority === 'High' ? 'text-reduce border-reduce/30 bg-reduce/10' :
                      task.priority === 'Medium' ? 'text-primary border-primary/30 bg-primary/10' :
                      'text-white/60 border-white/20 bg-white/5'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-white/50">{task.category}</span>
                    <span className="text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(task.estimatedDuration)}</span>
                    <span className="text-white/50 border-l border-white/10 pl-4">Due: {task.deadline}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pl-10 sm:pl-0">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-black/40 border ${
                    task.planAction === 'KEEP' ? 'text-keep border-keep/30' : 
                    task.planAction === 'REDUCE' ? 'text-reduce border-reduce/30' : 
                    task.planAction === 'MOVE' ? 'text-move border-move/30' :
                    'text-white/40 border-white/10'
                  }`}>
                    {task.planAction !== 'NONE' ? task.planAction : 'UNPLANNED'}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setBreakdownTask(task);
                  }}
                  title="Break down task with AI"
                  className="px-2.5 py-1 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-ui opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Break down</span>
                </button>
                <button 
                  onClick={(e) => handleDelete(task.id, e)}
                  title="Delete task"
                  className="p-2 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <TaskBreakdownModal
        task={breakdownTask}
        isOpen={Boolean(breakdownTask)}
        onClose={() => setBreakdownTask(null)}
        onAddSubtasks={handleAddSubtasks}
      />
    </div>
  );
}
