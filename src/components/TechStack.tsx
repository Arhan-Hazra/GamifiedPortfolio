'use client';

export default function TechStack() {
  const skills = [
    "C", "Java", "Python", "C++", "Linux", 
    "OpenCV", "TensorRT", "YOLOv5", "YOLOv5-face", "MediaPipe",
    "CUDA", "cuDNN", "Arduino", "Raspberry Pi", "ESP32",
    "VS Code", "FreeCAD", "PCB Design"
  ];

  // Repeat for data stream effect
  const stream = Array(10).fill(skills).flat();

  return (
    <section className="border-b border-white/20 overflow-hidden relative py-12">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-r from-black via-transparent to-black z-10" />
      
      <div className="absolute top-4 left-8 z-20">
        <h2 className="font-mono text-neon text-[10px] uppercase tracking-widest bg-black px-2">
          DATA STREAM :: SKILLS
        </h2>
      </div>

      <div className="flex w-max animate-[scroll_60s_linear_infinite] opacity-50 hover:opacity-100 transition-opacity duration-500">
        <p className="font-mono text-xl md:text-3xl text-gray-400 whitespace-nowrap px-4">
          {stream.map((skill, i) => (
            <span key={i}>
              <span className="hover:text-neon hover:bg-white/10 px-1 cursor-crosshair transition-colors">{skill}</span>
              <span className="text-white/20 mx-2">,</span>
            </span>
          ))}
        </p>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
