"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MISSIONS, PLANETS, SHIPS } from "@/lib/missions";
import { apiUrl } from "@/lib/api";

interface Command {
  id: string;
  label: string;
  hint: string;
  section: string;
  run: () => void;
}

/**
 * ⌘K command palette — senior-grade navigation + live command execution
 * (mission dispatch straight from the keyboard).
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const dispatch = useCallback(
    async (targetId: string, name: string) => {
      setDispatching(targetId);
      try {
        const res = await fetch(apiUrl("/api/mission"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "dispatch", target: targetId }),
        });
        const data = (await res.json()) as { ok: boolean; message: string; dispatchId?: string };
        setToast(data.ok ? `${data.dispatchId} · ${data.message}` : data.message);
      } catch {
        setToast(`DISPATCH FAILED · ${name} unreachable`);
      } finally {
        setDispatching(null);
        setTimeout(() => setToast(null), 4200);
      }
    },
    []
  );

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "n1", label: "Go to Dashboard", hint: "overview", section: "Navigate", run: () => scrollTo("dashboard") },
      { id: "n2", label: "Go to Program Overview", hint: "the long mission", section: "Navigate", run: () => scrollTo("overview") },
      { id: "n3", label: "Go to Missions", hint: "operations", section: "Navigate", run: () => scrollTo("missions") },
      { id: "n4", label: "Go to Star Map", hint: "cartography", section: "Navigate", run: () => scrollTo("star-map") },
      { id: "n5", label: "Go to Fleet", hint: "vessels", section: "Navigate", run: () => scrollTo("fleet") },
      { id: "n6", label: "Go to Research", hint: "science", section: "Navigate", run: () => scrollTo("research") },
      { id: "n7", label: "Go to Crew Manifest", hint: "personnel", section: "Navigate", run: () => scrollTo("crew") },
      { id: "n8", label: "Go to Mission History", hint: "archive", section: "Navigate", run: () => scrollTo("history") },
      { id: "n9", label: "Go to Logs", hint: "console", section: "Navigate", run: () => scrollTo("logs") },
      { id: "n10", label: "Go to Launch Window", hint: "countdown", section: "Navigate", run: () => scrollTo("launch-window") },
      { id: "n11", label: "Open Relay Line", hint: "communications", section: "Navigate", run: () => scrollTo("comms") },
    ];
    const missions: Command[] = MISSIONS.filter((m) => m.status !== "COMPLETE").map((m) => ({
      id: `m-${m.id}`,
      label: `${m.codename} → ${m.target}`,
      hint: `${m.id} · ${m.status.replace("_", " ")} · ETA ${m.eta}`,
      section: "Missions",
      run: () => scrollTo("missions"),
    }));
    const planets: Command[] = PLANETS.map((p) => ({
      id: `d-${p.id}`,
      label: `Dispatch mission → ${p.name}`,
      hint: `${p.distanceLy.toFixed(1)} LY · habitability ${(p.habitability * 100).toFixed(0)}%`,
      section: "Dispatch",
      run: () => dispatch(p.id, p.name),
    }));
    const ships: Command[] = SHIPS.map((s) => ({
      id: `s-${s.id}`,
      label: `Ship dossier · ${s.name}`,
      hint: `${s.registry} · ${s.status.replace("_", " ")} · readiness ${s.readiness}%`,
      section: "Fleet",
      run: () => scrollTo("fleet"),
    }));
    return [...nav, ...missions, ...planets, ...ships];
  }, [dispatch, scrollTo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 12);
    return commands
      .filter((c) => `${c.label} ${c.hint} ${c.section}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [commands, query]);

  useEffect(() => setIndex(0), [query, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && filtered[index]) { e.preventDefault(); filtered[index].run(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, index]);

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of filtered) {
      const list = map.get(c.section) ?? [];
      list.push(c);
      map.set(c.section, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="glass-strong relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-nova-accent">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search…  (missions, dispatch, ships)"
                  className="w-full bg-transparent font-mono text-sm text-nova-ink placeholder:text-nova-muted/60 focus:outline-none"
                />
                <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-nova-muted">ESC</kbd>
              </div>
              <div className="max-h-[46vh] overflow-y-auto p-2">
                {grouped.length === 0 && (
                  <div className="px-4 py-8 text-center font-mono text-xs text-nova-muted">NO MATCHES IN DATABASE</div>
                )}
                {grouped.map(([section, items]) => (
                  <div key={section} className="mb-1">
                    <div className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-nova-muted/70">{section}</div>
                    {items.map((c) => {
                      const i = filtered.indexOf(c);
                      const active = i === index;
                      return (
                        <button
                          key={c.id}
                          onMouseEnter={() => setIndex(i)}
                          onClick={() => c.run()}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                            active ? "bg-nova-accent/10 text-nova-ink" : "text-nova-muted hover:bg-white/5"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className={`text-sm ${active ? "text-nova-accent" : "text-nova-muted"}`}>
                              {c.section === "Dispatch" ? "▲" : c.section === "Navigate" ? "›" : "•"}
                            </span>
                            <span className="text-sm">{c.label}</span>
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-nova-muted/70">{c.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5 font-mono text-[10px] text-nova-muted/70">
                <span>↑↓ NAVIGATE · ⏎ EXECUTE</span>
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${dispatching ? "bg-amber-400 animate-pulse" : "bg-nova-accent"}`} />
                  UPLINK {dispatching ? "BUSY" : "READY"}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="glass-strong fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 rounded-xl px-5 py-3 font-mono text-xs text-nova-accent shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger for discoverability */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="glass fixed bottom-6 right-6 z-[80] hidden h-11 items-center gap-2 rounded-full px-4 font-mono text-[11px] text-nova-muted transition-colors hover:text-nova-ink md:flex"
      >
        <span className="text-nova-accent">⌘</span> K · COMMAND
      </button>
    </>
  );
}
