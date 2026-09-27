"use client";

import React, { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#", hasDropdown: true },
    { name: "Reviews", href: "#" },
    { name: "Contact us", href: "#" },
  ];

  return (
    <nav className="absolute top-0 left-0 w-full z-20 px-6 md:px-[120px] py-[16px] flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <svg
          width="140"
          height="40"
          viewBox="0 0 140 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-white"
        >
          <path
            d="M1.04356 6.35771L13.6437 0.666504L26.2438 6.35771L13.6437 12.0489V27.9511L1.04356 21.2511L13.6437 15.56V6.35771Z"
            fill="currentColor"
          />
          <text
            x="30"
            y="28"
            fill="white"
            className="font-ui text-2xl font-semibold"
          >
            Bluebee
          </text>
        </svg>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-white font-ui text-[14px] font-medium opacity-100 hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            {link.name}
            {link.hasDropdown && <ChevronDown size={14} />}
          </a>
        ))}
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <button className="px-4 py-2 rounded-lg border border-[#d4d4d4] bg-white text-[#171717] font-ui text-[14px] font-semibold hover:bg-gray-50 transition-colors">
          Sign In
        </button>
        <button className="px-4 py-2 rounded-lg bg-primary text-white font-ui text-[14px] font-semibold shadow-sm hover:brightness-110 transition-all">
          Get Started
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={28} />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-secondary flex flex-col items-center justify-center p-6">
          <button
            className="absolute top-6 right-6 text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={32} />
          </button>

          <div className="flex flex-col items-center gap-8 text-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white text-2xl font-ui font-medium hover:opacity-80"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
              <button className="w-full py-3 rounded-lg border border-white/20 bg-white/10 text-white font-ui text-lg font-semibold">
                Sign In
              </button>
              <button className="w-full py-3 rounded-lg bg-primary text-white font-ui text-lg font-semibold">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
