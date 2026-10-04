"use client";

import React from "react";
import { motion } from "framer-motion";
import { Starfield } from "./starfield";
import { PlanetScene } from "./planet-scene";
import { useTelemetry } from "./telemetry-provider";

const ease = [0.22, 1, 0.36, 1] as const;

function fmtDatapoints(t: number) {
  const total = 1_200_000 + t * 140;
  if (total >= 1e6) return `${(total / 1e6).toFixed(2)}M`;
  if (total >= 1e3) return `${Math.round(total).toLocaleString()}`;
  return String(Math.round(total));
}

export function Hero() {
  const { telemetry, connected, missions, planets } = useTelemetry();

  const active = missions.filter((m) => m.status === "IN_PROGRESS" || m.status === "UPCOMING").length;
  const mapped = planets.filter((p) => p.mapped).length;
  const STATS = [
    { icon: "◉", value: String(active).padStart(2, "0"), label: "ACTIVE\nMISSIONS" },
    { icon: "◈", value: String(mapped).padStart(2, "0"), label: "PLANETS\nMAPPED" },
    { icon: "▤", value: fmtDatapoints(telemetry.t), label: "DATA POINTS\nCOLLECTED" },
  ];

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="dashboard" className="relative flex min-h-[108vh] flex-col overflow-hidden pb-64 pt-32">
      <Starfield density={1.1} />
      <PlanetScene />

      {/* Left vignette for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(4,6,10,0.9)_0%,rgba(4,6,10,0.55)_34%,transparent_62%)]" />

      {/* Content column */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 lg:px-10">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
            className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-nova-muted">System Status</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nova-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-nova-accent" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-nova-accent">
              {connected ? "Nominal" : "Local Sim"}
            </span>
          </motion.div>

          <h1 className="mt-7 text-[13vw] font-light leading-[0.95] tracking-tight text-nova-ink sm:text-6xl md:text-7xl lg:text-[5.2rem]">
            {["EXPLORE.", "DISCOVER.", "ENDURE."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className={`block ${i === 2 ? "text-nova-accent text-glow" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease, delay: 0.25 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.7 }}
            className="mt-6 max-w-sm text-[15px] leading-relaxed text-nova-muted"
          >
            Navigate the unknown, catalog new worlds, and expand the boundaries of human presence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.85 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => jump("dispatch")}
              className="group relative flex items-center gap-3 rounded-full bg-nova-ink px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-95"
            >
              LAUNCH MISSION
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute inset-0 rounded-full bg-nova-accent/0 transition-colors group-hover:bg-nova-accent/10" />
            </button>
            <button
              onClick={() => jump("star-map")}
              className="glass flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium text-nova-ink transition-colors hover:border-nova-accent/40"
            >
              VIEW STAR MAP
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
              </svg>
            </button>
          </motion.div>

          {/* Live micro-readout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[10px] uppercase tracking-[0.18em] text-nova-muted"
          >
            <span>VEL <span className="tabular text-nova-ink">{Math.round(telemetry.velocityKms).toLocaleString()} km/s</span></span>
            <span>SIGNALS <span className="tabular text-nova-ink">{String(telemetry.signals).padStart(2, "0")}</span></span>
            <span>PING <span className="tabular text-nova-ink">{Math.round(telemetry.ping)}ms</span></span>
          </motion.div>
        </div>

        {/* Right stats rail */}
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.6 }}
          className="pointer-events-none absolute right-10 top-40 hidden flex-col gap-9 text-right lg:flex"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="mb-1 font-mono text-nova-muted/80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-auto">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <div className="tabular text-2xl font-light text-nova-ink">{s.value}</div>
              <div className="whitespace-pre-line font-mono text-[9px] uppercase leading-relaxed tracking-[0.22em] text-nova-muted">{s.label}</div>
            </div>
          ))}
        </motion.aside>

        {/* Scroll cue */}
        <motion.button
          onClick={() => jump("overview")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="glass absolute bottom-60 right-6 hidden h-14 w-14 items-center justify-center rounded-full text-nova-muted transition-colors hover:text-nova-accent md:flex"
          aria-label="Scroll to overview"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}
