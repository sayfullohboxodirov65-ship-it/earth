"use client";

import React, { useEffect, useMemo } from "react";

interface StarfieldProps {
  density?: number;
  className?: string;
}

/**
 * Lightweight canvas starfield with parallax drift and twinkle.
 * Renders nothing on prefers-reduced-motion.
 */
export function Starfield({ density = 1, className }: StarfieldProps) {
  const canvasRef = useMemo(() => React.createRef<HTMLCanvasElement>(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (ctx) ctx.imageSmoothingEnabled = true;

    interface Star {
      x: number; y: number; r: number; a: number; sp: number; ph: number; hue: number;
    }
    let stars: Star[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(((w * h) / 8500) * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.3,
        a: Math.random() * 0.55 + 0.2,
        sp: Math.random() * 0.02 + 0.004,
        ph: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.12 ? 110 : Math.random() < 0.5 ? 210 : 0,
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduced ? 1 : 0.5 + 0.5 * Math.sin(time * 0.001 * s.sp * 60 + s.ph);
        const alpha = s.a * (0.35 + 0.65 * tw);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        if (s.hue === 110) ctx.fillStyle = `rgba(168, 255, 158, ${alpha})`;
        else if (s.hue === 210) ctx.fillStyle = `rgba(148, 190, 255, ${alpha})`;
        else ctx.fillStyle = `rgba(232, 238, 245, ${alpha})`;
        ctx.fill();
        if (!reduced) {
          s.y += s.sp;
          if (s.y > h) s.y = 0;
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (!reduced) raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef, density]);

  return <canvas ref={canvasRef} className={className ?? "absolute inset-0 h-full w-full"} aria-hidden />;
}
