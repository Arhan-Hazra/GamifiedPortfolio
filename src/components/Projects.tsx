'use client';

import React from 'react';

const projects = [
  {
    title: (
      <a
        href="https://github.com/Arhan-Hazra/spatial-finger-mouse"
        target="_blank"
        rel="noreferrer"
        className="hover:underline hover:text-white"
      >
        Spatial Finger Mouse
      </a>
    ),
    status: 'Completed',
    date: '06/2026 – 07/2026',
    description:
      'Developed a touchless cursor control system utilizing OpenCV and MediaPipe for real-time spatial hand tracking. Translated complex hand gestures into precise mouse actions, demonstrating low-latency edge AI perception.',
  },
  {
    title: 'The Autonomous Pet Robot',
    status: 'In Progress',
    date: '04/2025 – Present',
    description:
      'Architecting a custom autonomous robotics platform by engineering a repurposed HP Pavilion G6 motherboard to interface with a dedicated GTX 1050 Ti GPU. Designing the system architecture for high-performance, on-device edge AI processing to enable real-time perception and autonomous navigation.',
  },
  {
    title: (
      <a
        href="https://github.com/Arhan-Hazra/No-App-Smart-Home-ESP8266"
        target="_blank"
        rel="noreferrer"
        className="hover:underline hover:text-white"
      >
        No-App Smart Home Automation
      </a>
    ),
    status: 'Completed',
    date: '04/2025 – 05/2025',
    description:
      'Engineered an independent local smart home system using an ESP8266 microcontroller. Designed a custom web interface hosted directly on the edge device, eliminating the need for third-party mobile applications and improving response times.',
  },
];

const skills = [
  'VS Code',
  'FreeCAD',
  'PCB Design',
  'C',
  'Java',
  'Python',
  'C++',
  'Linux',
  'OpenCV',
  'TensorRT',
  'YOLO (v5 / v5-face)',
  'MediaPipe',
  'CUDA',
  'cuDNN',
  'Arduino',
  'Raspberry Pi',
  'ESP32',
];

const skillsStream = Array(8).fill(skills).flat();

export default function Projects() {
  return (
    <section className="w-full bg-transparent">
      <div className="p-8 border-b border-white/15">
        <h2 className="font-mono text-neon text-sm uppercase tracking-widest drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          [ 03 ] PROJECTS / PROTOTYPES
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {projects.map((project, index) => (
          <div
            key={index}
            className={`group p-8 border-b md:border-b-0 ${
              index !== projects.length - 1 ? 'md:border-r' : ''
            } border-white/15 hover:bg-neon hover:text-black transition-all duration-300 cursor-crosshair flex flex-col justify-between min-h-[360px] md:min-h-[400px]`}
          >
            <div>
              <div className="flex justify-between items-start mb-6 font-mono text-xs border-b border-white/15 group-hover:border-black/20 pb-4">
                <span className="group-hover:text-black/80 text-gray-300 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{project.date}</span>
                <span
                  className={
                    project.status === 'Completed'
                      ? 'text-neon group-hover:text-black font-bold'
                      : 'text-yellow-400 group-hover:text-black font-bold'
                  }
                >
                  [{project.status.toUpperCase()}]
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-4 uppercase leading-tight tracking-tight text-white group-hover:text-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {project.title}
              </h3>
            </div>

            <p className="font-mono text-sm leading-relaxed text-gray-200 group-hover:text-black/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {project.description}
            </p>
          </div>
        ))}
      </div>

      {/* DATA STREAM :: SKILLS Marquee (from Resume PDF) */}
      <div className="border-t border-white/15 overflow-hidden relative py-6 md:py-8 bg-black/25">
        <div className="px-8 mb-3">
          <h3 className="font-mono text-neon text-xs uppercase tracking-widest">
            DATA STREAM :: SKILLS
          </h3>
        </div>

        <div className="flex w-max animate-[scroll_50s_linear_infinite] opacity-75 hover:opacity-100 transition-opacity duration-500">
          <p className="font-mono text-lg md:text-2xl text-gray-300 whitespace-nowrap px-4 select-none">
            {skillsStream.map((skill, i) => (
              <span key={i}>
                <span className="hover:text-neon hover:bg-white/10 px-1 cursor-crosshair transition-colors">
                  {skill}
                </span>
                <span className="text-white/30 mx-2.5">,</span>
              </span>
            ))}
          </p>
        </div>

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </section>
  );
}
