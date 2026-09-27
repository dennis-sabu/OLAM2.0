"use client";

import React from "react";

const HeroContent = () => {
  return (
    <div className="relative z-10 flex flex-col items-center text-center mt-32 px-6">
      {/* Tagline Pill */}
      <div className="flex items-center gap-2 h-[38px] px-3 rounded-[10px] bg-[rgba(85,80,110,0.4)] backdrop-blur-md border border-[rgba(164,132,215,0.5)] text-white font-buttons text-[14px] font-medium mb-8">
        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] uppercase tracking-wider">
          New
        </span>
        <span>Say Hello to Datacore v3.2</span>
      </div>

      {/* Headline */}
      <h1 className="font-headline text-white text-5xl md:text-[96px] leading-[1.1] max-w-5xl mb-6">
        Book your perfect stay{" "}
        <i className="font-serif italic">and</i>{" "}
        hassle-free instantly
      </h1>

      {/* Subtext */}
      <p className="font-body text-white/70 text-[18px] max-w-[662px] leading-relaxed mb-10">
        Discover handpicked hotels, resorts, and stays across your favorite destinations. Enjoy exclusive deals, fast booking, and 24/7 support.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button className="px-8 py-4 rounded-[10px] bg-primary text-white font-buttons text-[16px] font-medium hover:brightness-110 transition-all">
          Book a Free Demo
        </button>
        <button className="px-8 py-4 rounded-[10px] bg-secondary text-[#f6f7f9] font-buttons text-[16px] font-medium hover:brightness-110 transition-all">
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default HeroContent;
