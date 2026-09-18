'use client';

import { useState, useRef, useEffect } from 'react';

const mountainAscii = `
       .
      / \\
     /   \\
    /     \\
   /       \\       .
  /_________\\     / \\
  \\         /    /   \\
   \\       /    /     \\
    \\     /    /_______\\
     \\   /     \\       /
      \\ /       \\     /
       '         \\   /
                  \\ /
                   '
`;

export default function FooterTerminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      
      if (cmd === 'hallo') {
        setOutput(prev => [...prev, `> ${cmd}`, mountainAscii, "System: Access Granted."]);
      } else if (cmd === 'clear') {
        setOutput([]);
      } else if (cmd !== '') {
        setOutput(prev => [...prev, `> ${cmd}`, `Command not found: ${cmd}`]);
      }
      
      setInput('');
    }
  };

  return (
    <footer className="p-8 md:p-16 border-t border-white/20 bg-black min-h-[300px] flex flex-col font-mono text-sm">
      <div className="flex-grow">
        <div className="mb-8">
          <h2 className="font-mono text-neon text-sm uppercase tracking-widest mb-6">
            [ 04 ] CONTACT & SOCIALS
          </h2>
          <h3 className="text-white font-bold mb-2 uppercase">Arhan Kumar Hazra</h3>
          <p className="text-gray-500">hazraarhan@gmail.com // +91 6291167210</p>
          <div className="flex gap-4 mt-4 text-neon">
            <a href="https://linkedin.com/in/arhanhazra" target="_blank" rel="noreferrer" className="hover:underline hover:text-white border border-neon px-4 py-2 hover:bg-neon hover:text-black transition-colors">LINKEDIN</a>
            <a href="https://github.com/Arhan-Hazra" target="_blank" rel="noreferrer" className="hover:underline hover:text-white border border-neon px-4 py-2 hover:bg-neon hover:text-black transition-colors">GITHUB</a>
          </div>
        </div>

        <div className="mt-8 relative">
          <div className="space-y-2 mb-2 text-white whitespace-pre font-mono">
            {output.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div className="flex items-center text-neon">

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              className="bg-transparent border-none outline-none flex-grow text-white caret-neon"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
