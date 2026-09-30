/* Drives one FluidSim on one canvas: the frame loop, pointer splats, the
   opening drop, idle blooms, pausing when off screen or hidden, resizing,
   and the fallback when the context is lost. Everything the loop touches is
   a number on this object, so a frame never allocates. */

import { FluidSim, type FluidColors, type RGB } from "./FluidSim";

export interface InkSceneOptions {
  intensity: number;
  idle: boolean;
  interactive: boolean;
  opening: { x: number; y: number } | false;
  /* Called once if the WebGL context goes away after a successful start. */
  onLost: () => void;
}

const DPR_CAP = 1.5;
const MAX_CANVAS = 4096;
const MAX_DT = 1 / 30;

/* Pointer trails. Radii are fractions of the canvas height. */
const POINTER_RADIUS = 0.035;
const POINTER_INK = 0.36;
const POINTER_GAIN = 0.8;
const SPEED_REF = 1.2;
const MAX_SUBSPLATS = 8;

/* A press drops a blob. */
const BLOB_RADIUS = 0.07;
const BLOB_INK = 0.9;

/* Idle blooms keep the pool alive. */
const BLOOM_RADIUS = 0.05;
const BLOOM_INK = 0.55;
const BLOOM_PUSH = 0.22;
const BLOOM_JITTER = 0.4;

/* The share of the two inks drifts round once every MIX_PERIOD seconds. */
const MIX_PERIOD = 9;
/* The ink fades in over RAMP seconds after the first frame. */
const RAMP = 0.9;

const DEFAULTS: FluidColors = {
  ground: [7 / 255, 10 / 255, 18 / 255],
  ink1: [77 / 255, 98 / 255, 255 / 255],
  ink2: [53 / 255, 211 / 255, 255 / 255],
  pale: [185 / 255, 196 / 255, 255 / 255],
};

let warned = false;
function warnOnce(reason: string): void {
  if (warned) return;
  warned = true;
  console.warn(`[InkLayer] WebGL ink unavailable, showing the still version (${reason}).`);
}

/* Reads a #rrggbb token from :root, or keeps the default. */
function token(name: string, fallback: RGB): RGB {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = /^#([0-9a-f]{6})$/i.exec(raw);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export class InkScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly host: HTMLElement;
  private readonly sim: FluidSim;
  private readonly coarse: boolean;
  private readonly onLostCallback: () => void;

  private intensity: number;
  private idle: boolean;
  private interactive: boolean;
  private opening: { x: number; y: number } | false;
  private openingPending: boolean;

  private ro: ResizeObserver | null = null;
  private io: IntersectionObserver | null = null;
  private visible: boolean;
  private running = false;
  private lost = false;
  private disposed = false;
  private raf = 0;
  private last = 0;
  private time = 0;
  private needsResize = true;
  private cssW = 0;
  private cssH = 0;

  private mixPhase = Math.PI * 0.3;
  private bloomIn = 1;

  /* Primary pointer, in fractions of the canvas. */
  private tracking = false;
  private moved = false;
  private px = 0;
  private py = 0;
  private prevX = 0;
  private prevY = 0;
  private downPending = false;
  private downX = 0;
  private downY = 0;

  /* Builds the simulation for this device, or returns null after one warning. */
  static create(canvas: HTMLCanvasElement, host: HTMLElement, options: InkSceneOptions): InkScene | null {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const colors: FluidColors = {
      ground: token("--surface-0", DEFAULTS.ground),
      ink1: token("--dye-1", DEFAULTS.ink1),
      ink2: token("--dye-2", DEFAULTS.ink2),
      pale: token("--accent-2", DEFAULTS.pale),
    };
    const sim = FluidSim.create(canvas, {
      simRes: coarse ? 64 : 128,
      dyeRes: coarse ? 256 : 512,
      pressureIterations: coarse ? 12 : 20,
      velocityDissipation: 0.5,
      dyeDissipation: 0.45,
      curl: 24,
      velocityMax: 4,
      colors,
    });
    if (typeof sim === "string") {
      warnOnce(sim);
      return null;
    }
    return new InkScene(canvas, host, sim, options, coarse);
  }

  private constructor(
    canvas: HTMLCanvasElement,
    host: HTMLElement,
    sim: FluidSim,
    options: InkSceneOptions,
    coarse: boolean,
  ) {
    this.canvas = canvas;
    this.host = host;
    this.sim = sim;
    this.coarse = coarse;
    this.onLostCallback = options.onLost;
    this.intensity = clamp01(options.intensity);
    this.idle = options.idle;
    this.interactive = options.interactive;
    this.opening = options.opening;
    this.openingPending = options.opening !== false;

    canvas.addEventListener("webglcontextlost", this.onContextLost);
    host.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    host.addEventListener("pointermove", this.onPointerMove, { passive: true });
    host.addEventListener("pointerup", this.onPointerUp, { passive: true });
    host.addEventListener("pointerleave", this.onPointerEnd, { passive: true });
    host.addEventListener("pointercancel", this.onPointerEnd, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);

    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(canvas);
    } else {
      window.addEventListener("resize", this.onResize);
    }
    if (typeof IntersectionObserver !== "undefined") {
      this.visible = false;
      this.io = new IntersectionObserver(this.onIntersect, { threshold: 0 });
      this.io.observe(host);
    } else {
      this.visible = true;
      this.updateRunning();
    }
  }

  /* Live options. The opening drop is fixed at creation. */
  set(options: { intensity?: number; idle?: boolean; interactive?: boolean }): void {
    if (options.intensity !== undefined) this.intensity = clamp01(options.intensity);
    if (options.idle !== undefined) this.idle = options.idle;
    if (options.interactive !== undefined) {
      this.interactive = options.interactive;
      if (!options.interactive) this.tracking = false;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.io?.disconnect();
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.host.removeEventListener("pointerdown", this.onPointerDown);
    this.host.removeEventListener("pointermove", this.onPointerMove);
    this.host.removeEventListener("pointerup", this.onPointerUp);
    this.host.removeEventListener("pointerleave", this.onPointerEnd);
    this.host.removeEventListener("pointercancel", this.onPointerEnd);
    this.sim.dispose();
  }

  /* ---- loop ---- */

  private updateRunning(): void {
    const want = this.visible && !document.hidden && !this.lost && !this.disposed;
    if (want && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else if (!want && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (!(dt > 0)) dt = 1 / 60;
    if (dt > MAX_DT) dt = MAX_DT;

    if (this.needsResize) this.applyResize();
    if (!this.sim.ready) {
      if (this.sim.failed) this.fail("could not allocate textures");
      return;
    }

    this.time += dt;
    this.mixPhase += (dt * Math.PI * 2) / MIX_PERIOD;
    if (this.openingPending) {
      this.openingPending = false;
      this.drop();
    }
    this.applyPointer(dt);
    if (this.idle) this.bloom(dt);
    this.sim.step(dt);

    const t = Math.min(1, this.time / RAMP);
    this.sim.render(this.intensity * (1 - (1 - t) * (1 - t)));
  };

  private fail(reason: string): void {
    if (this.lost) return;
    this.lost = true;
    this.updateRunning();
    warnOnce(reason);
    this.onLostCallback();
  }

  private applyResize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.needsResize = false;
    if (w < 2 || h < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP, MAX_CANVAS / Math.max(w, h));
    this.cssW = w;
    this.cssH = h;
    this.sim.resize(Math.round(w * dpr), Math.round(h * dpr));
  }

  /* Share of the first ink right now, 0 to 1. */
  private mix(): number {
    return 0.5 + 0.5 * Math.sin(this.mixPhase);
  }

  /* The first drop and its swirl, plus a second smaller drop up and to the right. */
  private drop(): void {
    const o = this.opening;
    if (!o || this.cssH === 0) return;
    const aspect = this.cssW / this.cssH;
    this.sim.splat(o.x, o.y, 0, 0, 1.1, 0.3, 0.12);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      this.sim.splat(
        o.x + (c * 0.07) / aspect,
        o.y + s * 0.07,
        -s * 0.3 + c * 0.12,
        c * 0.3 + s * 0.12,
        0.25,
        0.6,
        0.045,
      );
    }
    const x2 = Math.min(0.9, Math.max(0.1, o.x + 0.36));
    const y2 = Math.min(0.9, Math.max(0.1, o.y - 0.32));
    this.sim.splat(x2, y2, 0.12, 0.06, 0.3, 0.8, 0.08);
  }

  private bloom(dt: number): void {
    this.bloomIn -= dt;
    if (this.bloomIn > 0) return;
    this.bloomIn = (this.coarse ? 1.7 : 1.5) + (Math.random() - 0.5) * BLOOM_JITTER;
    const x = 0.1 + Math.random() * 0.8;
    const y = 0.1 + Math.random() * 0.8;
    const ang = Math.random() * Math.PI * 2;
    const m = this.mix();
    this.sim.splat(
      x,
      y,
      Math.cos(ang) * BLOOM_PUSH,
      Math.sin(ang) * BLOOM_PUSH,
      BLOOM_INK * m,
      BLOOM_INK * (1 - m),
      BLOOM_RADIUS,
    );
  }

  /* One pass per frame: the press blob, then the trail since the last frame,
     laid down as a few splats along the path so fast moves leave no gaps.
     Ink is metered per distance travelled, a little more when fast. */
  private applyPointer(dt: number): void {
    const m = this.mix();
    if (this.downPending) {
      this.downPending = false;
      this.sim.splat(this.downX, this.downY, 0, 0, BLOB_INK * m, BLOB_INK * (1 - m), BLOB_RADIUS);
    }
    if (!this.moved) return;
    this.moved = false;
    if (this.cssH === 0) return;
    const aspect = this.cssW / this.cssH;
    const dx = (this.px - this.prevX) * aspect;
    const dy = this.py - this.prevY;
    const len = Math.hypot(dx, dy);
    if (len > 0.00001) {
      const speed = len / dt;
      const n = Math.min(MAX_SUBSPLATS, Math.max(1, Math.ceil(len / (POINTER_RADIUS * 0.5))));
      const gain = POINTER_GAIN / Math.sqrt(n);
      const vx = (dx / dt) * gain;
      const vy = (dy / dt) * gain;
      const boost = 0.8 + 0.6 * Math.min(1, speed / SPEED_REF);
      const ink = (POINTER_INK * (len / POINTER_RADIUS) * boost) / n;
      for (let k = 1; k <= n; k++) {
        const t = k / n;
        this.sim.splat(
          this.prevX + (this.px - this.prevX) * t,
          this.prevY + (this.py - this.prevY) * t,
          vx,
          vy,
          ink * m,
          ink * (1 - m),
          POINTER_RADIUS,
        );
      }
    }
    this.prevX = this.px;
    this.prevY = this.py;
  }

  /* ---- events ---- */

  private locate(e: PointerEvent): boolean {
    const r = this.canvas.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    this.px = (e.clientX - r.left) / r.width;
    this.py = (e.clientY - r.top) / r.height;
    return true;
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (!this.interactive || !e.isPrimary || !this.locate(e)) return;
    this.downX = this.px;
    this.downY = this.py;
    this.downPending = true;
    this.prevX = this.px;
    this.prevY = this.py;
    this.tracking = true;
    this.moved = false;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.interactive || !e.isPrimary || !this.locate(e)) return;
    if (!this.tracking) {
      this.prevX = this.px;
      this.prevY = this.py;
      this.tracking = true;
      this.moved = false;
      return;
    }
    this.moved = true;
  };

  /* A finger lifting ends its trail. A mouse keeps trailing while it hovers. */
  private onPointerUp = (e: PointerEvent): void => {
    if (e.pointerType === "touch") this.tracking = false;
  };

  private onPointerEnd = (): void => {
    this.tracking = false;
    this.moved = false;
  };

  private onResize = (): void => {
    this.needsResize = true;
  };

  private onIntersect = (entries: IntersectionObserverEntry[]): void => {
    this.visible = entries[entries.length - 1].isIntersecting;
    this.updateRunning();
  };

  private onVisibility = (): void => {
    this.updateRunning();
  };

  private onContextLost = (): void => {
    this.fail("context lost");
  };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
