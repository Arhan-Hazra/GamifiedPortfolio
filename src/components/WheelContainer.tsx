'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WheelContainerProps {
  children: React.ReactNode[];
  onSectionChange: (index: number) => void;
  sectionNames?: string[];
}

export default function WheelContainer({
  children,
  onSectionChange,
  sectionNames = [
    'INTRO',
    'SUMMARY',
    'RESEARCH',
    'PROJECTS',
    'CONTACT & SOCIALS',
  ],
}: WheelContainerProps) {
  const totalSections = children.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioningFrom, setTransitioningFrom] = useState<number | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimatingRef = useRef(false);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);

  const goToSection = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= totalSections) return;
      if (targetIndex === currentIndex || isAnimatingRef.current) return;

      const direction: 1 | -1 = targetIndex > currentIndex ? 1 : -1;
      isAnimatingRef.current = true;
      setTransitioningFrom(currentIndex);
      setTransitionDirection(direction);

      const outgoingEl = sectionRefs.current[currentIndex];
      const incomingEl = sectionRefs.current[targetIndex];

      onSectionChange(targetIndex);

      if (outgoingEl && incomingEl) {
        // Prepare incoming element
        gsap.killTweensOf(outgoingEl);
        gsap.killTweensOf(incomingEl);

        incomingEl.style.display = 'flex';
        gsap.set(incomingEl, {
          rotateX: -direction * 14,
          y: direction * 55,
          scale: 0.97,
          opacity: 0,
        });

        // Wheel out current block with gentle glide
        gsap.to(outgoingEl, {
          rotateX: direction * 10,
          y: -direction * 45,
          scale: 0.97,
          opacity: 0,
          duration: 0.85,
          ease: 'power2.inOut',
          onComplete: () => {
            outgoingEl.style.display = 'none';
          },
        });

        // Wheel in next block smoothly and gradually
        gsap.to(incomingEl, {
          rotateX: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.95,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(incomingEl, { clearProps: 'transform' });
            setCurrentIndex(targetIndex);
            setTransitioningFrom(null);
            isAnimatingRef.current = false;
          },
        });
      } else {
        setCurrentIndex(targetIndex);
        setTransitioningFrom(null);
        isAnimatingRef.current = false;
      }
    },
    [currentIndex, totalSections, onSectionChange]
  );

  // Wheel and keyboard interaction with smooth debounce
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheelTime.current < 650) return;

      if (Math.abs(e.deltaY) > 22) {
        lastWheelTime.current = now;
        if (e.deltaY > 0) {
          goToSection(currentIndex + 1);
        } else {
          goToSection(currentIndex - 1);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToSection(currentIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToSection(currentIndex - 1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      if (Math.abs(diff) > 30) {
        if (diff > 0) {
          goToSection(currentIndex + 1);
        } else {
          goToSection(currentIndex - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, goToSection]);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-transparent">
      {/* 3D Wheel Stage with Perspective */}
      <div
        className="w-full h-full relative"
        style={{
          perspective: '1800px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {children.map((child, idx) => {
          const isActive = idx === currentIndex;
          const isTransitioning = idx === transitioningFrom;
          const shouldRender = isActive || isTransitioning;

          return (
            <div
              key={idx}
              ref={(el) => {
                sectionRefs.current[idx] = el;
              }}
              className="absolute inset-0 w-full h-full flex flex-col justify-center items-center pointer-events-auto"
              style={{
                display: shouldRender ? 'flex' : 'none',
                opacity: isActive ? 1 : 0,
                transform: 'none',
                backfaceVisibility: 'hidden',
                zIndex: isActive ? 20 : 10,
              }}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* Cyberpunk Wheel HUD (Right Side) */}
      <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => goToSection(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-1.5 text-white/50 hover:text-neon disabled:opacity-20 transition-colors"
          aria-label="Previous Section"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        {/* Section Indicators */}
        <div className="flex flex-col gap-3 items-end">
          {sectionNames.map((name, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSection(idx)}
                className="group flex items-center gap-3 text-right cursor-pointer"
              >
                <span
                  className={`font-mono text-[10px] md:text-xs uppercase tracking-widest transition-all duration-200 hidden md:block ${active
                    ? 'text-neon font-bold translate-x-0'
                    : 'text-gray-400 opacity-40 group-hover:opacity-100 group-hover:text-white'
                    }`}
                >
                  {name}
                </span>

                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${active
                    ? 'w-7 bg-neon shadow-[0_0_14px_#00FF41]'
                    : 'w-2.5 bg-white/30 group-hover:bg-white/70'
                    }`}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goToSection(currentIndex + 1)}
          disabled={currentIndex === totalSections - 1}
          className="p-1.5 text-white/50 hover:text-neon disabled:opacity-20 transition-colors"
          aria-label="Next Section"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Counter Badge */}
        <div className="font-mono text-[11px] text-gray-300 mt-1 bg-black/80 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
          <span className="text-neon font-bold">0{currentIndex}</span>
          <span className="text-white/40 mx-1">/</span>
          <span>0{totalSections - 1}</span>
        </div>
      </div>

      {/* Bottom Scroll Prompt */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex items-center gap-2 font-mono text-[11px] text-gray-300 bg-black/75 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
        <span className="tracking-widest uppercase">SCROLL OR USE ARROWS TO WHEEL</span>
      </div>
    </div>
  );
}
