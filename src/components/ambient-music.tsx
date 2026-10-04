"use client";

/**
 * NOVA Ambient Audio
 * Procedural deep-space ambience synthesized live with the Web Audio API —
 * no streaming, no bundled files, works fully offline. A slow chord pad, a
 * filtered "solar wind" bed and sparse high sparkles keep the command deck
 * alive without ever being distracting. Toggled from the navbar / dock.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ─── Tiny helpers ─────────────────────────────────────────── */
const now = (ctx: AudioContext) => ctx.currentTime;

function makeNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const rate = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(rate * seconds), rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function buildImpulse(ctx: AudioContext, seconds = 3.2, decay = 2.6): AudioBuffer {
  const rate = ctx.sampleRate;
  const buf = ctx.createBuffer(2, Math.floor(rate * seconds), rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const t = i / rate;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t / seconds, decay);
    }
  }
  return buf;
}

/* A mellow Am–F–C–G progression, doubled, drifting through reverb. */
const CHORDS: number[][] = [
  [220.0, 261.63, 329.63, 392.0, 440.0],
  [174.61, 220.0, 261.63, 349.23, 440.0],
  [130.81, 196.0, 261.63, 329.63, 392.0],
  [196.0, 246.94, 293.66, 392.0, 493.88],
];

/* ─── Engine ───────────────────────────────────────────────── */
class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private chordGain: GainNode | null = null;
  private chordTimer: ReturnType<typeof setTimeout> | null = null;
  private chordIndex = 0;
  private voices: OscillatorNode[] = [];
  private windNodes: AudioNode[] = [];
  private disposed = false;

  private ensureContext(): boolean {
    if (this.ctx) return true;
    if (typeof window === "undefined") return false;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    const reverb = ctx.createConvolver();
    reverb.buffer = buildImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.85;
    master.connect(reverb);
    reverb.connect(wet);
    wet.connect(ctx.destination);
    master.connect(ctx.destination);
    this.master = master;

    this.buildChordLayer();
    this.buildWindLayer();
    return true;
  }

  private lowpassFor(freq: number): BiquadFilterNode {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    f.Q.value = 0.4;
    return f;
  }

  private buildChordLayer() {
    const ctx = this.ctx!;
    const chordBus = ctx.createGain();
    chordBus.gain.value = 0.5;
    const chordFilter = this.lowpassFor(1500);
    chordBus.connect(chordFilter);
    chordFilter.connect(this.master!);

    this.chordGain = ctx.createGain();
    this.chordGain.gain.value = 0;
    this.chordGain.connect(chordBus);
  }

  private stopVoices() {
    for (const v of this.voices) {
      try {
        v.stop();
        v.disconnect();
      } catch {
        /* already stopped */
      }
    }
    this.voices = [];
    if (this.chordGain) this.chordGain.gain.cancelScheduledValues(now(this.ctx!));
  }

  private playChord() {
    if (!this.ctx || !this.chordGain || this.disposed) return;
    const ctx = this.ctx;
    const t = now(ctx);
    const chord = CHORDS[this.chordIndex % CHORDS.length];
    this.chordIndex = (this.chordIndex + 1) % CHORDS.length;

    this.stopVoices();
    this.chordGain.gain.cancelScheduledValues(t);
    this.chordGain.gain.setValueAtTime(0, t);

    for (const [i, freq] of chord.entries()) {
      for (const detune of [-4, 4]) {
        const osc = ctx.createOscillator();
        osc.type = i < 2 ? "triangle" : "sine";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(i < 2 ? 0.055 : 0.028, t + 4.5);
        osc.connect(g);
        g.connect(this.chordGain);
        osc.start(t);
        osc.stop(t + 32);
        this.voices.push(osc);
      }
    }

    this.chordGain.gain.setValueAtTime(0, t);
    this.chordGain.gain.linearRampToValueAtTime(1, t + 5.2);
    this.chordGain.gain.setValueAtTime(1, t + 15);
    this.chordGain.gain.linearRampToValueAtTime(0, t + 19.2);

    this.chordTimer = setTimeout(() => this.playChord(), 19000);
  }

  private buildWindLayer() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, 4);
    src.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 420;
    bp.Q.value = 0.35;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain);
    lfoGain.connect(bp.frequency);

    const g = ctx.createGain();
    g.gain.value = 0.03;
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master!);

    src.start();
    lfo.start();
    this.windNodes = [src, bp, lfo, lfoGain, g];
  }

  start() {
    if (this.disposed) return;
    if (!this.ensureContext()) return;
    const ctx = this.ctx!;
    if (ctx.state === "suspended") void ctx.resume();
    this.master!.gain.cancelScheduledValues(now(ctx));
    this.master!.gain.setValueAtTime(0, now(ctx));
    this.master!.gain.linearRampToValueAtTime(0.16, now(ctx) + 2);
    this.playChord();
  }

  stop() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    this.master.gain.cancelScheduledValues(now(ctx));
    this.master.gain.setValueAtTime(this.master.gain.value, now(ctx));
    this.master.gain.linearRampToValueAtTime(0, now(ctx) + 0.8);
    window.setTimeout(() => {
      this.stopVoices();
      if (ctx.state === "running") void ctx.suspend();
    }, 900);
  }

  dispose() {
    this.disposed = true;
    if (this.chordTimer) clearTimeout(this.chordTimer);
    this.stopVoices();
    for (const n of this.windNodes) {
      try {
        n.disconnect();
      } catch {
        /* noop */
      }
    }
    if (this.ctx) void this.ctx.close().catch(() => undefined);
    this.ctx = null;
  }
}

/* ─── React binding ────────────────────────────────────────── */
interface AmbientContextValue {
  enabled: boolean;
  toggle: () => void;
}

const AmbientContext = React.createContext<AmbientContextValue>({
  enabled: false,
  toggle: () => undefined,
});

export function AmbientMusic({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<AmbientEngine | null>(null);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = new AmbientEngine();
    return engineRef.current;
  }, []);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    const engine = getEngine();
    if (next) engine.start();
    else engine.stop();
  }, [getEngine]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <AmbientContext.Provider value={{ enabled, toggle }}>{children}</AmbientContext.Provider>
  );
}

export function useAmbient() {
  return React.useContext(AmbientContext);
}

/* ─── Floating dock control ────────────────────────────────── */
export function AmbientDock() {
  const { enabled, toggle } = useAmbient();
  const [active, setActive] = useState(false);

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Mute ambient audio" : "Play ambient audio"}
      title={enabled ? "Mute ambience" : "Play ambience"}
      className="glass-strong fixed bottom-6 left-6 z-[80] hidden h-11 items-center gap-2.5 rounded-full px-4 font-mono text-[10px] uppercase tracking-widest text-nova-muted transition-colors hover:text-nova-ink md:flex"
    >
      <motion.span
        className="relative flex h-2 w-2"
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
      >
        {enabled &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inline-flex h-full w-full rounded-full bg-nova-accent"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: active ? 0.1 : [0, 0.55, 0.15, 0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.12 * i, ease: "easeInOut" }}
            />
          ))}
        <motion.span
          className="relative inline-flex h-2 w-2 rounded-full"
          animate={{ backgroundColor: enabled ? "#a8ff9e" : "#8a97a8" }}
          transition={{ duration: 0.4 }}
        />
      </motion.span>
      {enabled ? "Ambience On" : "Ambience Off"}
    </button>
  );
}