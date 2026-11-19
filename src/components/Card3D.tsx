import { type ReactNode, useState } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export function Card3D({ children, className = '', dark = false }: Card3DProps) {
  const [transformState, setTransformState] = useState({ rx: 0, ry: 0, glowX: 50, glowY: 50 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTransformState({
      rx: Number(((0.5 - py) * 9).toFixed(2)),
      ry: Number(((px - 0.5) * 9).toFixed(2)),
      glowX: Math.round(px * 100),
      glowY: Math.round(py * 100),
    });
  };

  const handlePointerLeave = () => {
    setTransformState({ rx: 0, ry: 0, glowX: 50, glowY: 50 });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: `perspective(1000px) rotateX(${transformState.rx}deg) rotateY(${transformState.ry}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-2xl transition-transform duration-200 ease-out will-change-transform ${
        dark
          ? 'bg-[#102A56] dark:bg-[#162238] border border-white/14 dark:border-slate-700 text-white shadow-[0_24px_48px_-18px_rgba(16,42,86,0.55)]'
          : 'bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-800 text-[#102A56] dark:text-slate-100 shadow-[0_20px_40px_-20px_rgba(16,42,86,0.12)]'
      } ${className}`}
    >
      {/* Subtle dynamic specular highlight layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `radial-gradient(circle at ${transformState.glowX}% ${transformState.glowY}%, ${
            dark ? 'rgba(22, 185, 129, 0.16)' : 'rgba(22, 185, 129, 0.09)'
          }, transparent 60%)`,
        }}
      />
      <div style={{ transform: 'translateZ(18px)' }} className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
