"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

const HeroContent = () => {
  const { user } = useAuth();
  return (
    <div className="relative z-10 flex flex-col items-center text-center mt-28 md:mt-36 px-6 max-w-6xl mx-auto">

      {/* Tagline Pill */}
      <div className="inline-flex items-center gap-2 h-[36px] px-3 rounded-full bg-[rgba(139,92,246,0.15)] backdrop-blur-md border border-[rgba(139,92,246,0.35)] text-white font-ui text-[13px] font-medium mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-primary/90 font-semibold">AI-Powered</span>
        <span className="text-white/60">Student Workload Management</span>
      </div>

      {/* Headline */}
      <h1
        className="text-white text-5xl md:text-7xl lg:text-[88px] leading-[1.08] font-bold max-w-5xl mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
        style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}
      >
        Plan Around{" "}
        <span
          className="italic"
          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
        >
          who you are
        </span>
        {" "}today.
      </h1>

      {/* Subtext */}
      <p
        className="text-white/60 text-lg md:text-xl max-w-[640px] leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        FlowState adapts your study plan to your real capacity — energy, stress, sleep, and time — so you work smarter, not harder.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        {user ? (
          <>
            <Link
              href="/app/dashboard"
              className="px-8 py-4 rounded-xl bg-primary text-white font-ui text-[15px] font-semibold hover:bg-primary-hover transition-all glow-primary flex items-center gap-2 group"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/app/tasks"
              className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-ui text-[15px] font-medium hover:bg-white/15 transition-all"
            >
              My Tasks
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 rounded-xl bg-primary text-white font-ui text-[15px] font-semibold hover:bg-primary-hover transition-all glow-primary flex items-center gap-2 group"
            >
              Build My Day
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-ui text-[15px] font-medium hover:bg-white/15 transition-all"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Social proof */}
      <div className="mt-14 flex items-center gap-6 text-white/50 font-ui text-xs animate-in fade-in duration-700 delay-500">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {[
              { label: "PS", bg: "from-purple-500 to-indigo-600" },
              { label: "MT", bg: "from-violet-600 to-fuchsia-600" },
              { label: "AK", bg: "from-indigo-500 to-violet-800" },
            ].map((u, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${u.bg} border-2 border-[#080610] flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
              >
                {u.label}
              </div>
            ))}
          </div>
          <span className="text-white/70 font-medium">500+ students reclaiming their day</span>
        </div>
        <span className="hidden sm:inline-block text-white/20">·</span>
        <span className="hidden sm:inline-block text-white/40">Tested during midterm & finals crunch</span>
      </div>

    </div>
  );
};

export default HeroContent;
