"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { InkScene } from "@/lib/fluid/InkScene";
import styles from "./InkLayer.module.css";

/* The site's fluid material: two inks diffusing in water, run on the GPU.
   Drop it inside an element with position: relative, overflow: hidden and
   touch-action: pan-y. The canvas fills that parent and the pointer
   listeners attach to it, so a finger can still scroll the page while a
   sideways drag stirs the ink. Under prefers-reduced-motion, or when WebGL
   is unavailable or lost, a still made of soft gradients takes its place. */

interface InkLayerProps {
  className?: string;
  /* 0 to 1. Scales the ink over the ground. */
  intensity?: number;
  /* Blooms on its own every second or two. */
  idle?: boolean;
  /* Pointer moves and presses splat. */
  interactive?: boolean;
  /* Where the first drop lands, as fractions of the box. false skips it. */
  opening?: { x: number; y: number } | false;
}

type Mode = "gl" | "still";

const DEFAULT_OPENING = { x: 0.36, y: 0.62 };

/* Once WebGL has failed on this device, later mounts go straight to the still. */
let webglBroken = false;

/* External store for useSyncExternalStore: reduced motion plus this
   instance's own failure flag. Nothing here touches window until the
   client subscribes or reads a snapshot. */
class ModeStore {
  private failed = false;
  private listeners = new Set<() => void>();
  private query: MediaQueryList | null = null;

  private media(): MediaQueryList | null {
    if (!this.query && typeof window !== "undefined") {
      this.query = window.matchMedia("(prefers-reduced-motion: reduce)");
    }
    return this.query;
  }

  subscribe = (listener: () => void): (() => void) => {
    const mq = this.media();
    mq?.addEventListener("change", listener);
    this.listeners.add(listener);
    return () => {
      mq?.removeEventListener("change", listener);
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): Mode => {
    if (this.failed || webglBroken) return "still";
    return this.media()?.matches ? "still" : "gl";
  };

  fail = (): void => {
    if (this.failed) return;
    this.failed = true;
    for (const listener of this.listeners) listener();
  };
}

function getServerSnapshot(): Mode {
  return "gl";
}

export default function InkLayer({
  className,
  intensity = 1,
  idle = true,
  interactive = true,
  opening = DEFAULT_OPENING,
}: InkLayerProps) {
  const [store] = useState(() => new ModeStore());
  const mode = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<InkScene | null>(null);
  /* The opening drop happens once, at mount, so later prop changes are ignored. */
  const openingRef = useRef(opening);

  useEffect(() => {
    if (mode !== "gl") return;
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const scene = InkScene.create(canvas, host, {
      intensity: 1,
      idle: true,
      interactive: true,
      opening: openingRef.current,
      onLost: store.fail,
    });
    if (!scene) {
      webglBroken = true;
      store.fail();
      return;
    }
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [mode, store]);

  useEffect(() => {
    sceneRef.current?.set({ intensity, idle, interactive });
  }, [intensity, idle, interactive, mode]);

  const classes = className ? `${styles.canvas} ${className}` : styles.canvas;

  if (mode === "still") {
    const o = opening || DEFAULT_OPENING;
    const x2 = Math.min(0.9, Math.max(0.1, o.x + 0.36));
    const y2 = Math.min(0.9, Math.max(0.1, o.y - 0.32));
    const style = {
      "--ink-ox": `${(o.x * 100).toFixed(1)}%`,
      "--ink-oy": `${(o.y * 100).toFixed(1)}%`,
      "--ink-x2": `${(x2 * 100).toFixed(1)}%`,
      "--ink-y2": `${(y2 * 100).toFixed(1)}%`,
      "--ink-i": Math.min(1, Math.max(0, intensity)),
    } as CSSProperties;
    return (
      <div
        aria-hidden="true"
        className={className ? `${styles.still} ${className}` : styles.still}
        style={style}
      />
    );
  }

  return <canvas ref={canvasRef} aria-hidden="true" className={classes} />;
}
