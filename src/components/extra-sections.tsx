"use client";

/**
 * NOVA · Extra program sections
 * Overview (program at a glance), Crew manifest, mission History timeline,
 * a live Launch Countdown and a professional Communications desk. Keeps the
 * identical design language as the rest of the deck.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PLANETS, SHIPS } from "@/lib/missions";
import { useTelemetry } from "./telemetry-provider";

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

function SectionHeading({ kicker, title, desc, right }: { kicker: string; title: React.ReactNode; desc?: string; right?: React.ReactNode }) {
  return (
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-nova-accent/80">{kicker}</div>
          <h2 className="mt-3 text-3xl font-light tracking-tight text-nova-ink md:text-4xl">{title}</h2>
          {desc && <p className="mt-3 max-w-md text-sm leading-relaxed text-nova-muted">{desc}</p>}
        </div>
        {right}
      </div>
    </Reveal>
  );
}

/* ─── Animated counter ─────────────────────────────────────── */
function useCountUp(target: number, start: boolean, duration = 1700) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return val;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const n = useCountUp(value, inView);
  return (
    <div ref={ref} className="glass card-hover rounded-2xl p-5">
      <div className="tabular text-3xl font-light text-nova-ink md:text-4xl">
        {n.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-nova-muted">{label}</div>
    </div>
  );
}

/* ═══ Overview ═══════════════════════════════════════════════ */
function OverviewSection() {
  const { ships, planets, telemetry } = useTelemetry();
  const hulls = ships.length ? ships : SHIPS;
  const worlds = planets.length ? planets : PLANETS;
  const mappedWorlds = worlds.filter((p) => p.mapped);
  const yearCount = 43;

  return (
    <section id="overview" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Program · 2087→"
        title={<>The <span className="text-nova-accent">long mission</span> in numbers</>}
        desc="NOVA Command steers humanity's quiet expansion into deep space. Every hull, every signal and every datapoint in the archive flows through this deck."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal delay={0.05}><Stat value={yearCount} label="Years on station" /></Reveal>
        <Reveal delay={0.1}><Stat value={mappedWorlds.length} label="Worlds catalogued" /></Reveal>
        <Reveal delay={0.15}><Stat value={hulls.reduce((a, s) => a + s.crew, 0)} label="Crew deployed" /></Reveal>
        <Reveal delay={0.2}><Stat value={1.2} suffix="M" label="Archive datapoints" /></Reveal>
      </div>

      <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Narrative */}
        <Reveal>
          <div className="space-y-4 text-sm leading-relaxed text-nova-muted">
            <p>
              Established in <span className="text-nova-ink">2087</span> at Lagrange point L5, NOVA Command was built
              with a single mandate: <span className="text-nova-ink">go quietly, go far, go for good.</span> The first
              survey cutters were assembled in orbit; the first exoplanet was catalogued within four years.
            </p>
            <p>
              Today the fleet spans five registered hulls and the archive holds over a million raw measurements.
              Every dispatch listed on this deck is a real operational line item in the long mission — burned,
              tracked and closed by the duty officer on station.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nova-accent/80">
              ↔ Continuity of purpose since day one
            </p>
          </div>
        </Reveal>

        {/* Relay constellation */}
        <Reveal delay={0.15}>
          <div className="glass relative overflow-hidden rounded-3xl p-6">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">
              <span>Relay Constellation · Live</span>
              <span className="flex items-center gap-1.5 text-nova-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nova-accent" /> {hulls.length} HULLS
              </span>
            </div>
            <div className="relative mt-6 aspect-[16/10]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(120,160,255,0.1),transparent_60%)]" />
              <svg viewBox="0 0 100 62" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                {hulls.map((s, i) => {
                  const next = hulls[(i + 1) % hulls.length];
                  const pulse = `pulse-${i}`;
                  return (
                    <g key={s.id}>
                      <line
                        x1={s.position.x * 100}
                        y1={s.position.y * 62}
                        x2={next.position.x * 100}
                        y2={next.position.y * 62}
                        stroke="rgba(168,255,158,0.16)"
                        strokeWidth="0.35"
                        strokeDasharray="1.4 2.2"
                      >
                        <animate attributeName="stroke-dashoffset" values="0;-120" dur={`${26 + i * 6}s`} repeatCount="indefinite" />
                      </line>
                      <circle
                        id={pulse}
                        cx={s.position.x * 100}
                        cy={s.position.y * 62}
                        r="4"
                        fill="none"
                        stroke="#a8ff9e"
                        strokeWidth="0.5"
                        opacity="0.5"
                      >
                        <animate attributeName="r" values="1.2;4" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;0" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
                      </circle>
                      <circle cx={s.position.x * 100} cy={s.position.y * 62} r="1" fill="#a8ff9e" />
                    </g>
                  );
                })}
                {mappedWorlds.slice(0, 8).map((p, i) => (
                  <circle
                    key={p.id}
                    cx={8 + ((i * 13) % 84)}
                    cy={8 + ((i * 19) % 46)}
                    r="0.7"
                    fill="rgba(148,190,255,0.6)"
                  />
                ))}
              </svg>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-widest text-nova-muted/70">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-nova-accent" /> Fleet hulls</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Catalogued worlds</span>
              <span>NSS NETWORK · SEC 7</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ Crew ═══════════════════════════════════════════════════ */
const CREW = [
  { callsign: "COM · ARIEL 01", name: "CDR. M. OKENGE", role: "Mission Commander", status: "ON STATION", code: "A1", hue: "from-nova-accent/20 to-nova-accent/5" },
  { callsign: "FLT · ANCHOR", name: "CDR. A. RIVELL", role: "Flight Director", status: "DUTY OFFICER", code: "F2", hue: "from-sky-400/20 to-sky-400/5" },
  { callsign: "SCI · PRISM", name: "DR. L. VANG", role: "Deep-Space Science", status: "ON STATION", code: "S3", hue: "from-violet-400/20 to-violet-400/5" },
  { callsign: "ENG · DUCT", name: "CMDR. K. SOLANO", role: "Chief Engineer", status: "L5 DOCK", code: "E4", hue: "from-amber-400/20 to-amber-400/5" },
];

function CrewSection() {
  return (
    <section id="crew" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Personnel"
        title={<>Command <span className="text-nova-accent">crew manifest</span></>}
        desc="The officers currently on duty across the fleet. Each callsign is tied to a single perpetual shift rotation."
        right={
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">
            {CREW.length} OFFICERS · ROTATION 24H
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CREW.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.07}>
            <div className="glass card-hover group h-full rounded-2xl p-5">
              <div
                className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br font-mono text-xl text-nova-ink transition-transform duration-300 group-hover:scale-105 ${c.hue}`}
              >
                <span className="tabular">{c.code}</span>
                <div className="shimmer-line absolute inset-x-3 bottom-0 h-px opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm font-semibold tracking-[0.14em] text-nova-ink">{c.name}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">{c.role}</div>
                <div className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-nova-accent">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-nova-accent" />
                  {c.status}
                </div>
              </div>
              <div className="mt-4 border-t border-white/[0.06] pt-3 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-nova-muted/70">
                {c.callsign}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══ History ════════════════════════════════════════════════ */
const ERA = [
  { year: "2087", title: "Command Established", desc: "NOVA Command founded at Lagrange L5 with the first orbital survey cutters.", done: true },
  { year: "2091", title: "First Catalogue", desc: "Kepler-186f surveyed and entered into the archive — the first of eleven.", done: true },
  { year: "2095", title: "NSS Voyager Launched", desc: "Flagship hull NCV-1712-A departs for the Proxima corridor.", done: true },
  { year: "2101", title: "Deep Listening", desc: "Long-baseline arrays go online; the first anomalous narrowband signals are tracked.", done: true },
  { year: "2107", title: "The Long Message", desc: "Continuous relay network across 12 light-years begins scheduled transmission.", done: false },
  { year: "2113+", title: "Second Horizon", desc: "Crewed missions beyond 400 light-years are greenlit by council vote.", done: false },
];

function HistorySection() {
  return (
    <section id="history" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Archive"
        title={<>Mission <span className="text-nova-accent">history</span></>}
        desc="Every era of the program, compressed onto a single timeline. Completed entries are locked in the ledger."
      />
      <div className="relative mx-auto max-w-3xl">
        <div className="absolute bottom-4 left-[35px] top-2 w-px bg-gradient-to-b from-nova-accent/50 via-white/15 to-transparent" />
        <div className="space-y-10">
          {ERA.map((e, i) => (
            <Reveal key={e.year} delay={i * 0.08}>
              <div className="relative pl-16">
                <span
                  className={`absolute left-[27px] top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 ${
                    e.done
                      ? "border-nova-accent/70 bg-nova-accent/30 shadow-[0_0_14px_rgba(168,255,158,0.6)]"
                      : "border-white/25 bg-nova-bg"
                  }`}
                />
                <div className={`glass card-hover rounded-2xl p-5 ${e.done ? "" : "border-dashed"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-[11px] tracking-[0.25em] text-nova-accent">{e.year}</div>
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${e.done ? "text-nova-muted" : "text-amber-300"}`}>
                      {e.done ? "· Locked" : "· Pending"}
                    </span>
                  </div>
                  <div className="mt-1.5 text-base font-medium tracking-wide text-nova-ink">{e.title}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-nova-muted">{e.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ Launch countdown ═══════════════════════════════════════ */
function useCountdown(targetMs: number) {
  const [left, setLeft] = useState(targetMs - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(targetMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const safe = Math.max(0, left);
  return {
    d: Math.floor(safe / 86400000),
    h: Math.floor((safe % 86400000) / 3600000),
    m: Math.floor((safe % 3600000) / 60000),
    s: Math.floor((safe % 60000) / 1000),
  };
}

function LaunchCountdown() {
  const targetRef = useRef<HTMLDivElement>(null);
  const inView = useInView(targetRef, { once: true, margin: "-60px" });
  const [targetMs] = useState(() => Date.now() + 46 * 3600 * 1000 + 86400000 * 2);
  const { d, h, m, s } = useCountdown(targetMs);

  const cells = [
    { label: "Days", v: String(d).padStart(2, "0") },
    { label: "Hours", v: String(h).padStart(2, "0") },
    { label: "Minutes", v: String(m).padStart(2, "0") },
    { label: "Seconds", v: String(s).padStart(2, "0") },
  ];

  return (
    <section id="launch-window" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <Reveal>
        <div ref={targetRef} className="glass relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(148,190,255,0.12),transparent_60%)] blur-2xl" />
          <div className="relative flex flex-col items-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-nova-accent/80">
              Next launch window · M-0094 FIRST LIGHT → TOI-700D
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-5">
              {cells.map((c, i) => (
                <div key={c.label} className="flex items-center gap-3 md:gap-5">
                  <motion.div
                    key={`${c.label}-${c.v}`}
                    initial={inView ? { opacity: 0, y: 14 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="glass-strong flex h-24 w-20 flex-col items-center justify-center rounded-2xl md:h-28 md:w-24"
                  >
                    <span className="tabular text-3xl font-light text-nova-ink md:text-4xl">{c.v}</span>
                    <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.25em] text-nova-muted">{c.label}</span>
                  </motion.div>
                  {i < cells.length - 1 && (
                    <span className="font-mono text-nova-muted/40">:</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nova-accent" />
                Window locked · T-0 hold verified
              </span>
              <span>CREW 132 · NSS TANTALUS</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══ Comms ══════════════════════════════════════════════════ */
function CommsSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ callsign: "", division: "RESEARCH", message: "" });
  const { telemetry } = useTelemetry();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.callsign.trim() || !form.message.trim()) return;
    setSent(true);
  };

  return (
    <section id="comms" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Communications"
        title={<>Open a <span className="text-nova-accent">relay line</span></>}
        desc="Send a priority message to the duty officer. Transmissions route through the NSS relay network at light-lag speed."
      />
      <Reveal>
        <div className="glass overflow-hidden rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
            <div className="p-8 md:p-10">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease }}
                  className="flex min-h-[280px] flex-col items-center justify-center text-center"
                >
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-nova-accent/30 bg-nova-accent/[0.08]">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-nova-accent">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="absolute inset-0 animate-ping rounded-full border border-nova-accent/20" />
                  </div>
                  <div className="mt-6 text-xl font-light tracking-wide text-nova-ink">Transmission queued</div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-nova-muted">
                    REF {String(Math.round(telemetry.t) + 9044).padStart(6, "0")} · EST. DELIVERY +4 MIN
                  </div>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({ callsign: "", division: "RESEARCH", message: "" });
                    }}
                    className="glass mt-7 rounded-full px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-nova-muted transition-colors hover:text-nova-ink"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">Callsign</label>
                      <input
                        value={form.callsign}
                        onChange={(e) => setForm((f) => ({ ...f, callsign: e.target.value }))}
                        placeholder="E.G. KAP-41"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-nova-ink placeholder:text-nova-muted/40 focus:border-nova-accent/40 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">Division</label>
                      <select
                        value={form.division}
                        onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
                        className="mt-2 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-nova-ink focus:border-nova-accent/40 focus:outline-none"
                      >
                        {["RESEARCH", "FLEET", "ENGINEERING", "NAVIGATION", "COMMAND"].map((d) => (
                          <option key={d} value={d} className="bg-[#0a0f16]">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Report position, request support, or flag an anomaly…"
                      rows={5}
                      className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm leading-relaxed text-nova-ink placeholder:text-nova-muted/40 focus:border-nova-accent/40 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-nova-muted/70">
                      Uplink {String(Math.max(0, telemetry.signals)).padStart(2, "0")} · {Math.round(telemetry.ping)}ms
                    </div>
                    <button
                      type="submit"
                      className="group flex items-center gap-3 rounded-full bg-nova-ink px-6 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      TRANSMIT
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Relay info panel */}
            <div className="relative border-t border-white/10 p-8 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(148,190,255,0.07),transparent_55%)]" />
              <div className="relative">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-nova-muted">Relay Protocol</div>
                <dl className="mt-4 space-y-2.5 font-mono text-[11px]">
                  {[
                    ["CLASS", "PRIORITY-1"],
                    ["ROUTE", "L5 ↔ SECTOR 12-G"],
                    ["BANDWIDTH", "4.2 MB/S"],
                    ["LIGHT LAG", `${telemetry.distanceLy.toFixed(1)} LY`],
                    ["HANDSHAKE", "SECURE"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <dt className="uppercase tracking-[0.2em] text-nova-muted">{k}</dt>
                      <dd className="tabular text-nova-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 font-mono text-[10px] leading-relaxed text-nova-muted">
                  ◈ Messages are read by a human duty officer within one shift rotation. Sensitive payloads are
                  redacted automatically.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══ Export ═════════════════════════════════════════════════ */
export { OverviewSection, CrewSection, HistorySection, LaunchCountdown, CommsSection };

export function ExtraSections() {
  return (
    <>
      <OverviewSection />
      <CrewSection />
      <HistorySection />
      <LaunchCountdown />
      <CommsSection />
    </>
  );
}