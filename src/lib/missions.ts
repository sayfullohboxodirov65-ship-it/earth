// ─── NOVA Command · Mission Domain ───────────────────────────────────────────
// Core domain model for the deep-space mission control system. This module is
// isomorphic: it is consumed by API routes (server) and UI (client).

export type ShipStatus = "READY" | "IN_TRANSIT" | "DOCKED" | "MAINTENANCE";

export type MissionStatus = "COMPLETE" | "IN_PROGRESS" | "UPCOMING" | "DELAYED";

export type SignalClass = "COMMERCIAL" | "SCIENTIFIC" | "ANOMALOUS" | "UNKNOWN";

export interface Ship {
  id: string;
  name: string;
  registry: string;
  status: ShipStatus;
  readiness: number; // 0..100
  position: { x: number; y: number }; // normalized sector coordinates
  crew: number;
}

export interface Planet {
  id: string;
  name: string;
  distanceLy: number;
  radiusKm: number;
  habitability: number; // 0..1
  mapped: boolean;
  classification: "TERRESTRIAL" | "GAS_GIANT" | "OCEAN" | "LAVA" | "ICE";
}

export interface MissionStep {
  id: string;
  label: string;
  status: MissionStatus;
  eta?: string;
  progress?: number; // 0..1
}

export interface Mission {
  id: string;
  codename: string;
  target: string;
  distanceLy: number;
  status: MissionStatus;
  progress: number; // 0..1
  crew: number;
  eta: string;
  vessel?: string; // assigned hull id
  steps: MissionStep[];
}

export interface Signal {
  id: string;
  designation: string;
  cls: SignalClass;
  frequencyMhz: number;
  bearingDeg: number;
  strength: number; // 0..1
  drift: number;
  timestamp: string;
}

export interface TelemetryFrame {
  t: number;
  hull: number; // 0..100
  reactor: number;
  lifeSupport: number;
  comms: number;
  velocityKms: number;
  distanceLy: number;
  signals: number;
  ping: number;
}

export interface LogEntry {
  id: string;
  ts: string;
  level: "INFO" | "WARN" | "CRIT";
  source: string;
  message: string;
}

export interface CommandResult {
  ok: boolean;
  action: string;
  message: string;
  mission?: Mission;
  dispatchId?: string;
  eta?: string;
}

// ─── Simulated Universe ──────────────────────────────────────────────────────

export const SHIPS: Ship[] = [
  {
    id: "voyager",
    name: "NSS VOYAGER",
    registry: "NCV-1712-A",
    status: "READY",
    readiness: 82,
    position: { x: 0.36, y: 0.62 },
    crew: 214,
  },
  {
    id: "helios",
    name: "NSS HELIOS",
    registry: "NCV-1908",
    status: "IN_TRANSIT",
    readiness: 94,
    position: { x: 0.58, y: 0.41 },
    crew: 168,
  },
  {
    id: "erebus",
    name: "NSS EREBUS",
    registry: "NCV-2044",
    status: "DOCKED",
    readiness: 67,
    position: { x: 0.71, y: 0.55 },
    crew: 96,
  },
  {
    id: "tantalus",
    name: "NSS TANTALUS",
    registry: "NCV-2210",
    status: "IN_TRANSIT",
    readiness: 91,
    position: { x: 0.22, y: 0.28 },
    crew: 132,
  },
  {
    id: "orion",
    name: "NSS ORION",
    registry: "NCV-2380",
    status: "MAINTENANCE",
    readiness: 43,
    position: { x: 0.64, y: 0.78 },
    crew: 74,
  },
];

export const PLANETS: Planet[] = [
  { id: "kepler-186f", name: "KEPLER-186F", distanceLy: 492, radiusKm: 7178, habitability: 0.74, mapped: true, classification: "TERRESTRIAL" },
  { id: "trappist-1e", name: "TRAPPIST-1E", distanceLy: 40.7, radiusKm: 5843, habitability: 0.81, mapped: true, classification: "TERRESTRIAL" },
  { id: "proxima-b", name: "PROXIMA-B", distanceLy: 4.24, radiusKm: 7480, habitability: 0.62, mapped: true, classification: "LAVA" },
  { id: "k2-18b", name: "K2-18B", distanceLy: 124, radiusKm: 13508, habitability: 0.55, mapped: false, classification: "GAS_GIANT" },
  { id: "gj-1214b", name: "GJ-1214B", distanceLy: 47.5, radiusKm: 16700, habitability: 0.18, mapped: false, classification: "ICE" },
  { id: "wolf-1061c", name: "WOLF-1061C", distanceLy: 13.8, radiusKm: 6440, habitability: 0.47, mapped: true, classification: "TERRESTRIAL" },
  { id: "toi-700d", name: "TOI-700D", distanceLy: 101.4, radiusKm: 6790, habitability: 0.71, mapped: false, classification: "TERRESTRIAL" },
  { id: "ross-128b", name: "ROSS-128B", distanceLy: 11.0, radiusKm: 6210, habitability: 0.59, mapped: true, classification: "TERRESTRIAL" },
  { id: "luyten-b", name: "LUYTEN-B", distanceLy: 12.2, radiusKm: 7150, habitability: 0.44, mapped: false, classification: "OCEAN" },
  { id: "teegarden-c", name: "TEEGARDEN-C", distanceLy: 12.5, radiusKm: 6900, habitability: 0.66, mapped: false, classification: "TERRESTRIAL" },
  { id: "yzi-12b", name: "YZI-12B", distanceLy: 872, radiusKm: 15200, habitability: 0.12, mapped: false, classification: "GAS_GIANT" },
];

export const MISSIONS: Mission[] = [
  {
    id: "M-0093",
    codename: "GRAVITY ASSIST",
    target: "KEPLER-186F",
    distanceLy: 492,
    status: "IN_PROGRESS",
    progress: 0.62,
    crew: 214,
    eta: "2D 14H",
    steps: [
      { id: "s1", label: "Engine Calibration", status: "COMPLETE" },
      { id: "s2", label: "Gravity Assist", status: "IN_PROGRESS", eta: "18:40", progress: 0.55 },
      { id: "s3", label: "Arrival · KEPLER-186F", status: "UPCOMING", eta: "ETA 2D 14H" },
      { id: "s4", label: "Surface Survey", status: "UPCOMING", eta: "D+6" },
    ],
  },
  {
    id: "M-0091",
    codename: "DEEP LISTEN",
    target: "TRAPPIST-1E",
    distanceLy: 40.7,
    status: "IN_PROGRESS",
    progress: 0.81,
    crew: 96,
    eta: "9D 02H",
    steps: [
      { id: "s1", label: "Array Deployment", status: "COMPLETE" },
      { id: "s2", label: "Long-Baseline Scan", status: "IN_PROGRESS", eta: "42:10", progress: 0.72 },
      { id: "s3", label: "Data Uplink", status: "UPCOMING", eta: "D+9" },
    ],
  },
  {
    id: "M-0094",
    codename: "FIRST LIGHT",
    target: "TOI-700D",
    distanceLy: 101.4,
    status: "UPCOMING",
    progress: 0.04,
    crew: 132,
    eta: "LAUNCH T-46H",
    steps: [
      { id: "s1", label: "Propellant Load", status: "IN_PROGRESS", progress: 0.31 },
      { id: "s2", label: "Crew Boarding", status: "UPCOMING", eta: "T-20H" },
      { id: "s3", label: "Window Open", status: "UPCOMING", eta: "T-0" },
    ],
  },
  {
    id: "M-0088",
    codename: "IRONVEIL",
    target: "PROXIMA-B",
    distanceLy: 4.24,
    status: "DELAYED",
    progress: 0.37,
    crew: 74,
    eta: "HOLD",
    steps: [
      { id: "s1", label: "Thermal Shield Refit", status: "IN_PROGRESS", progress: 0.66 },
      { id: "s2", label: "Relaunch Review", status: "UPCOMING", eta: "PENDING" },
    ],
  },
  {
    id: "M-0085",
    codename: "SILHOUETTE",
    target: "KEPLER-186F",
    distanceLy: 492,
    status: "COMPLETE",
    progress: 1,
    crew: 214,
    eta: "ARCHIVED",
    steps: [
      { id: "s1", label: "Orbital Insertion", status: "COMPLETE" },
      { id: "s2", label: "Atmospheric Assay", status: "COMPLETE" },
      { id: "s3", label: "Sample Return", status: "COMPLETE" },
    ],
  },
];

export const LOGS: LogEntry[] = [
  { id: "l1", ts: "04:12:07", level: "INFO", source: "NAV", message: "Gravity assist trajectory locked · Δv 3.2 km/s" },
  { id: "l2", ts: "04:09:51", level: "INFO", source: "SCAN", message: "7 narrowband signals resolved in sector 12-G" },
  { id: "l3", ts: "04:05:33", level: "WARN", source: "REACTOR", message: "Coolant loop B efficiency dropped to 91%" },
  { id: "l4", ts: "03:58:19", level: "INFO", source: "COMMS", message: "Deep-space array handshake complete · 1.2M datapoints" },
  { id: "l5", ts: "03:44:02", level: "INFO", source: "NAV", message: "Kepler-186F orbital window confirmed for D+14" },
  { id: "l6", ts: "03:31:44", level: "CRIT", source: "HULL", message: "Micrometeorite impact · sector C-4 sealed automatically" },
  { id: "l7", ts: "03:18:29", level: "INFO", source: "FLEET", message: "NSS ORION entered maintenance dock at L5 station" },
  { id: "l8", ts: "02:59:10", level: "WARN", source: "SCAN", message: "Unregistered signal bearing 214° · class UNKNOWN" },
];

// ─── Simulation Core ─────────────────────────────────────────────────────────

export interface UniverseState {
  telemetry: TelemetryFrame;
  signals: Signal[];
  logs: LogEntry[];
  scanRotation: number;
  missionProgress: Record<string, number>;
  dispatched: { id: string; codename: string; target: string; eta: string }[];
  missions: Mission[];
  ships: Ship[];
  planets: Planet[];
  utc: string;
}

let t = 0;
let ping = 24;
let rotation = 0;

/* ─── Mutable world state — the system actually lives here ─────── */
const worldShips: Ship[] = SHIPS.map((s) => ({ ...s }));
const worldMissions: Mission[] = MISSIONS.map((m) => ({
  ...m,
  steps: m.steps.map((st) => ({ ...st })),
  vessel:
    m.id === "M-0093" ? "voyager" : m.id === "M-0091" ? "erebus" : m.id === "M-0094" ? "tantalus" : m.id === "M-0088" ? "orion" : "helios",
}));
const worldPlanets: Planet[] = PLANETS.map((p) => ({ ...p }));
const missionProgress: Record<string, number> = Object.fromEntries(
  worldMissions.map((m) => [m.id, m.progress])
);
const dispatched: { id: string; codename: string; target: string; eta: string }[] = [];
const MAX_MISSIONS = 16;
const MAX_DISPATCHES = 8;

const SIGNAL_CLASSES: SignalClass[] = ["COMMERCIAL", "SCIENTIFIC", "ANOMALOUS", "UNKNOWN"];
const SIGNAL_PREFIX = ["UVB", "KOR", "SIG", "LNDR", "ARR", "VX", "HEL", "OBS"];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(v: number, lo = 0, hi = 100) {
  return Math.min(hi, Math.max(lo, v));
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function clock(now: Date) {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function ord(s: Ship) {
  return s.name.replace(/^NSS\s+/i, "");
}

/* Ship state evolution: crews refit, surveyors return, stations rotate. */
function evolveShips(now: Date): LogEntry[] {
  const out: LogEntry[] = [];
  for (const s of worldShips) {
    switch (s.status) {
      case "MAINTENANCE":
        s.readiness = clamp(s.readiness + 1.6);
        if (s.readiness >= 96) {
          s.readiness = clamp(s.readiness, 88, 97);
          s.status = "READY";
          out.push({
            id: `ship-${t}-${s.id}`,
            ts: clock(now),
            level: "INFO",
            source: "FLEET",
            message: `${ord(s)} refit complete · returned to active duty (${Math.round(s.readiness)}%)`,
          });
        }
        break;
      case "IN_TRANSIT":
        s.readiness = clamp(s.readiness + 0.3);
        break;
      case "DOCKED":
        s.readiness = clamp(s.readiness + 0.25);
        if (s.readiness > 90) s.status = "READY";
        break;
      default:
        s.readiness = clamp(s.readiness + rand(-0.5, 0.6));
    }
  }
  return out;
}

/* Command has a life of its own: unmapped worlds get surveyed automatically. */
function autoSurvey(now: Date): LogEntry[] {
  const out: LogEntry[] = [];
  if (Math.random() >= 0.02) return out;
  const ready = worldShips.find((s) => s.status === "READY");
  const unmapped = worldPlanets.filter((p) => !p.mapped);
  if (!ready || unmapped.length === 0) return out;
  const planet = unmapped[Math.floor(Math.random() * unmapped.length)];
  const id = `M-${2600 + Math.floor(rand(1, 9000))}`;
  missionProgress[id] = 0.02;
  worldMissions.unshift({
    id,
    codename: "AUTO-SURVEY",
    target: planet.name,
    distanceLy: planet.distanceLy,
    status: "UPCOMING",
    progress: 0.02,
    crew: ready.crew,
    eta: `PLANNING T-${Math.floor(rand(6, 40))}H`,
    vessel: ready.id,
    steps: [
      { id: "s1", label: "Course Plotting", status: "IN_PROGRESS", progress: 0.02, eta: "T-24H" },
      { id: "s2", label: "Transit", status: "UPCOMING", eta: `${Math.max(2, Math.round(planet.distanceLy / 40))}D` },
      { id: "s3", label: `Survey · ${planet.name}`, status: "UPCOMING", eta: "TBD" },
    ],
  });
  ready.status = "IN_TRANSIT";
  ready.readiness = clamp(ready.readiness - 4, 5, 100);
  out.push({
    id: `auto-${t}`,
    ts: clock(now),
    level: "INFO",
    source: "COMMAND",
    message: `Survey order opened · ${ord(ready)} cleared for ${planet.name}`,
  });
  trimWorld();
  return out;
}

function trimWorld() {
  if (worldMissions.length <= MAX_MISSIONS) return;
  const removable = worldMissions.filter((m) => m.status === "COMPLETE");
  const target = removable.length ? removable : [...worldMissions].reverse();
  for (const m of target) {
    const i = worldMissions.indexOf(m);
    if (i >= 0) worldMissions.splice(i, 1);
    if (worldMissions.length <= MAX_MISSIONS) break;
  }
}

function evolveMissions(now: Date): LogEntry[] {
  const out: LogEntry[] = [];
  for (const m of worldMissions) {
    const cur = missionProgress[m.id] ?? m.progress;
    if (m.status === "IN_PROGRESS") missionProgress[m.id] = clamp(cur + 0.002, 0, 1);
    else if (m.status === "UPCOMING") missionProgress[m.id] = clamp(cur + 0.0025, 0, 1);
  }
  for (const m of worldMissions) {
    if ((m.status === "IN_PROGRESS" || m.status === "UPCOMING") && (missionProgress[m.id] ?? 0) >= 1) {
      m.status = "COMPLETE";
      m.progress = 1;
      const ship = worldShips.find((s) => s.id === m.vessel);
      if (ship) {
        ship.status = "READY";
        ship.readiness = clamp(ship.readiness + 10, 55, 98);
      }
      const planet = worldPlanets.find((p) => p.name === m.target);
      if (planet && !planet.mapped) {
        planet.mapped = true;
        out.push({
          id: `map-${t}`,
          ts: clock(now),
          level: "INFO",
          source: "CARTOGRAPHY",
          message: `${planet.name} catalogued · habitability ${(planet.habitability * 100).toFixed(0)}%`,
        });
      }
      out.push({
        id: `done-${t}-${m.id}`,
        ts: clock(now),
        level: "INFO",
        source: "MISSION",
        message: `${m.id} ${m.codename} complete → ${m.target}`,
      });
    }
  }
  trimWorld();
  return out;
}

export function tick(): UniverseState {
  t += 1;
  ping = clamp(ping + rand(-6, 6), 18, 60);
  rotation = (rotation + 0.6) % 360;

  const now = new Date();

  const telemetry: TelemetryFrame = {
    t,
    hull: clamp(88 + Math.sin(t / 11) * 4 + rand(-0.6, 0.6)),
    reactor: clamp(76 + Math.sin(t / 7 + 2) * 9 + rand(-1, 1)),
    lifeSupport: clamp(97 + Math.sin(t / 19) * 2 + rand(-0.3, 0.3)),
    comms: clamp(93 + Math.sin(t / 13 + 1) * 5 + rand(-0.8, 0.8)),
    velocityKms: 18_400 + Math.sin(t / 9) * 240 + rand(-40, 40),
    distanceLy: 492 - t * 0.002,
    signals: 7 + Math.round(Math.sin(t / 5) * 2 + rand(0, 1.4)),
    ping,
  };

  // Occasionally evolve signals
  let signals: Signal[] = Array.from({ length: 7 }, (_, i) => ({
    id: `sig-${i}`,
    designation: `${SIGNAL_PREFIX[i % SIGNAL_PREFIX.length]}-${7100 + i * 37}`,
    cls: SIGNAL_CLASSES[i % SIGNAL_CLASSES.length],
    frequencyMhz: 1420 + i * 61 + Math.sin(t / 6 + i) * 3,
    bearingDeg: (i * 51 + t * 0.4 + i * i) % 360,
    strength: clamp(30 + Math.abs(Math.sin(t / 4 + i * 1.7)) * 65, 0, 100) / 100,
    drift: rand(-0.4, 0.4),
    timestamp: now.toISOString(),
  }));

  // Rare anomalous spike event
  if (Math.random() < 0.06) {
    const idx = Math.floor(Math.random() * signals.length);
    signals = signals.map((s, i) =>
      i === idx ? { ...s, strength: 1, cls: "ANOMALOUS", frequencyMhz: s.frequencyMhz + rand(40, 90) } : s
    );
  }

  const logs: LogEntry[] = [
    ...evolveShips(now),
    ...autoSurvey(now),
    ...evolveMissions(now),
  ];

  if (t % 6 === 0) {
    logs.push({
      id: `gen-${t}`,
      ts: clock(now),
      level: Math.random() < 0.08 ? "WARN" : "INFO",
      source: ["SCAN", "NAV", "COMMS", "REACTOR", "FLEET"][Math.floor(rand(0, 5))],
      message: [
        "Signal coherency nominal across all arrays",
        "Trajectory correction burn scheduled",
        "Deep-space relay handshake refreshed",
        "Reactor output within nominal band",
        "Fleet readiness report compiled",
        "Stellar cartography sync complete",
      ][Math.floor(rand(0, 6))],
    });
  }
  if (Math.random() < 0.02) {
    logs.push({
      id: `gen-anom-${t}`,
      ts: clock(now),
      level: "CRIT",
      source: "SCAN",
      message: "Anomalous narrowband burst detected · tracking",
    });
  }

  return {
    telemetry,
    signals,
    logs,
    scanRotation: rotation,
    missionProgress: { ...missionProgress },
    dispatched: [...dispatched],
    missions: worldMissions.map((m) => ({ ...m, progress: missionProgress[m.id] ?? m.progress })),
    ships: worldShips.map((s) => ({ ...s })),
    planets: worldPlanets.map((p) => ({ ...p })),
    utc: now.toUTCString(),
  };
}

export function dispatchMission(targetId: string): CommandResult {
  const planet = worldPlanets.find((p) => p.id === targetId) ?? worldPlanets[0];
  const ready =
    worldShips.find((s) => s.status === "READY") ??
    worldShips.find((s) => s.status !== "MAINTENANCE") ??
    worldShips[0];
  const id = `M-${950 + Math.floor(rand(1, 999))}`;
  const days = Math.max(2, Math.round(planet.distanceLy / 90));
  const eta = `${days}D ${Math.floor(rand(2, 22))}H`;

  const mission: Mission = {
    id,
    codename: `DISPATCH · ${planet.name}`,
    target: planet.name,
    distanceLy: planet.distanceLy,
    status: "UPCOMING",
    progress: 0,
    crew: ready.crew,
    eta,
    vessel: ready.id,
    steps: [
      { id: "s1", label: "Launch Window", status: "IN_PROGRESS", progress: 0.02, eta: "T-0" },
      { id: "s2", label: "Cruise Phase", status: "UPCOMING", eta },
      { id: "s3", label: `Arrival · ${planet.name}`, status: "UPCOMING", eta: `ETA ${eta}` },
    ],
  };

  missionProgress[id] = 0;
  worldMissions.unshift(mission);
  trimWorld();

  if (ready.status === "READY") {
    ready.status = "IN_TRANSIT";
    ready.readiness = clamp(ready.readiness - 6, 5, 100);
  }

  dispatched.unshift({ id, codename: "DISPATCH", target: planet.name, eta });
  if (dispatched.length > MAX_DISPATCHES) dispatched.pop();

  return {
    ok: true,
    action: "DISPATCH",
    message: `${ready.name} assigned to ${planet.name}. Burn window opened.`,
    dispatchId: id,
    eta,
    mission,
  };
}

export function beginMaintenance(shipId: string): CommandResult {
  const ship = worldShips.find((s) => s.id === shipId);
  if (!ship) return { ok: false, action: "MAINTENANCE", message: `Unknown hull ${shipId}` };
  if (ship.status !== "READY") {
    return { ok: false, action: "MAINTENANCE", message: `${ord(ship)} not in a refittable state (${ship.status.replace("_", " ")})` };
  }
  ship.status = "MAINTENANCE";
  ship.readiness = clamp(ship.readiness - 34, 8, 100);
  return {
    ok: true,
    action: "MAINTENANCE",
    message: `${ord(ship)} set down at L5 dock · refit ${Math.max(12, Math.round(ship.readiness / 6))}h`,
    dispatchId: `REFIT-${ship.id.toUpperCase()}`,
  };
}
