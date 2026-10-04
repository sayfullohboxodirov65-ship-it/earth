import { NextResponse } from "next/server";
import { LOGS, tick, dispatchMission, beginMaintenance } from "@/lib/missions";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const what = searchParams.get("what") ?? "all";
  const state = tick();

  switch (what) {
    case "ships":
      return NextResponse.json({ ships: state.ships });
    case "missions":
      return NextResponse.json({ missions: state.missions });
    case "planets":
      return NextResponse.json({ planets: state.planets });
    case "logs":
      return NextResponse.json({ logs: LOGS });
    case "telemetry":
      return NextResponse.json(state);
    default:
      return NextResponse.json({ ...state, logs: [...state.logs, ...LOGS] });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: string; target?: string; ship?: string };
    if (body?.action === "dispatch" && body.target) {
      return NextResponse.json(dispatchMission(body.target));
    }
    if (body?.action === "maintenance" && body.ship) {
      return NextResponse.json(beginMaintenance(body.ship));
    }
    return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request" }, { status: 400 });
  }
}