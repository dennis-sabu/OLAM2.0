import Hero from "@/components/Hero";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Battery,
  BrainCircuit,
  Calendar,
  Clock,
  Zap,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  ListTodo,
  TrendingUp,
  Star,
  ChevronRight,
  ShieldCheck,
  Compass,
  Cpu,
} from "lucide-react";
import InteractivePlannerDemo from "@/components/landing/InteractivePlannerDemo";
import HardwareCompanionSection from "@/components/landing/HardwareCompanionSection";
import FaqAccordion from "@/components/landing/FaqAccordion";

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
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest font-semibold">
            The Fundamental Flaw
          </span>
        </div>

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight">
            Your to-do list doesn't know{" "}
            <span className="italic text-accent">your day.</span>
          </h2>
          <p className="font-body text-base md:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
            Traditional task apps assume you have 8 hours of peak cognitive focus every day. They ignore midterm stress, poor sleep, and surprise deadlines — leaving you drowning in an anxiety-inducing backlog.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Battery,
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
              badge: "Fluctuating Energy",
              title: "Energy is Variable",
              desc: "Some days you're locked in for four hours of uninterrupted coding. Other days you're running on fumes. Your plan must scale to match your biology."
            },
            {
              icon: Clock,
              color: "text-accent",
              bg: "bg-accent/10",
              border: "border-accent/20",
              badge: "Shifting Time",
              title: "Time is Fragile",
              desc: "Unexpected lab meetings, group project syncs, and family emergencies consume hours without warning. Static lists blindly pretend tomorrow has 30 hours."
            },
            {
              icon: ShieldAlert,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
              badge: "The Guilt Cycle",
              title: "Rolling Task Debt",
              desc: "Rolling 15 unfinished tasks to tomorrow creates a chronic guilt loop. FlowState forces deterministic trade-offs: protect the essentials and drop the rest guilt-free."
            }
          ].map(({ icon: Icon, color, bg, border, badge, title, desc }) => (
            <div
              key={title}
              className={`glass-card p-8 space-y-5 border ${border} group hover:border-white/30 hover:scale-[1.01] transition-all duration-300 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-ui text-[11px] font-semibold text-white/40 uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                  {badge}
                </span>
              </div>
              <h3 className="font-ui font-semibold text-white text-xl">{title}</h3>
              <p className="font-body text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION B: HOW IT WORKS ── */}
      <section id="how-it-works" className="w-full max-w-6xl mx-auto px-6 py-28 relative z-10">

        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest font-semibold">
            How It Works
          </span>
        </div>

        <div className="text-center space-y-4 max-w-2xl mx-auto mb-20">
          <h2 className="font-display text-4xl md:text-5xl text-white font-bold">Four steps to a realistic day</h2>
          <p className="font-body text-base text-white/50">FlowState runs through an adaptive loop — calibrated every morning in 30 seconds.</p>
        </div>

        {/* Step cards with connector line */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: MessageSquare, title: "Natural Capture", desc: "Dump raw syllabus items or messy notes in plain English. AI auto-extracts time & urgency." },
              { step: "02", icon: Battery, title: "State Check-In", desc: "Set energy, stress, sleep, and free hours in 20 seconds. This sets your human capacity." },
              { step: "03", icon: BrainCircuit, title: "Engine Solves Day", desc: "Deterministic mathematical scheduling tags tasks as KEEP, REDUCE, or MOVE." },
              { step: "04", icon: TrendingUp, title: "Focus & Complete", desc: "Execute on web or the physical desk companion. Recalculate anytime when plans change." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center space-y-4 relative group">
                <div className="w-[104px] h-[104px] rounded-2xl glass-card border border-primary/25 bg-primary/5 flex flex-col items-center justify-center gap-1 group-hover:border-primary/50 group-hover:bg-primary/15 transition-all duration-300 shadow-lg">
                  <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-display text-xl text-primary/70 font-bold">{step}</span>
                </div>
                <h3 className="font-ui text-base text-white font-semibold leading-snug">{title}</h3>
                <p className="font-body text-sm text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION C: KEEP / REDUCE / MOVE ── */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-28 space-y-20 relative z-10">

        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest font-semibold">
            The FlowState Framework
          </span>
        </div>

        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-white font-bold">Three intentional decisions</h2>
          <p className="font-body text-base text-white/50">Stop looking at an undifferentiated 20-item checklist. Make clear, honest commitments.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 space-y-5 border-t-[3px] border-t-emerald-400 relative overflow-hidden group hover:scale-[1.01] hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute top-4 right-4 font-display text-6xl text-emerald-400/5 group-hover:text-emerald-400/10 transition-colors font-bold">K</div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-ui text-xs text-emerald-400 uppercase tracking-widest font-bold">Keep</span>
              <h3 className="font-ui text-2xl text-white font-semibold mt-1">Full Focus</h3>
            </div>
            <p className="font-body text-white/50 text-sm leading-relaxed">
              This task realistically fits your capacity today. Do it completely and without distraction. E.g., the high-stakes problem set due tomorrow at 5 PM.
            </p>
            <div className="pt-2 border-t border-white/5 text-xs font-ui text-emerald-400/80 flex items-center gap-1.5">
              <span>✓ Protected in your Minimum Viable Day</span>
            </div>
          </div>

          <div className="glass-card p-8 space-y-5 border-t-[3px] border-t-amber-400 relative overflow-hidden group hover:scale-[1.01] hover:border-amber-500/40 transition-all duration-300">
            <div className="absolute top-4 right-4 font-display text-6xl text-amber-400/5 group-hover:text-amber-400/10 transition-colors font-bold">R</div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <span className="font-ui text-xs text-amber-400 uppercase tracking-widest font-bold">Reduce</span>
              <h3 className="font-ui text-2xl text-white font-semibold mt-1">Scope Down</h3>
            </div>
            <p className="font-body text-white/50 text-sm leading-relaxed">
              Important, but don't attempt the entire elephant today. E.g., write the thesis and outline instead of forcing a 2,000-word draft when energy is 3/10.
            </p>
            <div className="pt-2 border-t border-white/5 text-xs font-ui text-amber-400/80 flex items-center gap-1.5">
              <span>⚡ Prevents burnout while maintaining momentum</span>
            </div>
          </div>

          <div className="glass-card p-8 space-y-5 border-t-[3px] border-t-indigo-400 relative overflow-hidden group hover:scale-[1.01] hover:border-indigo-500/40 transition-all duration-300">
            <div className="absolute top-4 right-4 font-display text-6xl text-indigo-400/5 group-hover:text-indigo-400/10 transition-colors font-bold">M</div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="font-ui text-xs text-indigo-400 uppercase tracking-widest font-bold">Move</span>
              <h3 className="font-ui text-2xl text-white font-semibold mt-1">Defer Guilt-Free</h3>
            </div>
            <p className="font-body text-white/50 text-sm leading-relaxed">
              Not today. Pushed cleanly to tomorrow or the weekend without lingering failure. E.g., textbook reading that isn't urgent when essential hours are exhausted.
            </p>
            <div className="pt-2 border-t border-white/5 text-xs font-ui text-indigo-400/80 flex items-center gap-1.5">
              <span>➔ Cleared from today's mental bandwidth</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION D: INTERACTIVE DEMO SIMULATOR ── */}
      <section id="demo" className="w-full max-w-6xl mx-auto px-6 py-20 relative z-10">
        <InteractivePlannerDemo />
      </section>

      {/* ── SECTION E: MINIMUM VIABLE DAY ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-28 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest font-semibold mb-6">
                Core Philosophy
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight mt-4">
                Minimum{" "}
                <span className="italic text-accent">Viable</span>{" "}
                Day
              </h2>
            </div>
            <p className="font-body text-white/50 text-base md:text-lg leading-relaxed">
              The goal is never to exhaust yourself trying to finish 20 items. It is to protect the <strong className="text-white">smallest realistic core of essential work</strong> — and defend it at all costs.
            </p>
            <p className="font-body text-white/40 text-base leading-relaxed">
              When your Minimum Viable Day is complete, you are officially finished. No guilt, no 1 AM anxiety spirals. Everything else completed is simply a bonus.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 font-ui text-primary text-sm font-semibold hover:gap-3 transition-all group"
            >
              Build your MVD today <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="glass-card p-8 space-y-8 relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Glow */}
            <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="flex justify-between items-end border-b border-white/10 pb-6 relative z-10">
              <div>
                <p className="font-ui text-xs text-white/40 uppercase tracking-wider mb-1 font-semibold">Today's Raw Workload</p>
                <p className="font-display text-3xl font-bold text-white">5h 30m</p>
              </div>
              <div className="text-right">
                <p className="font-ui text-xs text-white/40 uppercase tracking-wider mb-1 font-semibold">Calculated Capacity</p>
                <p className="font-display text-3xl font-bold text-primary">3h 10m</p>
              </div>
            </div>

            <div className="relative z-10">
              <p className="font-ui text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                ✦ Minimum Viable Day (Protected Tasks)
              </p>
              <ul className="space-y-3">
                {[
                  "Electronics assignment (90 min)",
                  "Mathematics preparation (60 min)",
                  "Database schema milestone (40 min)",
                ].map((task) => (
                  <li key={task} className="flex items-center gap-3 text-white font-body text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-white/80 font-medium">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm font-ui">
                <span className="text-white/40">MVD Total Time</span>
                <span className="text-emerald-400 font-semibold">3h 10m · 100% Fits Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION F: HARDWARE DESK COMPANION (PHASE 5) ── */}
      <HardwareCompanionSection />

      {/* ── SECTION G: AI NATURAL LANGUAGE CAPTURE ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-28 space-y-20 relative z-10">

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest font-semibold">
            FlowAI Capture · Powered by Groq
          </span>
        </div>

        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-white font-bold">Dump your brain. We structure it.</h2>
          <p className="font-body text-base text-white/50">No rigid forms or tedious date-pickers. Say it naturally — Groq LLaMA extracts the structure instantly.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {/* Input */}
          <div className="glass-card p-7 flex gap-4 group hover:border-white/20 transition-all border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-2">
              <p className="font-ui text-xs uppercase tracking-wider text-white/40 font-semibold">User Natural Voice / Text</p>
              <p className="font-body text-white/80 italic text-lg leading-relaxed">
                "I have a Java assignment due Friday at 5 PM. It will take around two hours and is worth 15% of my grade."
              </p>
            </div>
          </div>

          {/* Extracted Card */}
          <div className="glass-card p-7 space-y-4 border-l-[3px] border-l-primary relative overflow-hidden border border-white/10 shadow-xl">
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/30" />
            <div className="flex items-center gap-2 mb-1">
              <span className="font-ui text-xs text-primary font-bold uppercase tracking-widest">FlowAI Extracted Structure</span>
            </div>
            <p className="font-ui text-xl text-white font-bold">Java Assignment</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-ui text-white/70 flex items-center gap-1.5 border border-white/8">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Due Friday 17:00
              </span>
              <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-ui text-white/70 flex items-center gap-1.5 border border-white/8">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> 120 mins
              </span>
              <span className="px-3 py-1 bg-primary/15 rounded-lg text-xs font-ui text-primary font-semibold flex items-center gap-1.5 border border-primary/25">
                High Priority
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION H: TESTIMONIALS ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 relative z-10">

        <div className="text-center mb-16">
          <h2 className="font-display text-4xl text-white font-bold mb-3">Engineered for intense academic terms</h2>
          <p className="font-body text-white/40">From computer science and engineering to pre-med and law.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "I used to end every single Sunday feeling like a failure with 20 overdue tasks. FlowState showed me that my capacity was simply being exceeded. The KEEP/REDUCE/MOVE framework is liberating.",
              name: "Priya S.",
              role: "Electrical & Computer Eng, Year 3",
              university: "Berkeley",
              stars: 5,
            },
            {
              quote: "The physical ESP32 desk companion is genius. Having my timer and current task right next to my monitor without picking up my phone keeps me locked in for two-hour study blocks.",
              name: "Marcus T.",
              role: "Software Engineering, Year 2",
              university: "Waterloo",
              stars: 5,
            },
            {
              quote: "The Minimum Viable Day concept completely altered how I approach exam season. Once the MVD is checked off, I stop feeling guilty and actually get 8 hours of sleep.",
              name: "Aisha K.",
              role: "Pre-Med Biology, Senior",
              university: "Johns Hopkins",
              stars: 5,
            },
          ].map(({ quote, name, role, university, stars }) => (
            <div key={name} className="glass-card p-8 space-y-6 group hover:border-white/20 transition-all border border-white/8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="font-body text-white/70 text-sm leading-relaxed italic">"{quote}"</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="font-ui text-white text-sm font-semibold">{name}</p>
                <p className="font-ui text-white/40 text-xs mt-0.5">{role} · {university}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION I: FAQ ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-28 relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-ui text-xs text-white/50 uppercase tracking-widest font-semibold">
            Common Inquiries
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-white font-bold">Frequently asked questions</h2>
        </div>

        <FaqAccordion />
      </section>

      {/* ── SECTION J: FINAL CTA ── */}
      <section className="w-full relative z-10 py-32 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[80%] rounded-full bg-primary/10 blur-[130px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 font-ui text-xs text-primary font-semibold uppercase tracking-widest">
            Start Your Realistic Semester
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-tight font-bold">
            Plan around{" "}
            <span className="italic text-accent">who you are</span>{" "}
            today.
          </h2>
          <p className="font-body text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Free to start. Ready in 60 seconds. Say goodbye to the endless guilt of yesterday's unfinished to-do list.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="px-10 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-ui font-semibold transition-all glow-primary flex items-center gap-2 text-base group cursor-pointer"
            >
              Build My Day Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="px-10 py-4 rounded-xl border border-white/15 text-white font-ui text-base font-medium hover:bg-white/5 transition-colors cursor-pointer"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-white/8 py-12 px-6 relative z-10 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <span className="font-ui text-base font-bold text-white tracking-tight">FlowState</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 md:gap-8 font-ui text-sm text-white/40">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="hover:text-white transition-colors">The Framework</a>
            <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
            <Link href="/auth/sign-in" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-white transition-colors font-medium text-primary">Get Started</Link>
          </div>

          <p className="font-ui text-xs text-white/30">© {new Date().getFullYear()} FlowState. Adaptive Workload Management.</p>
        </div>
      </footer>

    </main>
  );
}
