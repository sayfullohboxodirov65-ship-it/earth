"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Starfield } from "./starfield";
import { useTelemetry } from "./telemetry-provider";
import { MISSIONS, type MissionStep } from "@/lib/missions";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Fleet Status ──────────────────────────────────────────── */
function FleetCard() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 1) % 3), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass card-hover group relative flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">Fleet Status</span>
        <span className="font-mono text-[10px] text-nova-muted">3/5</span>
      </div>

      {/* Wireframe ship */}
      <div className="relative mx-auto my-6 h-32 w-56 opacity-90 transition-opacity group-hover:opacity-100">
        <svg viewBox="0 0 240 130" className="h-full w-full text-nova-accent/80" fill="none">
          <g stroke="currentColor" strokeWidth="0.8">
            <path d="M20 70 C50 40 90 32 130 36 C170 40 205 52 224 66 C205 80 170 92 130 96 C90 100 50 96 20 70 Z" />
            <path d="M40 66 C70 48 100 42 132 45 C165 48 195 56 212 66 C195 76 165 84 132 87 C100 90 70 84 40 66 Z" />
            <path d="M130 36 L138 20 L156 26 L150 40" />
            <path d="M60 56 L60 82 M90 48 L90 92 M120 44 L120 96 M150 46 L150 90 M180 54 L180 78" opacity="0.55" />
            <path d="M20 70 L44 30 L74 38 M20 70 L44 108 L74 100" opacity="0.7" />
          </g>
          <g stroke="currentColor" strokeWidth="0.5" opacity="0.4">
            <path d="M50 58 L110 52 M50 76 L110 82 M150 52 L200 62 M150 80 L200 72" />
          </g>
          {/* Engine glow */}
          <circle cx="16" cy="70" r="4" fill="#a8ff9e" opacity={0.5 + pulse * 0.2}>
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <path d="M4 70 L14 66 M4 70 L14 74" stroke="#a8ff9e" strokeWidth="1" opacity="0.7" />
        </svg>
        <div className="shimmer-line absolute bottom-0 left-8 right-8 h-px" />
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-[0.14em] text-nova-ink">NSS VOYAGER</span>
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-nova-accent">
            <span className="h-1 w-1 rounded-full bg-nova-accent" /> READY
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "82%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease, delay: 0.4 }}
            className="h-full rounded-full bg-nova-accent/90"
          />
        </div>
        <div className="mt-1.5 text-right font-mono text-[10px] text-nova-muted">82%</div>
      </div>
    </div>
  );
}

/* ── Next Mission ──────────────────────────────────────────── */
function NextMissionCard() {
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <div className="glass card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between p-5 pb-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">Next Mission</span>
        <span className="font-mono text-[10px] text-nova-muted">ETA 2D 14H</span>
      </div>

      <div className="relative mx-5 mt-4 h-36 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#2c3a4d_0%,#131b26_45%,#05070c_100%)]" />
        <Starfield density={0.7} />
        {/* Landscape moon */}
        <div className="absolute -bottom-14 left-1/2 h-40 w-64 -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_50%_0%,#54627a_0%,#2a3444_40%,#0b0f16_80%)]" />
        <div className="absolute -bottom-16 left-1/4 h-24 w-40 rounded-[100%] bg-[radial-gradient(ellipse_at_50%_0%,#3d4a5e_0%,#141b26_70%)] opacity-80" />
        <div className="absolute -bottom-16 right-0 h-20 w-44 rounded-[100%] bg-[radial-gradient(ellipse_at_50%_0%,#33405273_0%,#0e141d_70%)] opacity-70" />
        {/* Sky glow */}
        <div className="absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(190,210,255,0.35),transparent_65%)] blur-md" />
      </div>

      <div className="flex items-center justify-between p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-[3px] rounded bg-nova-accent" />
            <span className="text-sm font-semibold tracking-[0.16em] text-nova-ink">KEPLER-186F</span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">Survey Mission</div>
        </div>
        <button
          onClick={() => jump("missions")}
          aria-label="Open missions"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-nova-muted transition-all hover:scale-105 hover:text-nova-accent"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── System Scan (Radar) ───────────────────────────────────── */
function ScanCard() {
  const { signals, telemetry, scanRotation } = useTelemetry();
  const [live, setLive] = useState(true);
  const rot = live ? scanRotation : 0;
  const shown = live ? signals : [];

  return (
    <div className="glass card-hover relative flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">System Scan</span>
        <button
          onClick={() => setLive((v) => !v)}
          className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            live ? "text-nova-accent" : "text-nova-muted"
          }`}
        >
          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nova-accent" />}
          {live ? "LIVE" : "PAUSED"}
        </button>
      </div>

      {/* Radar */}
      <div className="relative mx-auto mt-4 aspect-square w-full max-w-[210px]">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {[86, 64, 42, 20].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          ))}
          <path d="M100 14 V186 M14 100 H186" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line
            x1="100" y1="100" x2="100" y2="12"
            stroke="url(#sweep)" strokeWidth="2"
            transform={`rotate(${rot} 100 100)`}
          />
          <defs>
            <linearGradient id="sweep" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(168,255,158,0.05)" />
              <stop offset="100%" stopColor="rgba(168,255,158,0.95)" />
            </linearGradient>
          </defs>
          {shown.map((s) => {
            const rad = (s.bearingDeg * Math.PI) / 180;
            const dist = 78 * (1 - s.strength * 0.75);
            const x = 100 + Math.cos(rad) * dist;
            const y = 100 + Math.sin(rad) * dist;
            const anomalous = s.cls === "ANOMALOUS" || s.cls === "UNKNOWN";
            return (
              <g key={s.id}>
                <circle cx={x} cy={y} r={anomalous ? 3.4 : 2.4} fill={anomalous ? "#ffd166" : "#a8ff9e"} />
                <circle cx={x} cy={y} r={anomalous ? 7 : 5.5} fill="none" stroke={anomalous ? "#ffd166" : "#a8ff9e"} strokeWidth="0.7" opacity="0.45" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <div className="tabular text-2xl font-light text-nova-ink">{String(shown.length || telemetry.signals).padStart(2, "0")}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-nova-muted">Signals Detected</div>
        </div>
        <button
          onClick={() => document.getElementById("logs")?.scrollIntoView({ behavior: "smooth" })}
          className="glass flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-[10px] uppercase tracking-widest text-nova-muted transition-colors hover:text-nova-accent"
        >
          View <span aria-hidden>↗</span>
        </button>
      </div>
    </div>
  );
}

/* ── Mission Timeline ──────────────────────────────────────── */
const STEP_STYLE: Record<MissionStep["status"], string> = {
  COMPLETE: "border-white/10",
  IN_PROGRESS: "border-nova-accent/40 shadow-[0_0_30px_-10px_rgba(168,255,158,0.4)]",
  UPCOMING: "border-white/[0.07]",
  DELAYED: "border-amber-400/30",
};

function TimelineCard() {
  const mission = MISSIONS[0];
  return (
    <div className="glass card-hover relative flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">Mission Timeline</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-nova-muted">Upcoming</span>
      </div>

      <div className="relative mt-5 flex-1 pl-1">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-nova-accent/60 via-white/15 to-transparent" />
        <div className="space-y-2.5">
          {mission.steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease, delay: 0.15 + i * 0.12 }}
              className={`relative ml-5 rounded-xl border p-3 ${STEP_STYLE[step.status]}`}
            >
              <span
                className={`absolute -left-[23px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 ${
                  step.status === "IN_PROGRESS"
                    ? "border-nova-bg bg-nova-accent shadow-[0_0_10px_rgba(168,255,158,0.9)]"
                    : step.status === "COMPLETE"
                    ? "border-nova-accent/60 bg-nova-accent/40"
                    : "border-white/25 bg-nova-bg"
                }`}
              />
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[13px] font-medium ${step.status === "UPCOMING" ? "text-nova-muted" : "text-nova-ink"}`}>
                  {step.label}
                </span>
                {step.status === "COMPLETE" && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-nova-accent/90">Complete</span>
                )}
                {step.eta && <span className="ml-auto shrink-0 font-mono text-[9px] text-nova-muted">{step.eta}</span>}
              </div>
              {typeof step.progress === "number" && (
                <div className="mt-2 h-0.5 overflow-hidden rounded bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.round(step.progress * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease, delay: 0.5 + i * 0.12 }}
                    className="h-full bg-nova-accent/80"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Grid ──────────────────────────────────────────────────── */
export function BottomCards() {
  return (
    <section className="relative z-10 mx-auto -mt-56 w-full max-w-7xl px-6 pb-24 lg:px-10">
      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Reveal delay={0.05}><FleetCard /></Reveal>
          <Reveal delay={0.12}><NextMissionCard /></Reveal>
          <Reveal delay={0.19}><ScanCard /></Reveal>
          <Reveal delay={0.26}><TimelineCard /></Reveal>
        </div>
      </Reveal>
    </section>
  );
}
