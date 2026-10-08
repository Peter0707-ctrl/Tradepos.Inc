"use client";

import React, { useEffect } from "react";
import { ShoppingBag } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Exactly 5 seconds timer, then smoothly transition
    const timer = setTimeout(() => {
      onFinish();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/business-bg.jpg')" }}
    >
      {/* #E1FFAC overlay tint */}
      <div className="absolute inset-0 bg-[#E1FFAC]/85 backdrop-blur-xs" />

      {/* Neumorphic splash card */}
      <div className="w-full max-w-md auth-neu-card p-10 flex flex-col items-center text-center animate-fade-in relative z-10">
        {/* Brand Logo Container */}
        <div className="w-20 h-20 auth-neu-badge flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10 text-[#172507]" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#17240E] mb-2">
          TradePOS
        </h1>

        {/* Short Brand Statement */}
        <p className="text-sm text-[#3b4b35] font-semibold max-w-sm mb-6 leading-relaxed">
          &ldquo;Everything your business needs, in one place.&rdquo;
        </p>

        {/* Smooth spinner icon without any counting bar or percentage */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#4a5f45]">
          <div className="w-4 h-4 rounded-full border-2 border-[#415e1a] border-t-transparent animate-spin" />
          <span>Inafungua mfumo...</span>
        </div>

        {/* Skip button */}
        <button
          onClick={onFinish}
          className="mt-6 text-xs text-[#41533d] hover:text-black font-semibold underline cursor-pointer transition-colors"
        >
          Ruka
        </button>
      </div>
    </div>
  );
};
