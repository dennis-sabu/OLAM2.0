"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: "How is FlowState different from Todoist, Notion, or Apple Reminders?",
    a: "Standard to-do lists assume you are a static machine with identical capacity 365 days a year. When unexpected workload hits or you're running on 4 hours of sleep, static lists make you feel guilty for rolling 12 tasks over. FlowState dynamically calculates your capacity from your real human state (energy, stress, sleep, time) and categorizes work into KEEP, REDUCE, or MOVE — ensuring you always finish what you start.",
  },
  {
    q: "What is a 'Minimum Viable Day' (MVD)?",
    a: "An MVD is the protected, non-negotiable core set of tasks that fits your exact capacity for today. Once your MVD is completed, you've had an objectively successful day. Everything beyond that is a voluntary bonus. This single shift eliminates task paralysis and burnout.",
  },
  {
    q: "Do I need the physical ESP32 hardware companion to use FlowState?",
    a: "No! The FlowState web application is completely standalone and full-featured with real-time cloud persistence, Groq AI capture, and the planning engine. The ESP32-S3 physical companion is an optional hardware companion for students who want a dedicated desk timer that eliminates smartphone distractions.",
  },
  {
    q: "How does the Groq AI task breakdown work?",
    a: "You can type or speak in messy natural language — e.g., 'Finish my operating systems assignment by Thursday at 5pm and study for the quiz'. FlowState uses high-speed Groq LLaMA models to parse out estimated durations, deadlines, and urgency into structured database tasks instantly.",
  },
  {
    q: "Does FlowState claim to diagnose medical burnout or mental health?",
    a: "No. FlowState is an academic workload and focus planner. The energy and stress sliders are user-reported inputs strictly used by the deterministic math engine to scale task time budgets. It never provides medical or therapeutic advice.",
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className="glass-card border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full p-6 text-left flex items-center justify-between gap-4 font-ui text-base md:text-lg font-semibold text-white hover:text-primary transition-colors cursor-pointer"
            >
              <span>{faq.q}</span>
              <div
                className={`w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 bg-primary/20 text-primary border-primary/40" : "text-white/60"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 pt-1 font-body text-sm md:text-base text-white/60 leading-relaxed border-t border-white/5">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
