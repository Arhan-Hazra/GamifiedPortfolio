'use client';

import React, { useState, useRef, useEffect } from 'react';
import TorchScene from '@/components/canvas/TorchScene';
import WheelContainer from '@/components/WheelContainer';
import Hero from '@/components/Hero';
import Summary from '@/components/Summary';
import Research from '@/components/Research';
import Projects from '@/components/Projects';
import WindowReveal from '@/components/WindowReveal';

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sectionTitles = [
    'INTRO',
    'SUMMARY',
    'RESEARCH',
    'PROJECTS',
    'CONTACT & SOCIALS',
  ];

  // Replay video once upon visiting section 4, pause when leaving
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeSection === 4) {
      try {
        video.currentTime = 0;
      } catch (e) {}
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [activeSection]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* 3D WebGL Torch Field Engine & Environmental Canvas */}
      <TorchScene currentSection={activeSection} onSectionChange={setActiveSection} />

      {/* Fullscreen Video Background for Block 4 - Edge-to-Edge with Zero Gaps */}
      <div
        className={`fixed inset-0 w-screen h-screen min-w-full min-h-full overflow-hidden pointer-events-none transition-opacity duration-1000 ease-in-out bg-black z-0 ${
          activeSection === 4 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        >
          <source src="/videos/generate_a_video_of_a_dark_pit.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 3D Inside-the-Wheel Cylindrical Scroll Engine */}
      <WheelContainer
        onSectionChange={(index) => setActiveSection(index)}
        sectionNames={sectionTitles}
      >
        {/* Block 0: Hero / Intro - Glassy Box */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-12 pointer-events-auto flex flex-col my-auto">
          <div className="w-full bg-black/35 md:bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.18)] overflow-hidden">
            <Hero />
          </div>
        </div>

        {/* Block 1: Summary - Glassy Box */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-12 pointer-events-auto flex flex-col my-auto">
          <div className="w-full bg-black/35 md:bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.18)] overflow-hidden">
            <Summary />
          </div>
        </div>

        {/* Block 2: Research & Publications - Glassy Box */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-12 pointer-events-auto max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col my-auto">
          <div className="w-full bg-black/35 md:bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.18)] overflow-hidden">
            <Research />
          </div>
        </div>

        {/* Block 3: Projects / Prototypes + Skills Marquee - Glassy Box */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-12 pointer-events-auto max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col my-auto">
          <div className="w-full bg-black/35 md:bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.18)] overflow-hidden">
            <Projects />
          </div>
        </div>

        {/* Block 4: Contact & Socials HUD Overlay */}
        <div className="w-full h-full pointer-events-auto">
          <WindowReveal isActive={activeSection === 4} />
        </div>
      </WheelContainer>
    </main>
  );
}
