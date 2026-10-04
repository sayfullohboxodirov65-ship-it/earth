"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTelemetry } from "./telemetry-provider";
import { useAmbient } from "./ambient-music";

const LINKS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "overview", label: "Overview" },
  { id: "missions", label: "Missions" },
  { id: "star-map", label: "Star Map" },
  { id: "fleet", label: "Fleet" },
  { id: "research", label: "Research" },
  { id: "logs", label: "Logs" },
];

export function Navbar() {
  const [active, setActive] = useState("dashboard");
  const { connected, telemetry } = useTelemetry();
  const { enabled: soundOn, toggle: toggleSound } = useAmbient();
  const [scrolled, setScrolled] = useState(false);
  const [mtc, setMtc] = useState("--:--:--");

  useEffect(() => {
    const tick = () =>
      setMtc(
        new Date()
          .toISOString()
          .slice(11, 19)
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex w-full max-w-6xl items-center gap-2 rounded-2xl px-3 py-2.5 transition-all duration-500 md:gap-3 ${
          scrolled ? "glass-strong shadow-2xl" : "glass"
        }`}
      >
        {/* Brand */}
        <button onClick={() => jump("dashboard")} className="flex shrink-0 items-center gap-2.5 pl-1 pr-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-nova-ink">
            <path d="M12 2c1.5 4.5 3 7.5 8 10-5 2.5-6.5 5.5-8 10-1.5-4.5-3-7.5-8-10 5-2.5 6.5-5.5 8-10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold tracking-[0.42em] text-nova-ink">NOVA</span>
        </button>

        {/* Links with sliding pill — scroll instead of overlapping on narrow widths */}
        <div className="no-scrollbar relative hidden min-w-0 flex-1 justify-center md:flex">
          <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto py-0.5">
            {LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => jump(l.id)}
                className={`relative whitespace-nowrap rounded-full px-3 py-2 text-[13px] transition-colors lg:px-4 ${
                  active === l.id ? "text-nova-ink" : "text-nova-muted hover:text-nova-ink"
                }`}
              >
                {active === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            onClick={toggleSound}
            aria-label={soundOn ? "Mute ambient audio" : "Play ambient audio"}
            title={soundOn ? "Mute ambience" : "Play ambience"}
            className={`group relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              soundOn ? "border-nova-accent/40 text-nova-accent" : "border-white/12 text-nova-muted hover:text-nova-ink"
            }`}
          >
            {soundOn ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                <path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                <path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
            {soundOn && <span className="absolute inset-0 animate-ping rounded-full bg-nova-accent/20" />}
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-nova-muted lg:flex">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-nova-accent animate-pulse" : "bg-amber-400"}`} />
            {connected ? `UPLINK ${Math.round(telemetry.ping)}ms` : "LOCAL SIM"}
            <span className="ml-1 border-l border-white/10 pl-2 tabular tracking-wider text-nova-ink/80">MTC {mtc}</span>
          </div>
          <div className="hidden h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-slate-700 to-slate-900 sm:block" />
          <button
            onClick={() => jump("dispatch")}
            className="hidden rounded-full bg-nova-ink px-4 py-2 text-[13px] font-medium text-black transition-transform hover:scale-[1.04] active:scale-95 md:block"
          >
            Dispatch
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
