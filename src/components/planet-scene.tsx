"use client";

import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Living planet: CSS-painted sphere with rotating cloud bands, drifting
 * terminator, atmospheric rim light, orbital rings with traveling probes and
 * a slow asteroid belt. Pure DOM/SVG — no heavy WebGL, buttery on all devices.
 */
export function PlanetScene() {
  const cloudsRef = useRef<HTMLDivElement>(null);

  const asteroids = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        angle: (i / 14) * 360 + Math.random() * 14,
        radius: 44 + Math.random() * 5,
        size: 1 + Math.random() * 2.2,
        speed: 26 + Math.random() * 26,
        delay: -Math.random() * 40,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden>
      {/* Deep space glow */}
      <div className="absolute -right-40 -top-56 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(120,160,255,0.14),transparent_62%)] blur-2xl" />
      <div className="absolute right-24 top-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,255,158,0.08),transparent_60%)] blur-2xl" />

      {/* Planet sphere */}
      <div className="anim-floaty absolute right-[6%] top-1/2 hidden aspect-square w-[min(52vw,620px)] -translate-y-1/2 md:block">
        {/* Orbit rings + probes */}
        <div className="absolute inset-[-14%] animate-spin-slower rounded-full border border-white/10">
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nova-accent shadow-[0_0_12px_rgba(168,255,158,0.9)]" />
          <span className="absolute bottom-2 right-6 h-1.5 w-1.5 rounded-full bg-slate-300/80" />
        </div>
        <div className="absolute inset-[-26%] animate-spin-reverse rounded-full border border-dashed border-white/[0.07]">
          <span className="absolute right-[12%] top-[8%] h-1.5 w-1.5 rounded-full bg-sky-300/90 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
        </div>

        {/* Asteroid belt */}
        <div className="absolute inset-[-19%]">
          {asteroids.map((a, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full bg-slate-500/70"
              style={{
                width: a.size,
                height: a.size,
                transform: `rotate(${a.angle}deg) translateX(${a.radius / 2}%)`,
                transformOrigin: "0 0",
                animation: `spin ${a.speed}s linear infinite`,
                animationDelay: `${a.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Sphere body */}
        <div className="relative h-full w-full overflow-hidden rounded-full shadow-[inset_-60px_-40px_120px_rgba(0,0,0,0.9),0_0_120px_-30px_rgba(140,180,255,0.35)]">
          {/* Base gradient */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_30%,#3b4d63_0%,#1b2634_38%,#070b12_78%)]" />

          {/* Rotating cloud bands */}
          <div
            ref={cloudsRef}
            className="absolute inset-0 rounded-full opacity-70 mix-blend-screen"
            style={{
              background:
                "repeating-linear-gradient(100deg, transparent 0 18px, rgba(190,205,225,0.10) 18px 26px, transparent 26px 52px, rgba(190,205,225,0.06) 52px 60px)",
              animation: "spin 60s linear infinite",
            }}
          />
          {/* Swirling storm layer */}
          <div
            className="absolute inset-0 rounded-full opacity-50 mix-blend-soft-light"
            style={{
              background:
                "radial-gradient(ellipse 30% 14% at 60% 38%, rgba(200,220,255,0.5), transparent 70%), radial-gradient(ellipse 24% 10% at 42% 62%, rgba(200,220,255,0.35), transparent 70%), radial-gradient(ellipse 18% 8% at 68% 66%, rgba(168,255,158,0.22), transparent 70%)",
              animation: "floaty 11s ease-in-out infinite",
            }}
          />

          {/* Terminator shadow */}
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(255deg,transparent_38%,rgba(2,4,8,0.55)_58%,rgba(1,2,5,0.96)_86%)]" />

          {/* Rim light */}
          <div className="absolute inset-0 rounded-full shadow-[inset_14px_10px_38px_rgba(210,225,255,0.28)]" />

          {/* City lights on night side */}
          <div
            className="absolute inset-0 rounded-full opacity-30 mix-blend-screen"
            style={{
              background:
                "radial-gradient(1.5px 1.5px at 24% 55%, rgba(255,220,150,0.9), transparent 100%), radial-gradient(1.2px 1.2px at 30% 68%, rgba(255,220,150,0.7), transparent 100%), radial-gradient(1.6px 1.6px at 18% 70%, rgba(255,220,150,0.8), transparent 100%), radial-gradient(1.1px 1.1px at 27% 47%, rgba(255,220,150,0.6), transparent 100%)",
            }}
          />
        </div>

        {/* Atmosphere halo */}
        <div className="absolute inset-[-3%] rounded-full bg-[radial-gradient(circle_at_34%_30%,rgba(150,190,255,0.22),transparent_58%)] blur-xl" />

        {/* Moons */}
        <div className="absolute -bottom-6 left-2 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_30%,#4a5666,#0a0e15_75%)] shadow-[inset_-10px_-8px_24px_rgba(0,0,0,0.85)]" />
        <div className="absolute -left-10 top-6 h-9 w-9 rounded-full bg-[radial-gradient(circle_at_35%_30%,#39424f,#070a10_75%)] shadow-[inset_-6px_-5px_14px_rgba(0,0,0,0.85)]" />
      </div>

      {/* Target badge overlay */}
      <motion.div className="absolute right-[30%] top-[16%] hidden md:block">
        <div className="glass-strong rounded-xl px-4 py-3 text-right shadow-2xl">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-nova-muted">Target</div>
          <div className="text-sm font-semibold tracking-[0.18em] text-nova-ink">KEPLER-186F</div>
          <div className="font-mono text-[10px] text-nova-muted">DISTANCE 492 LY</div>
        </div>
        <svg width="90" height="60" viewBox="0 0 90 60" className="absolute -bottom-14 right-6 text-nova-accent/70">
          <path d="M45 0 L45 24" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="45" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );
}
