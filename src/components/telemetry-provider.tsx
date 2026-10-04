"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { TelemetryFrame, Signal, LogEntry, UniverseState, Ship, Mission, Planet } from "@/lib/missions";
import { LOGS, SHIPS, MISSIONS, PLANETS } from "@/lib/missions";
import { apiUrl } from "@/lib/api";

interface TelemetryContextValue {
  connected: boolean;
  telemetry: TelemetryFrame;
  signals: Signal[];
  logs: LogEntry[];
  scanRotation: number;
  utc: string;
  ships: Ship[];
  missions: Mission[];
  planets: Planet[];
}

const FALLBACK: TelemetryFrame = {
  t: 0,
  hull: 91,
  reactor: 78,
  lifeSupport: 98,
  comms: 94,
  velocityKms: 18400,
  distanceLy: 492,
  signals: 7,
  ping: 24,
};

const TelemetryContext = createContext<TelemetryContextValue>({
  connected: false,
  telemetry: FALLBACK,
  signals: [],
  logs: LOGS,
  scanRotation: 0,
  utc: "",
  ships: SHIPS,
  missions: MISSIONS,
  planets: PLANETS,
});

/**
 * Subscribes to /api/stream (SSE). If the stream drops (e.g. static export,
 * flaky network) it seamlessly falls back to a client-side oscillator sim so
 * the UI never goes dead.
 */
export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<UniverseState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(LOGS);
  const esRef = useRef<EventSource | null>(null);
  const localT = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout>;
    let local: ReturnType<typeof setInterval>;

    const runLocalSim = () => {
      if (local || cancelled) return;
      setConnected(false);
      local = setInterval(() => {
        localT.current += 1;
        const t = localT.current;
        const c = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
        const r = (a: number, b: number) => a + Math.random() * (b - a);
        setState({
          telemetry: {
            t,
            hull: c(88 + Math.sin(t / 11) * 4 + r(-0.6, 0.6)),
            reactor: c(76 + Math.sin(t / 7 + 2) * 9 + r(-1, 1)),
            lifeSupport: c(97 + Math.sin(t / 19) * 2),
            comms: c(93 + Math.sin(t / 13 + 1) * 5),
            velocityKms: 18400 + Math.sin(t / 9) * 240,
            distanceLy: 492 - t * 0.002,
            signals: 7 + Math.round(Math.sin(t / 5) * 2),
            ping: c(24 + Math.sin(t / 4) * 14, 18, 60),
          },
          signals: Array.from({ length: 7 }, (_, i) => ({
            id: `sig-${i}`,
            designation: `SIG-${7100 + i * 37}`,
            cls: (["COMMERCIAL", "SCIENTIFIC", "ANOMALOUS", "UNKNOWN"] as const)[i % 4],
            frequencyMhz: 1420 + i * 61,
            bearingDeg: (i * 51 + t * 0.4) % 360,
            strength: c(30 + Math.abs(Math.sin(t / 4 + i * 1.7)) * 65) / 100,
            drift: r(-0.4, 0.4),
            timestamp: new Date().toISOString(),
          })),
          logs: [],
          scanRotation: (t * 0.6) % 360,
          missionProgress: {},
          dispatched: [],
          missions: MISSIONS.map((m) => ({ ...m, progress: (m.progress ?? 0) + Math.sin(t / 200) * 0.01 })),
          ships: SHIPS.map((s) => ({ ...s, readiness: Math.max(5, Math.min(100, s.readiness + Math.sin(t / 90 + 2) * 3)) })),
          planets: PLANETS.map((p) => ({ ...p })),
          utc: new Date().toUTCString(),
        });
      }, 1000);
    };

    const connect = () => {
      if (cancelled) return;
      try {
        const es = new EventSource(apiUrl("/api/stream"));
        esRef.current = es;
        es.addEventListener("hello", () => {
          if (!cancelled) setConnected(true);
          if (local) {
            clearInterval(local);
            local = undefined as unknown as ReturnType<typeof setInterval>;
          }
        });
        es.addEventListener("telemetry", (e) => {
          try {
            const frame = JSON.parse((e as MessageEvent).data) as UniverseState;
            if (!cancelled) setState(frame);
          } catch {
            /* skip malformed frame */
          }
        });
        es.onerror = () => {
          es.close();
          esRef.current = null;
          if (!cancelled) {
            runLocalSim();
            retry = setTimeout(connect, 4000);
          }
        };
      } catch {
        runLocalSim();
      }
    };

    connect();
    return () => {
      cancelled = true;
      clearTimeout(retry);
      if (local) clearInterval(local);
      esRef.current?.close();
    };
  }, []);

  // Merge streamed log lines into the console
  useEffect(() => {
    if (state?.logs?.length) {
      setLogs((prev) => [...state.logs, ...prev].slice(0, 60));
    }
  }, [state]);

  const value = useMemo<TelemetryContextValue>(
    () => ({
      connected,
      telemetry: state?.telemetry ?? FALLBACK,
      signals: state?.signals ?? [],
      logs,
      scanRotation: state?.scanRotation ?? 0,
      utc: state?.utc ?? "",
      ships: state?.ships?.length ? state.ships : SHIPS,
      missions: state?.missions?.length ? state.missions : MISSIONS,
      planets: state?.planets?.length ? state.planets : PLANETS,
    }),
    [connected, state, logs]
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  return useContext(TelemetryContext);
}
