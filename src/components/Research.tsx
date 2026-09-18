'use client';

import React from 'react';

const publications = [
  {
    id: 'JSA-D-26-01394',
    title: 'Repurposing Mobile Hardware to Outperform Traditional SBCs',
    authors: 'Arhan Kumar Hazra (primary), Ajit Kumar Pasayat',
    status: 'Under Review - Submitted to Journal of Systems Architecture',
    description:
      'Investigated repurposing legacy smartphone hardware as a sustainable, high-performance Linux server alternative to traditional single-board computers, complete with integrated GPIO functionality.',
  },
  {
    id: 'IN-PREP-01',
    title:
      'The Portable Task Companion: Memory-Safe and Context-Aware Task Tracking on Resource-Constrained Microcontrollers',
    authors: 'Arhan Kumar Hazra (primary), Anish Kumar Pandey',
    status: 'In Preparation',
    description:
      'Developing a highly efficient, memory-safe task tracking architecture optimized specifically for deployment on resource-constrained edge devices and microcontrollers.',
  },
];

export default function Research() {
  return (
    <section className="w-full bg-transparent">
      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="p-8 md:col-span-1 border-b md:border-b-0 md:border-r border-white/15 flex flex-col justify-between">
          <div>
            <h2 className="font-mono text-neon text-sm uppercase tracking-widest mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              [ 02 ] RESEARCH
            </h2>
            <p className="font-mono text-xs text-gray-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">ACADEMIC LOGS</p>
          </div>
        </div>

        <div className="md:col-span-3">
          {publications.map((pub, index) => (
            <div
              key={pub.id}
              className={`p-8 md:p-12 hover:bg-white/5 transition-colors duration-300 ${
                index !== publications.length - 1 ? 'border-b border-white/15' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-6">
                <h3 className="text-xl md:text-2xl font-medium text-white max-w-2xl leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  {pub.title}
                </h3>
                <span className="font-mono text-xs px-3 py-1 border border-neon/60 text-neon shrink-0 bg-black/70 backdrop-blur-sm rounded-lg shadow-[0_0_12px_rgba(0,255,65,0.2)]">
                  REF: {pub.id}
                </span>
              </div>

              <div className="font-mono text-sm space-y-2 mb-6">
                <p className="text-gray-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <span className="text-gray-400">AUTHORS //</span> {pub.authors}
                </p>
                <p className="text-gray-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <span className="text-gray-400">STATUS //</span>{' '}
                  <span className="text-white font-medium">{pub.status}</span>
                </p>
              </div>

              <p className="text-gray-200 font-mono text-sm leading-relaxed border-l-2 border-neon/60 pl-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                {pub.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
