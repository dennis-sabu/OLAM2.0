"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, BrainCircuit } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How it Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Demo", href: "#demo" },
  ];

  return (
    <nav
      className={`absolute top-0 left-0 w-full z-20 px-6 md:px-[120px] py-[18px] flex items-center justify-between transition-all duration-500 ${
        scrolled ? "bg-black/40 backdrop-blur-xl border-b border-white/5" : ""
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
          <BrainCircuit className="w-4.5 h-4.5 text-primary" />
        </div>
        <span
          className="font-ui text-[18px] font-bold text-white tracking-tight"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          FlowState
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-white/70 font-ui text-[14px] font-medium hover:text-white transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/auth/sign-in"
          className="px-5 py-2 rounded-lg border border-white/15 bg-white/5 text-white font-ui text-[14px] font-medium hover:bg-white/10 hover:border-white/30 transition-all"
        >
          Sign In
        </Link>
        <Link
          href="/auth/sign-up"
          className="px-5 py-2 rounded-lg bg-primary text-white font-ui text-[14px] font-semibold hover:bg-primary-hover transition-all glow-primary"
        >
          Get Started
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-white p-1"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={26} />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#080610]/95 backdrop-blur-2xl flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
              <BrainCircuit className="w-5 h-5 text-primary" />
              <span className="font-ui text-lg font-bold text-white">FlowState</span>
            </Link>
            <button
              className="text-white/70 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white text-2xl font-ui font-medium py-4 border-b border-white/5 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <Link
              href="/auth/sign-in"
              className="w-full py-3.5 rounded-xl border border-white/15 text-white font-ui text-base font-semibold text-center hover:bg-white/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="w-full py-3.5 rounded-xl bg-primary text-white font-ui text-base font-semibold text-center glow-primary"
              onClick={() => setIsOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
