/**
 * NOVA · API client
 * Single source of truth for reaching the mission backend.
 * - NEXT_PUBLIC_API_URL set  → the standalone Express server owns /api/*
 *   (the combined `npm run dev` / `npm start` scripts set it automatically).
 * - unset                   → same-origin Next.js route handlers are used
 *   (standalone mode, the client telemetry sim keeps the deck alive).
 */

export const API_BASE: string = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}