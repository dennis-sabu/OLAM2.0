"use client";

import React from "react";
import Navbar from "./Navbar";
import HeroContent from "./HeroContent";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.jpg"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Navbar Overlay */}
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <HeroContent />
      </div>
    </section>
  );
};

export default Hero;
