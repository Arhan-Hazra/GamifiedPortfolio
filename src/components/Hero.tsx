'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const handlePointerDown = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. Tactile click transient (the mechanical switch snap)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(3600, t);
      clickOsc.frequency.exponentialRampToValueAtTime(700, t + 0.015);
      clickGain.gain.setValueAtTime(0.4, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.02);

      // 2. High-Q bandpass noise burst (keycap & switch friction)
      const bufferLen = Math.floor(ctx.sampleRate * 0.02);
      const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferLen * 0.25));
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(4500, t);
      bandpass.Q.setValueAtTime(3.5, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(t);
      noiseSource.stop(t + 0.025);

      // 3. Plate bottom-out thock (deep body resonance)
      const thockOsc = ctx.createOscillator();
      const thockGain = ctx.createGain();
      thockOsc.type = 'sine';
      thockOsc.frequency.setValueAtTime(260, t);
      thockOsc.frequency.exponentialRampToValueAtTime(65, t + 0.04);
      thockGain.gain.setValueAtTime(0.35, t);
      thockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      thockOsc.connect(thockGain);
      thockGain.connect(ctx.destination);
      thockOsc.start(t);
      thockOsc.stop(t + 0.05);
    } catch {
      // Audio playback fails silently if browser limits
    }
  };

  const handlePointerUp = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Switch upstroke release tick
      const releaseOsc = ctx.createOscillator();
      const releaseGain = ctx.createGain();
      releaseOsc.type = 'triangle';
      releaseOsc.frequency.setValueAtTime(4200, t);
      releaseOsc.frequency.exponentialRampToValueAtTime(1600, t + 0.012);
      releaseGain.gain.setValueAtTime(0.18, t);
      releaseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
      releaseOsc.connect(releaseGain);
      releaseGain.connect(ctx.destination);
      releaseOsc.start(t);
      releaseOsc.stop(t + 0.018);
    } catch {
      // Ignore
    }
  };

  return (
    <section className="min-h-[70vh] flex flex-col justify-center p-8 md:p-16 relative overflow-hidden bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 relative"
      >
        <p className="font-mono text-neon mb-4 uppercase tracking-widest text-sm md:text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          // Robotics Developer
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          ARHAN
          <br />
          KUMAR
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            HAZRA
          </span>
        </h1>

        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mt-12 border-t border-white/15 pt-8 w-full">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="font-mono text-xs md:text-sm uppercase tracking-wider text-gray-300 whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              <span className="text-neon mr-2">&gt;</span> CORE FOCUS
            </div>
            <div className="text-xl md:text-2xl font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              IoT & Robotics <span className="text-neon mx-2">|</span> AI Engineering
            </div>
          </div>

          <div className="self-end md:self-auto shrink-0 mt-4 md:mt-0">
            {/* 3D Realistic Mechanical Socket */}
            <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-b from-[#1a1f26] via-[#10141a] to-[#080b0f] border border-white/20 shadow-[inset_0_4px_8px_rgba(0,0,0,0.9),0_2px_4px_rgba(255,255,255,0.08),0_0_20px_rgba(0,255,65,0.15)]">
              <a
                href="https://drive.google.com/file/d/1VwSNAaTlV7r25BLX5CcRVFS6WtCjtE_A/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                className="group relative inline-flex items-center gap-3.5 px-8 py-3.5 md:px-10 md:py-4 rounded-full font-mono font-black uppercase tracking-widest text-base md:text-lg cursor-pointer select-none transition-all duration-100 ease-out
                  bg-gradient-to-b from-[#2a3441] via-[#1c232d] to-[#12171e]
                  text-neon border-t border-x border-white/30
                  border-b-[6px] md:border-b-[8px] border-[#009b27] hover:border-[#00FF41]
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.8),0_0_25px_rgba(0,255,65,0.25)]
                  hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.9),0_0_35px_rgba(0,255,65,0.5)]
                  active:translate-y-[5px] md:active:translate-y-[6px]
                  active:border-b-[2px]
                  active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.9),0_2px_4px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,65,0.4)]"
                aria-label="View Curriculum Vitae (CV)"
                title="Click to view Curriculum Vitae"
              >
                {/* Status LED Indicator */}
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-neon shadow-[0_0_10px_#00FF41]"></span>
                </span>

                {/* Button Label */}
                <span className="text-white group-hover:text-neon transition-colors duration-200 drop-shadow-[0_0_12px_rgba(0,255,65,0.8)]">
                  CV
                </span>

                {/* External link icon */}
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-neon transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative grid lines inside hero */}
      <div className="absolute top-0 right-0 w-1/3 h-full border-l border-white/10 hidden md:block" />
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
    </section>
  );
}
