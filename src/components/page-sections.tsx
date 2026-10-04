"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MISSIONS, PLANETS, SHIPS, LOGS, type MissionStatus } from "@/lib/missions";
import { useTelemetry } from "./telemetry-provider";
import { OverviewSection, CrewSection, HistorySection, LaunchCountdown, CommsSection } from "./extra-sections";
import { apiUrl } from "@/lib/api";

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

/* ═══ Missions ═══════════════════════════════════════════════ */
const MISSION_STATUS: Record<MissionStatus, { dot: string; text: string; label: string }> = {
  COMPLETE: { dot: "bg-sky-400", text: "text-sky-300", label: "Complete" },
  IN_PROGRESS: { dot: "bg-nova-accent", text: "text-nova-accent", label: "In Progress" },
  UPCOMING: { dot: "bg-white/40", text: "text-nova-muted", label: "Upcoming" },
  DELAYED: { dot: "bg-amber-400", text: "text-amber-300", label: "Delayed" },
};

function MissionsSection() {
  const { missions } = useTelemetry();
  const list = missions.length ? missions : MISSIONS;

  return (
    <section id="missions" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Operations"
        title={<>Active <span className="text-nova-accent">missions</span></>}
        desc="Live operational status across the fleet. Progress streams from the command uplink in real time — dispatch a target and watch it appear."
        right={
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">
            {list.filter((m) => m.status === "IN_PROGRESS" || m.status === "UPCOMING").length} ACTIVE · {list.length} TOTAL
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((m, i) => {
          const st = MISSION_STATUS[m.status];
          return (
            <Reveal key={m.id} delay={i * 0.06}>
              <div className="glass card-hover group rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${st.dot} ${m.status === "IN_PROGRESS" ? "animate-pulse" : ""}`} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">{m.id}</span>
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${st.text}`}>{st.label}</span>
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-lg font-medium tracking-wide text-nova-ink">{m.codename}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-nova-muted">
                      → {m.target} · {m.distanceLy.toFixed(1)} LY · CREW {m.crew}
                    </div>
                  </div>
                  <div className="shrink-0 font-mono text-[11px] text-nova-accent/90">{m.eta}</div>
                </div>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.round(m.progress * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease, delay: 0.25 }}
                    className={`h-full rounded-full ${m.status === "DELAYED" ? "bg-amber-400/80" : m.status === "COMPLETE" ? "bg-sky-400/80" : "bg-nova-accent/90"}`}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.steps.map((s) => (
                    <span
                      key={s.id}
                      className={`rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${
                        s.status === "COMPLETE"
                          ? "border-nova-accent/25 text-nova-accent/80"
                          : s.status === "IN_PROGRESS"
                          ? "border-white/20 text-nova-ink"
                          : "border-white/[0.08] text-nova-muted/70"
                      }`}
                    >
                      {s.status === "COMPLETE" ? "✓ " : ""}{s.label}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ═══ Star Map ═══════════════════════════════════════════════ */
function StarMapSection() {
  const { planets } = useTelemetry();
  const worlds = planets.length ? planets : PLANETS;
  const [selected, setSelected] = useState(worlds[0].id);
  const planet = worlds.find((p) => p.id === selected) ?? worlds[0];

  return (
    <section id="star-map" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Cartography"
        title={<>Stellar <span className="text-nova-accent">star map</span></>}
        desc="Cataloged exoplanets plotted by distance and habitability. Select a world to inspect its survey record."
      />

      <Reveal>
        <div className="glass overflow-hidden rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
            {/* Plot */}
            <div className="relative h-[420px] border-b border-white/10 lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(70,110,190,0.12),transparent_60%)]" />
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                {[20, 40, 60, 80].map((v) => (
                  <React.Fragment key={v}>
                    <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                    <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                  </React.Fragment>
                ))}
              </svg>

              {worlds.map((p, i) => {
                const x = 6 + ((p.distanceLy % 480) / 480) * 88;
                const y = 86 - p.habitability * 74 - ((i * 7) % 9);
                const isSel = p.id === selected;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={p.name}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        isSel ? "h-3.5 w-3.5 bg-nova-accent shadow-[0_0_18px_rgba(168,255,158,0.9)]" : "h-2 w-2 bg-slate-300/70 group-hover:bg-nova-accent/80"
                      }`}
                    />
                    {isSel && <span className="absolute inset-0 animate-ping rounded-full bg-nova-accent/40" />}
                    <span
                      className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-widest transition-opacity ${
                        isSel ? "text-nova-accent opacity-100" : "text-nova-muted opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {p.name}
                    </span>
                  </button>
                );
              })}

              <div className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.2em] text-nova-muted/70">X · DISTANCE (LY)</div>
              <div className="absolute left-4 top-3 font-mono text-[9px] uppercase tracking-[0.2em] text-nova-muted/70">Y · HABITABILITY</div>
            </div>

            {/* Inspector */}
            <div className="relative p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,255,158,0.06),transparent_55%)]" />
              <motion.div key={planet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
                <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-nova-muted">Survey Record</div>
                <div className="mt-2 text-2xl font-light tracking-[0.08em] text-nova-ink">{planet.name}</div>

                <div
                  className="relative mx-auto my-6 h-32 w-32 rounded-full"
                  style={{
                    background:
                      planet.classification === "LAVA"
                        ? "radial-gradient(circle at 35% 30%, #7a3020, #1a0c08 75%)"
                        : planet.classification === "OCEAN"
                        ? "radial-gradient(circle at 35% 30%, #2d5a7a, #081220 75%)"
                        : planet.classification === "GAS_GIANT"
                        ? "radial-gradient(circle at 35% 30%, #6a5a48, #17110b 75%)"
                        : planet.classification === "ICE"
                        ? "radial-gradient(circle at 35% 30%, #9db8cc, #101820 75%)"
                        : "radial-gradient(circle at 35% 30%, #3d6b4f, #0a1410 78%)",
                    boxShadow: "inset -18px -14px 40px rgba(0,0,0,0.85), 0 0 40px -12px rgba(140,180,255,0.25)",
                  }}
                >
                  <div className="absolute inset-0 rounded-full shadow-[inset_8px_6px_18px_rgba(210,225,255,0.22)]" />
                </div>

                <dl className="space-y-2.5 font-mono text-[11px]">
                  {[
                    ["DISTANCE", `${planet.distanceLy.toFixed(1)} LY`],
                    ["RADIUS", `${planet.radiusKm.toLocaleString()} KM`],
                    ["HABITABILITY", `${Math.round(planet.habitability * 100)}%`],
                    ["CLASS", planet.classification],
                    ["STATUS", planet.mapped ? "MAPPED" : "UNCHARTED"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <dt className="uppercase tracking-[0.2em] text-nova-muted">{k}</dt>
                      <dd className="tabular text-nova-ink">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${planet.mapped ? "text-nova-accent" : "text-amber-300"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${planet.mapped ? "bg-nova-accent" : "bg-amber-300"}`} />
                    {planet.mapped ? "Cataloged" : "Survey Pending"}
                  </span>
                  <span className="font-mono text-[9px] text-nova-muted/60">NSS ARCHIVE · SEC 7</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══ Fleet ══════════════════════════════════════════════════ */
function FleetSection() {
  const { ships } = useTelemetry();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const fleet = ships.length ? ships : SHIPS;

  const refit = async (id: string) => {
    setBusyId(id);
    setNote(null);
    try {
      const res = await fetch(apiUrl("/api/mission"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "maintenance", ship: id }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      setNote(data.ok ? data.message : data.message);
    } catch {
      setNote("UPLINK UNREACHABLE · REFIT FAILED");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section id="fleet" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Vessels"
        title={<>Command <span className="text-nova-accent">fleet</span></>}
        desc="Every hull in the NOVA registry. Readiness is live — send a ready ship down to L5 dock and watch the refit return it to service."
      />
      {note && (
        <Reveal>
          <div className="glass mb-4 rounded-xl border border-nova-accent/25 bg-nova-accent/[0.06] px-5 py-3 font-mono text-[11px] text-nova-accent">
            {note}
          </div>
        </Reveal>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fleet.map((s, i) => (
          <Reveal key={`${s.id}-${i}`} delay={i * 0.06}>
            <div className="glass card-hover group relative flex h-full flex-col rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-semibold tracking-[0.12em] text-nova-ink">{s.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-nova-muted">{s.registry}</div>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest ${
                    s.status === "READY"
                      ? "border-nova-accent/30 text-nova-accent"
                      : s.status === "IN_TRANSIT"
                      ? "border-sky-400/30 text-sky-300"
                      : s.status === "MAINTENANCE"
                      ? "border-amber-400/30 text-amber-300"
                      : "border-white/15 text-nova-muted"
                  }`}
                >
                  {s.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-wider text-nova-muted">
                <div><div className="tabular text-lg font-light text-nova-ink">{s.crew}</div>CREW</div>
                <div><div className="tabular text-lg font-light text-nova-ink">{Math.round(s.readiness)}%</div>READINESS</div>
                <div><div className="tabular text-lg font-light text-nova-ink">{s.id === "voyager" ? "V" : "IV"}</div>CLASS</div>
              </div>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.round(s.readiness)}%` }}
                  viewport={{ once: false, margin: "-40px" }}
                  transition={{ duration: 1, ease, delay: 0.3 }}
                  className={`h-full rounded-full ${s.readiness > 50 ? "bg-nova-accent/80" : "bg-amber-400/80"}`}
                />
              </div>

              {s.status === "READY" && (
                <button
                  onClick={() => refit(s.id)}
                  disabled={busyId === s.id}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-nova-muted transition-colors hover:border-amber-400/40 hover:text-amber-300 disabled:opacity-50"
                >
                  {busyId === s.id ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                      COMMITTING…
                    </>
                  ) : (
                    <>SET DOWN FOR REFIT</>
                  )}
                </button>
              )}
              {s.status === "MAINTENANCE" && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  Dock ops in progress
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══ Research ═══════════════════════════════════════════════ */
function ResearchSection() {
  const items = [
    { k: "ATMOSPHERIC SPECTROMETRY", v: "94.2%", d: "Transemission spectra resolved for 18 worlds", w: 94 },
    { k: "GRAVITATIONAL LENSING", v: "87.6%", d: "Microlensing events confirmed this cycle", w: 88 },
    { k: "RADIO CARTOGRAPHY", v: "76.1%", d: "Sky coverage from deep-space arrays", w: 76 },
    { k: "BIOSIGNATURE INDEX", v: "61.9%", d: "Candidate worlds flagged for follow-up", w: 62 },
  ];
  return (
    <section id="research" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Science"
        title={<>Research <span className="text-nova-accent">divisions</span></>}
        desc="Instruments running hot across four disciplines — all streams feeding the 1.2M datapoint archive."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((it, i) => (
          <Reveal key={it.k} delay={i * 0.06}>
            <div className="glass card-hover rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">{it.k}</span>
                <span className="tabular text-xl font-light text-nova-accent">{it.v}</span>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${it.w}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease, delay: 0.25 }}
                  className="h-full rounded-full bg-gradient-to-r from-nova-accent/50 to-nova-accent"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-nova-muted">{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══ Logs Console ═══════════════════════════════════════════ */
const LEVEL_STYLE = {
  INFO: "text-sky-300/90",
  WARN: "text-amber-300",
  CRIT: "text-red-400",
} as const;

function LogsSection() {
  const { logs, connected } = useTelemetry();
  const [live, setLive] = useState(true);
  const shown = live ? logs : LOGS;

  return (
    <section id="logs" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <SectionHeading
        kicker="Console"
        title={<>Command <span className="text-nova-accent">logs</span></>}
        desc="Streaming straight from the uplink. Critical events are escalated to the duty officer automatically."
        right={
          <button
            onClick={() => setLive((v) => !v)}
            className={`glass flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              live ? "text-nova-accent" : "text-nova-muted"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-nova-accent" : "bg-nova-muted"}`} />
            {live ? `STREAMING · ${connected ? "UPLINK" : "LOCAL"}` : "FROZEN"}
          </button>
        }
      />
      <Reveal>
        <div className="glass-strong overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted">
            <span>/var/nova/command.log</span>
            <span>{shown.length} ENTRIES</span>
          </div>
          <div className="max-h-[380px] space-y-0.5 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
            {shown.map((l) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease }}
                className="flex items-baseline gap-3 rounded px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
              >
                <span className="shrink-0 text-nova-muted/60">{l.ts}</span>
                <span className={`w-9 shrink-0 ${LEVEL_STYLE[l.level]}`}>{l.level}</span>
                <span className="w-16 shrink-0 text-nova-muted">{l.source}</span>
                <span className="text-nova-ink/85">{l.message}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══ Dispatch CTA ═══════════════════════════════════════════ */
function DispatchSection() {
  const { planets } = useTelemetry();
  const targets = planets.length ? planets : PLANETS;
  const [target, setTarget] = useState(targets[0].id);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const planet = targets.find((p) => p.id === target) ?? targets[0];

  const launch = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl("/api/mission"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dispatch", target }),
      });
      const data = (await res.json()) as { ok: boolean; message: string; dispatchId?: string };
      setResult(data.ok ? `${data.dispatchId} · ${data.message}` : data.message);
    } catch {
      setResult("DISPATCH FAILED · UPLINK UNREACHABLE");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="dispatch" className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <Reveal>
        <div className="glass relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(168,255,158,0.1),transparent_60%)] blur-2xl" />
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-nova-accent/80">Mission Control</div>
              <h2 className="mt-3 text-3xl font-light tracking-tight text-nova-ink md:text-4xl">
                Ready to <span className="text-nova-accent text-glow">launch?</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-nova-muted">
                Select a target world and commit a vessel. The command engine will assign the nearest ready ship and open the burn window.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-nova-muted">Target World</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {targets.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setTarget(p.id)}
                    className={`rounded-lg border px-3 py-2 text-left font-mono text-[11px] transition-all ${
                      target === p.id
                        ? "border-nova-accent/60 bg-nova-accent/10 text-nova-ink"
                        : "border-white/10 text-nova-muted hover:border-white/25 hover:text-nova-ink"
                    }`}
                  >
                    <div className="tracking-[0.1em]">{p.name}</div>
                    <div className="mt-0.5 text-[9px] text-nova-muted/80">{p.distanceLy.toFixed(1)} LY</div>
                  </button>
                ))}
              </div>
              <button
                onClick={launch}
                disabled={busy}
                className="group mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-nova-ink py-3.5 text-sm font-semibold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    COMMITTING…
                  </>
                ) : (
                  <>
                    DISPATCH {planet.name}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg border border-nova-accent/25 bg-nova-accent/[0.06] px-4 py-3 font-mono text-[11px] leading-relaxed text-nova-accent"
                >
                  {result}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ═══ Footer ═════════════════════════════════════════════════ */
function Footer() {
  const { connected, telemetry, missions, ships } = useTelemetry();
  const [mtc, setMtc] = useState("--:--:--");
  useEffect(() => {
    const tick = () => setMtc(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const live = missions.filter((m) => m.status === "IN_PROGRESS" || m.status === "UPCOMING").length;
  const hulls = ships.length ? ships : SHIPS;

  return (
    <footer className="relative border-t border-white/[0.07]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row lg:px-10">
        <div className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-nova-muted">
            <path d="M12 2c1.5 4.5 3 7.5 8 10-5 2.5-6.5 5.5-8 10-1.5-4.5-3-7.5-8-10 5-2.5 6.5-5.5 8-10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-semibold tracking-[0.42em] text-nova-muted">NOVA</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted/70">
          Deep Space Mission Command · Sector 7 · Established 2087
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-nova-muted/70 lg:gap-6">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-nova-accent" : "bg-amber-400"}`} />
            {connected ? "Uplink live" : "Local sim"}
          </span>
          <span className="tabular">
            {live}/{hulls.length} ACTIVE
          </span>
          <span className="tabular text-nova-ink/70">{mtc} UTC</span>
          <span className="text-nova-ink/70">{Math.round(telemetry.velocityKms).toLocaleString()} KM/S</span>
        </div>
      </div>
    </footer>
  );
}

export function PageSections() {
  return (
    <>
      <OverviewSection />
      <MissionsSection />
      <StarMapSection />
      <FleetSection />
      <ResearchSection />
      <CrewSection />
      <HistorySection />
      <LogsSection />
      <LaunchCountdown />
      <DispatchSection />
      <CommsSection />
      <Footer />
    </>
  );
}
