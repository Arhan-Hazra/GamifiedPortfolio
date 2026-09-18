'use client';

import React from 'react';

export default function Summary() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 w-full bg-transparent">
      <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/15 flex flex-col justify-between">
        <h2 className="font-mono text-neon text-sm uppercase tracking-widest mb-12 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          [ 01 ] SUMMARY
        </h2>
        <div className="font-mono text-xs text-gray-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          ID: AKH-2026 // SYSTEM ARCHITECT
        </div>
      </div>

      <div className="col-span-2 p-8 md:p-16 relative">
        <div className="space-y-6">
          <p className="text-2xl md:text-4xl leading-snug font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Enthusiastic AI Engineering student with strong expertise in{' '}
            <span className="text-neon font-medium drop-shadow-[0_0_12px_rgba(0,255,65,0.4)]">Robotics and Embedded IoT Systems</span>.
          </p>
          <p className="text-base md:text-xl leading-relaxed text-gray-200 font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Experienced in architecting{' '}
            <span className="text-neon drop-shadow-[0_0_10px_rgba(0,255,65,0.4)]">low-latency edge solutions</span> utilizing microcontrollers,
            custom hardware integration, and <span className="text-white font-medium">GPU acceleration</span>. Adept at leveraging real-time computer vision and sensor networks to develop scalable, autonomous robotics.
          </p>
        </div>

        {/* Crosshair design elements */}
        <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-neon opacity-75" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-neon opacity-75" />
      </div>
    </section>
  );
}
