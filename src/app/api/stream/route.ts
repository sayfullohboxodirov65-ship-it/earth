import { tick } from "@/lib/missions";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream of live telemetry.
 * The dashboard subscribes once and receives a `UniverseState` frame every 1s.
 */
export function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      send("hello", { ok: true, ts: Date.now() });

      const interval = setInterval(() => {
        try {
          send("telemetry", tick());
        } catch {
          // stream errored; fall through to cleanup
        }
      }, 1000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
