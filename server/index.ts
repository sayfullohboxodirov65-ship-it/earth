/**
 * NOVA · Deep Space Mission Command — Full-stack API server
 *
 * Standalone Express backend that owns the mission domain: live telemetry
 * (SSE), system state, fleet/planet data and the dispatch engine. The Next.js
 * frontend proxies every `/api/*` request here when `API_TARGET` is set
 * (which the combined `npm run dev` / `npm start` scripts do automatically).
 */

import express, { type Request, type Response } from "express";
import cors from "cors";
import {
  tick,
  dispatchMission,
  beginMaintenance,
  LOGS,
} from "../src/lib/missions";

const PORT = Number(process.env.PORT ?? 4000);
const app = express();

app.use(cors());
app.use(express.json());

/* ── Health ────────────────────────────────────────────────── */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "nova-api", ts: Date.now(), uptime: process.uptime() });
});

/* ── All endpoints on one GET (live world snapshot) ────────── */
app.get("/api", (req: Request, res: Response) => {
  const what = typeof req.query.what === "string" ? req.query.what : "all";
  const state = tick();
  switch (what) {
    case "ships":
      return res.json({ ships: state.ships });
    case "missions":
      return res.json({ missions: state.missions });
    case "planets":
      return res.json({ planets: state.planets });
    case "logs":
      return res.json({ logs: LOGS });
    case "telemetry":
      return res.json(state);
    default:
      return res.json({
        ...state,
        logs: [...state.logs, ...LOGS],
      });
  }
});

app.get("/api/mission", (req: Request, res: Response) => {
  const what = typeof req.query.what === "string" ? req.query.what : "all";
  const state = tick();
  switch (what) {
    case "ships":
      return res.json({ ships: state.ships });
    case "missions":
      return res.json({ missions: state.missions });
    case "planets":
      return res.json({ planets: state.planets });
    case "logs":
      return res.json({ logs: LOGS });
    case "telemetry":
      return res.json(state);
    default:
      return res.json({ ...state, logs: [...state.logs, ...LOGS] });
  }
});

/* ── Actions (dispatch / maintenance) ──────────────────────── */
app.post("/api/mission", (req: Request, res: Response) => {
  try {
    const { action, target, ship } = (req.body ?? {}) as { action?: string; target?: string; ship?: string };
    if (action === "dispatch" && target) {
      return res.json(dispatchMission(target));
    }
    if (action === "maintenance" && ship) {
      return res.json(beginMaintenance(ship));
    }
    return res.status(400).json({ ok: false, message: "Unknown action" });
  } catch {
    return res.status(400).json({ ok: false, message: "Malformed request" });
  }
});

/* ── Live telemetry stream (SSE) ───────────────────────────── */
const encode = (data: unknown) => `data: ${JSON.stringify(data)}\n\n`;
const encodeEvent = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

app.get("/api/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let closed = false;
  res.write(encodeEvent("hello", { ok: true, ts: Date.now() }));

  const timer = setInterval(() => {
    if (closed) return;
    try {
      res.write(encodeEvent("telemetry", tick()));
    } catch {
      close();
    }
  }, 1000);

  const heartbeat = setInterval(() => {
    if (closed) return;
    try {
      res.write(": ping\n\n");
    } catch {
      close();
    }
  }, 20000);

  const close = () => {
    if (closed) return;
    closed = true;
    clearInterval(timer);
    clearInterval(heartbeat);
    res.end();
  };

  req.on("close", close);
  req.on("error", close);
});

/* ── Boot ──────────────────────────────────────────────────── */
const server = app.listen(PORT, () => {
  console.log(`[nova-api] NOVA Mission backend listening on http://localhost:${PORT}`);
  console.log(`[nova-api] SSE stream  → GET /api/stream`);
  console.log(`[nova-api] Dispatch    → POST /api/mission`);
});

const shutdown = (signal: string) => {
  console.log(`[nova-api] ${signal} received, shutting down…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 4000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));