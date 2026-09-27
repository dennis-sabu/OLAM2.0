import Hero from "@/components/Hero";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Battery,
  BrainCircuit,
  Calendar,
  Clock,
  BarChart3,
  Zap,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  ListTodo,
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-x-hidden bg-background">

      {/* ── Global Atmospheric Glows ── */}
      <div className="fixed top-[10%] left-[-15%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[140px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-accent/6 blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed top-[60%] left-[30%] w-[25%] h-[25%] rounded-full bg-primary/5 blur-[100px] -z-10 pointer-events-none" />

      {/* ── HERO (LOCKED) ── */}
      <Hero />

      {/* ── SECTION A: THE PROBLEM ── */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-36 pb-24 space-y-20 relative z-10">

        {/* Section label */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest">
            The Problem
          </span>
        </div>

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight">
            Your to-do list doesn't know{" "}
            <span className="italic text-accent">your day.</span>
          </h2>
          <p className="font-body text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
            Traditional task lists assume you have the exact same capacity every single day. They ignore energy, stress, sleep, and shifting time — leaving you drowning in unrealistic plans.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Battery,
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
              title: "Changing Energy",
              desc: "Some days you're locked in. Others you're completely drained. Your plan should know the difference."
            },
            {
              icon: Clock,
              color: "text-accent",
              bg: "bg-accent/10",
              border: "border-accent/20",
              title: "Shifting Time",
              desc: "Unexpected events eat your hours. Static lists don't care that you just lost two hours to a family emergency."
            },
            {
              icon: ShieldAlert,
              color: "text-reduce",
              bg: "bg-reduce/10",
              border: "border-reduce/20",
              title: "Overloaded Plans",
              desc: "Rolling 15 unfinished tasks to tomorrow creates anxiety spirals. You need a baseline that's actually achievable."
            }
          ].map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div key={title} className={`glass-card p-7 space-y-4 border ${border} group hover:scale-[1.02] transition-transform duration-300`}>
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-ui font-semibold text-white text-lg">{title}</h3>
              <p className="font-body text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION B: HOW IT WORKS ── */}
      <section id="how-it-works" className="w-full max-w-6xl mx-auto px-6 py-28 relative z-10">

        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest">
            How It Works
          </span>
        </div>

        <div className="text-center space-y-4 max-w-2xl mx-auto mb-20">
          <h2 className="font-display text-4xl md:text-5xl text-white">Four steps to a realistic day</h2>
          <p className="font-body text-white/50">FlowState runs through a simple loop — every single day.</p>
        </div>

        {/* Step cards with connector line */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: MessageSquare, title: "Capture your work", desc: "Brain-dump everything weighing on you — naturally, in plain text." },
              { step: "02", icon: Battery, title: "Log your state", desc: "Tell FlowState your energy, stress, sleep, and time. Takes 30 seconds." },
              { step: "03", icon: BrainCircuit, title: "Get a real plan", desc: "AI structures your workload to match your human capacity for today." },
              { step: "04", icon: TrendingUp, title: "Adapt as you go", desc: "Missed something? Recalculate instantly. Your plan bends so you don't break." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center space-y-4 relative group">
                {/* Step Circle */}
                <div className="w-[104px] h-[104px] rounded-2xl glass-card border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-1 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="font-display text-xl text-primary/60">{step}</span>
                </div>
                <h3 className="font-ui text-base text-white font-semibold leading-snug">{title}</h3>
                <p className="font-body text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION C: KEEP / REDUCE / MOVE ── */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-28 space-y-20 relative z-10">

        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest">
            The Framework
          </span>
        </div>

        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-white">Three intentional decisions</h2>
          <p className="font-body text-white/50">FlowState forces you to be honest about what actually belongs in today.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 space-y-5 border-t-[3px] border-t-keep relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-4 right-4 font-display text-6xl text-keep/5 group-hover:text-keep/10 transition-colors font-bold">K</div>
            <div className="w-12 h-12 rounded-full bg-keep/15 flex items-center justify-center text-keep">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-ui text-xs text-keep/70 uppercase tracking-widest font-bold">Keep</span>
              <h3 className="font-ui text-2xl text-white font-semibold mt-1">Work it.</h3>
            </div>
            <p className="font-body text-white/50 text-sm leading-relaxed">
              This task realistically fits your capacity today. Do it completely. E.g., the math assignment due tomorrow that you have 90 minutes to finish.
            </p>
          </div>

          <div className="glass-card p-8 space-y-5 border-t-[3px] border-t-reduce relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-4 right-4 font-display text-6xl text-reduce/5 group-hover:text-reduce/10 transition-colors font-bold">R</div>
            <div className="w-12 h-12 rounded-full bg-reduce/15 flex items-center justify-center text-reduce">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <span className="font-ui text-xs text-reduce/70 uppercase tracking-widest font-bold">Reduce</span>
              <h3 className="font-ui text-2xl text-white font-semibold mt-1">Scope it.</h3>
            </div>
            <p className="font-body text-white/50 text-sm leading-relaxed">
              Important, but do less of it today. E.g., write just the outline for a paper instead of attempting the full draft when you're running low on energy.
            </p>
          </div>

          <div className="glass-card p-8 space-y-5 border-t-[3px] border-t-move relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-4 right-4 font-display text-6xl text-move/5 group-hover:text-move/10 transition-colors font-bold">M</div>
            <div className="w-12 h-12 rounded-full bg-move/15 flex items-center justify-center text-move">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="font-ui text-xs text-move/70 uppercase tracking-widest font-bold">Move</span>
              <h3 className="font-ui text-2xl text-white font-semibold mt-1">Defer it.</h3>
            </div>
            <p className="font-body text-white/50 text-sm leading-relaxed">
              Not today. Safely push it without guilt. E.g., reading a textbook chapter that isn't urgent when essential capacity is already used up.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION D: MINIMUM VIABLE DAY ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-28 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest mb-6">
                Core Concept
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-white leading-tight mt-4">
                Minimum{" "}
                <span className="italic text-accent">Viable</span>{" "}
                Day
              </h2>
            </div>
            <p className="font-body text-white/50 text-lg leading-relaxed">
              The goal isn't to complete everything. It's to identify the <strong className="text-white">smallest realistic set</strong> of important work — and protect it at all costs.
            </p>
            <p className="font-body text-white/40 text-base leading-relaxed">
              When you finish your MVD, you've had a successful day. Everything else is a bonus. This shift eliminates the guilt spiral of a traditional to-do list.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 font-ui text-primary text-sm font-semibold hover:gap-3 transition-all group"
            >
              Build your MVD now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="glass-card p-8 space-y-8 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="flex justify-between items-end border-b border-white/10 pb-6 relative z-10">
              <div>
                <p className="font-ui text-xs text-white/40 uppercase tracking-wider mb-1">Today's Workload</p>
                <p className="font-display text-3xl text-white">5h 30m</p>
              </div>
              <div className="text-right">
                <p className="font-ui text-xs text-white/40 uppercase tracking-wider mb-1">Your Capacity</p>
                <p className="font-display text-3xl text-primary">3h 10m</p>
              </div>
            </div>

            <div className="relative z-10">
              <p className="font-ui text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                ✦ Minimum Viable Day
              </p>
              <ul className="space-y-3">
                {[
                  "Electronics assignment (90 min)",
                  "Mathematics preparation (60 min)",
                  "Project milestone (40 min)",
                ].map((task) => (
                  <li key={task} className="flex items-center gap-3 text-white font-body">
                    <div className="w-5 h-5 rounded-full bg-keep/20 border border-keep/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-keep" />
                    </div>
                    <span className="text-white/80">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-white/40">MVD Total</span>
                <span className="text-keep font-semibold">3h 10m ✓ Fits perfectly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION E: DAILY STATE ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-28 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* State Mockup */}
          <div className="glass-card p-8 space-y-6 order-2 md:order-1 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-full bg-primary/8 blur-[80px] pointer-events-none" />

            <p className="font-ui text-xs font-bold text-white/30 uppercase tracking-widest">Today's State Check-In</p>

            {[
              { label: "Energy", value: "Low (3/10)", pct: "30%", color: "bg-reduce" },
              { label: "Stress", value: "High (8/10)", pct: "80%", color: "bg-primary" },
              { label: "Available Time", value: "4 hours", pct: "60%", color: "bg-white/50" },
              { label: "Sleep", value: "5.5 hours", pct: "46%", color: "bg-move" },
            ].map(({ label, value, pct, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between font-ui text-sm">
                  <span className="text-white/50">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
                <div className="h-2 w-full bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: pct }} />
                </div>
              </div>
            ))}

            <div className="mt-2 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm font-ui text-primary/90 leading-relaxed">
              <strong className="text-white block mb-1">FlowState Note:</strong>
              Your stress is high and energy is low. We're reducing scope on complex tasks and protecting your core priorities only.
            </div>
          </div>

          <div className="space-y-8 order-1 md:order-2">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest mb-6">
                Daily State
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-white leading-tight mt-4">
                Planning that knows{" "}
                <span className="italic text-accent">you're human.</span>
              </h2>
            </div>
            <p className="font-body text-white/50 text-lg leading-relaxed">
              Just four simple signals — energy, stress, available time, and sleep — tell FlowState how much you can realistically handle today.
            </p>
            <p className="font-body text-white/30 text-sm leading-relaxed italic">
              * FlowState does not diagnose or detect medical or mental-health conditions. It simply uses your inputs to size your workload appropriately.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION F: AI CAPTURE ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-28 space-y-20 relative z-10">

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest">
            FlowAI Capture
          </span>
        </div>

        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-white">Dump your brain. We'll organize it.</h2>
          <p className="font-body text-white/50">Say it naturally. FlowAI extracts task structure, deadline, and priority automatically.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {/* Input */}
          <div className="glass-card p-6 flex gap-4 group hover:border-white/20 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <p className="font-body text-white/70 italic text-lg leading-relaxed">
              "I have a Java assignment due Friday. It will take around two hours."
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 items-center justify-center">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>

          {/* Extracted Card */}
          <div className="glass-card p-6 space-y-4 border-l-[3px] border-l-primary relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/30" />
            <div className="flex items-center gap-2 mb-1">
              <span className="font-ui text-xs text-primary/70 uppercase tracking-widest font-bold">FlowAI Extracted</span>
            </div>
            <p className="font-ui text-xl text-white font-semibold">Java Assignment</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-white/5 rounded-lg text-xs font-ui text-white/60 flex items-center gap-1.5 border border-white/8">
                <Calendar className="w-3 h-3" /> Due Friday
              </span>
              <span className="px-2.5 py-1 bg-white/5 rounded-lg text-xs font-ui text-white/60 flex items-center gap-1.5 border border-white/8">
                <Clock className="w-3 h-3" /> 2 hours
              </span>
              <span className="px-2.5 py-1 bg-primary/15 rounded-lg text-xs font-ui text-primary flex items-center gap-1.5 border border-primary/25">
                Medium Priority
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION G: PRODUCT PREVIEW ── */}
      <section id="demo" className="w-full max-w-6xl mx-auto px-6 py-28 space-y-12 relative z-10">

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest">
            Product Preview
          </span>
        </div>

        <div className="text-center space-y-4">
          <h2 className="font-display text-4xl md:text-5xl text-white">Your adaptive dashboard</h2>
          <p className="font-body text-white/40">Everything you need to navigate a complex day, at a glance.</p>
        </div>

        {/* Dashboard Mockup */}
        <div className="w-full relative rounded-2xl overflow-hidden glass-card border border-white/10 p-1 shadow-2xl">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8">
            <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-ui text-xs text-white/20">FlowState — Dashboard</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-black/40 rounded-xl p-5 border border-white/5 space-y-1">
                <p className="font-ui text-xs text-white/40 uppercase tracking-wider">Capacity</p>
                <p className="font-display text-3xl text-primary">3h 10m</p>
              </div>
              <div className="bg-black/40 rounded-xl p-5 border border-white/5 space-y-1">
                <p className="font-ui text-xs text-white/40 uppercase tracking-wider">Workload</p>
                <p className="font-display text-3xl text-white">5h 30m</p>
              </div>
              <div className="bg-reduce/8 rounded-xl p-5 border border-reduce/20 space-y-1">
                <p className="font-ui text-xs text-reduce/60 uppercase tracking-wider">Overload</p>
                <p className="font-display text-3xl text-reduce">+2h 20m</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-keep animate-pulse" />
                <span className="font-ui text-xs text-white/50">Energy: 7/10 · Stress: 4/10</span>
              </div>
            </div>

            {/* Main Plan */}
            <div className="col-span-2 bg-black/20 rounded-xl p-6 border border-white/5">
              <h3 className="font-ui text-base text-white font-medium mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Today's Adaptive Plan
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Mathematics prep", tag: "KEEP", tagClass: "bg-keep/15 text-keep border-keep/25", dim: false },
                  { name: "Electronics assignment", tag: "KEEP", tagClass: "bg-keep/15 text-keep border-keep/25", dim: false },
                  { name: "Project milestone", tag: "REDUCE", tagClass: "bg-reduce/15 text-reduce border-reduce/25", dim: false },
                  { name: "Java assignment (Ch. 4)", tag: "MOVE", tagClass: "bg-move/15 text-move border-move/25", dim: true },
                ].map(({ name, tag, tagClass, dim }) => (
                  <div
                    key={name}
                    className={`flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 transition-opacity ${dim ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${tag === "KEEP" ? "bg-keep" : tag === "REDUCE" ? "bg-reduce" : "bg-move"}`} />
                      <span className="font-body text-white text-sm">{name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${tagClass}`}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION H: TESTIMONIALS / SOCIAL PROOF ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 relative z-10">

        <div className="text-center mb-16">
          <h2 className="font-display text-4xl text-white mb-3">Students who reclaimed their day</h2>
          <p className="font-body text-white/40">Real feedback from people who stopped drowning in to-do lists.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "I used to end every day feeling like I failed. FlowState showed me I was just planning against an impossible standard.",
              name: "Priya S.",
              role: "Engineering student",
              stars: 5,
            },
            {
              quote: "The KEEP / REDUCE / MOVE framework changed how I think about my workload. It's honest in a way regular planners aren't.",
              name: "Marcus T.",
              role: "Computer Science, Year 2",
              stars: 5,
            },
            {
              quote: "I finally stopped rolling tasks for days in a row. The Minimum Viable Day concept is genuinely life-changing during exam season.",
              name: "Aisha K.",
              role: "Pre-med student",
              stars: 5,
            },
          ].map(({ quote, name, role, stars }) => (
            <div key={name} className="glass-card p-7 space-y-6 group hover:border-white/15 transition-colors">
              <div className="flex gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="font-body text-white/70 text-sm leading-relaxed italic">"{quote}"</p>
              <div>
                <p className="font-ui text-white text-sm font-semibold">{name}</p>
                <p className="font-ui text-white/30 text-xs mt-0.5">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION I: FINAL CTA ── */}
      <section className="w-full relative z-10 py-32 overflow-hidden">
        {/* CTA background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[80%] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest">
            Get Started Free
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-tight">
            Make today's workload{" "}
            <span className="italic text-accent">realistic.</span>
          </h2>
          <p className="font-body text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            Set up in under 2 minutes. No credit card. No overwhelming features. Just a plan that fits who you are today.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="px-10 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-ui font-semibold transition-all glow-primary flex items-center gap-2 text-base group"
            >
              Build My Day <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="px-10 py-4 rounded-xl border border-white/15 text-white font-ui text-base font-medium hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-white/8 py-12 px-6 relative z-10 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-ui text-base font-bold text-white/70">FlowState</span>
          </div>

          <div className="flex items-center gap-8 font-ui text-sm text-white/30">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/auth/sign-in" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-white transition-colors">Get Started</Link>
          </div>

          <p className="font-ui text-xs text-white/20">© {new Date().getFullYear()} FlowState. Student Workload Management.</p>
        </div>
      </footer>

    </main>
  );
}
