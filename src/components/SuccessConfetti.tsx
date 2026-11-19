import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  alpha: number;
}

const COLORS = ['#16B981', '#102A56', '#34D399', '#FBBF24', '#1E40AF'];

export function SuccessConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 540;
    const height = parent ? parent.clientHeight : 420;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = Array.from({ length: 64 }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.45;
      const speed = 4 + Math.random() * 6.5;
      return {
        x: width / 2 + (Math.random() - 0.5) * 60,
        y: height * 0.28,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 5 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.24,
        color: COLORS[i % COLORS.length],
        alpha: 1,
      };
    });

    let frameId = 0;
    let frameCount = 0;

    const render = () => {
      frameCount += 1;
      ctx.clearRect(0, 0, width, height);

      let anyAlive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gentle gravity
        p.vx *= 0.985;
        p.rotation += p.vRot;
        if (frameCount > 75) {
          p.alpha = Math.max(0, p.alpha - 0.025);
        }

        if (p.alpha > 0 && p.y < height + 20) {
          anyAlive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          ctx.restore();
        }
      }

      if (anyAlive && frameCount < 160) {
        frameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full z-20"
    />
  );
}
