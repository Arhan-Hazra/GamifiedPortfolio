'use client';

import React, { useEffect, useRef } from 'react';

interface WindowRevealProps {
  isActive?: boolean;
}

export default function WindowReveal({ isActive = true }: WindowRevealProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between p-5 md:p-12 z-10 overflow-hidden font-mono pointer-events-none">
      {/* Top Header & High-Contrast Contact Badges */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 pointer-events-auto">
        {/* Section Heading Badge */}
        <div className="inline-flex items-center gap-3 bg-black/90 border border-neon/50 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.9),0_0_20px_rgba(0,255,65,0.25)]">
          <span className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse shadow-[0_0_10px_#00FF41]" />
          <h2 className="text-neon text-xs md:text-sm uppercase tracking-widest font-bold">
            [ 04 ] CONTACT & SOCIALS
          </h2>
        </div>

        {/* High-Contrast Email & Phone Number Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Email Badge */}
          <div className="flex items-center bg-black/90 border border-white/30 hover:border-neon backdrop-blur-md rounded-2xl transition-all shadow-[0_4px_25px_rgba(0,0,0,0.9),0_0_15px_rgba(0,255,65,0.15)] group">
            <a
              href="mailto:hazraarhan@gmail.com"
              className="inline-flex items-center gap-2.5 px-4 py-3 text-xs md:text-sm"
              title="Send an email to Arhan"
            >
              <span className="text-neon font-bold uppercase tracking-wider text-xs">
                EMAIL &gt;
              </span>
              <span className="text-white font-bold tracking-wide group-hover:text-neon transition-colors">
                hazraarhan@gmail.com
              </span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy('hazraarhan@gmail.com', 'email')}
              className="border-l border-white/20 px-3 py-3 text-[11px] text-gray-400 hover:text-neon hover:bg-white/5 transition-colors rounded-r-2xl uppercase tracking-wider"
              title="Copy email to clipboard"
            >
              {copied === 'email' ? 'COPIED!' : 'COPY'}
            </button>
          </div>

          {/* Phone Badge */}
          <div className="flex items-center bg-black/90 border border-white/30 hover:border-neon backdrop-blur-md rounded-2xl transition-all shadow-[0_4px_25px_rgba(0,0,0,0.9),0_0_15px_rgba(0,255,65,0.15)] group">
            <a
              href="tel:+916291167210"
              className="inline-flex items-center gap-2.5 px-4 py-3 text-xs md:text-sm"
              title="Call Arhan"
            >
              <span className="text-neon font-bold uppercase tracking-wider text-xs">
                TEL &gt;
              </span>
              <span className="text-white font-bold tracking-wide group-hover:text-neon transition-colors">
                +91 6291167210
              </span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy('+916291167210', 'phone')}
              className="border-l border-white/20 px-3 py-3 text-[11px] text-gray-400 hover:text-neon hover:bg-white/5 transition-colors rounded-r-2xl uppercase tracking-wider"
              title="Copy phone to clipboard"
            >
              {copied === 'phone' ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>
      </div>

      {/* Center is 100% transparent and unobstructed to showcase the epic fullscreen video */}
      <div className="flex-grow pointer-events-none" />

      {/* Very Bottom: LinkedIn, GitHub & CV Action Buttons */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
        <div className="flex flex-wrap gap-4">
          <a
            href="https://linkedin.com/in/arhanhazra"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-neon bg-black/85 hover:bg-neon text-neon hover:text-black px-7 py-3 transition-all font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,65,0.35)]"
          >
            <span>LINKEDIN</span>
            <span className="text-sm font-sans"></span>
          </a>
          <a
            href="https://github.com/Arhan-Hazra"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-neon bg-black/85 hover:bg-neon text-neon hover:text-black px-7 py-3 transition-all font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,65,0.35)]"
          >
            <span>GITHUB</span>
            <span className="text-sm font-sans"></span>
          </a>
        </div>

        <div>
          <a
            href="https://drive.google.com/file/d/1VwSNAaTlV7r25BLX5CcRVFS6WtCjtE_A/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-white/50 hover:border-neon bg-black/85 hover:bg-black text-white hover:text-neon px-7 py-3 transition-all font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
          >
            <span>CURRICULUM VITAE</span>
            <span className="text-sm font-sans">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
