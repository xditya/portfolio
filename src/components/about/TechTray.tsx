"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type Matter from "matter-js";
import { techStack } from "@/content";
import styles from "./TechTray.module.css";

const STEP = 1000 / 60; // fixed physics step, whatever the display refresh rate
const INSET = 10; // gap between the tray edge and the walls (the tray's padding)
const WALL = 400; // wall thickness, far more than a chip can travel in one step
const HEADROOM = 600; // hidden space above the tray: chips spawn and fly here
const MAX_SPEED = 40; // px per step, so a hard flick cannot tunnel a wall
const CALM_FRAMES = 45; // still for this long: stop the loop until the next touch
const ARC = 8; // segments per rounded end of a chip's outline

/**
 * The outline of a chip around its centre, clockwise. Matter's own chamfer
 * stops each corner arc one step short, which leaves the long edges slightly
 * slanted and a resting chip tilted by about a degree; this one is symmetric,
 * so a chip lies flat.
 */
function pill(w: number, h: number) {
  const r = h / 2;
  const half = w / 2 - r;
  const points: { x: number; y: number }[] = [];
  for (const side of [1, -1]) {
    for (let i = 0; i <= ARC; i++) {
      const a = (Math.PI * i) / ARC - Math.PI / 2;
      points.push({ x: side * (half + Math.cos(a) * r), y: side * Math.sin(a) * r });
    }
  }
  return points;
}

/**
 * Turns the static chip list into a physics tray. Everything lives in this
 * closure and on the DOM nodes (no React state), and the returned function
 * undoes all of it.
 */
function mountTray(tray: HTMLElement) {
  const chips = Array.from(tray.children) as HTMLElement[];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  let M: typeof Matter | null = null;
  let engine: Matter.Engine | null = null;
  let bodies: Matter.Body[] = [];
  let walls: Matter.Body[] = [];
  let sizes: { w: number; h: number }[] = [];
  let width = 0;
  let height = 0;
  let grab: { id: number; chip: HTMLElement; body: Matter.Body; link: Matter.Constraint } | null = null;

  let near = false; // within a viewport of the screen: worth loading the engine
  let visible = false; // any part of the tray is on screen
  let released = false; // enough of the tray has been seen for the drop to start
  let loading = false;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let calm = 0;

  /**
   * Moves the chips to their bodies. The solver leaves a resting chip a
   * fraction of a pixel and a fraction of a degree off, which softens its text
   * and hairline, so the last frame before the loop stops puts every chip on
   * whole pixels, and flat if it is within half a degree of flat.
   */
  const draw = (resting = false) => {
    bodies.forEach((b, i) => {
      const { w, h } = sizes[i];
      let x = b.position.x - w / 2;
      let y = b.position.y - h / 2;
      let angle = b.angle;
      if (resting) {
        const flat = Math.round(angle / Math.PI) * Math.PI;
        if (Math.abs(angle - flat) < 0.009) angle = flat;
        x = Math.round(x);
        y = Math.round(y);
      }
      chips[i].style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`;
    });
  };

  const frame = (now: number) => {
    raf = 0;
    if (!M || !engine) return;
    acc += Math.min(now - last, 50);
    last = now;
    while (acc >= STEP) {
      M.Engine.update(engine, STEP);
      acc -= STEP;
      for (const b of bodies) {
        if (b.speed > MAX_SPEED) {
          const k = MAX_SPEED / b.speed;
          M.Body.setVelocity(b, { x: b.velocity.x * k, y: b.velocity.y * k });
        }
        // safety net: anything that still got out comes back in from the top
        if (b.position.y > height + 200 || b.position.x < -200 || b.position.x > width + 200) {
          M.Body.setPosition(b, { x: width / 2, y: -60 });
          M.Body.setVelocity(b, { x: 0, y: 0 });
        }
      }
    }
    const moving = grab !== null || bodies.some((b) => b.speed * b.speed + b.angularSpeed * b.angularSpeed > 0.02);
    calm = moving ? 0 : calm + 1;
    draw(calm >= CALM_FRAMES);
    if (calm < CALM_FRAMES) raf = requestAnimationFrame(frame);
  };

  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const run = () => {
    calm = 0;
    if (raf || !engine || !visible || !released || document.hidden) return;
    last = performance.now();
    acc = 0;
    raf = requestAnimationFrame(frame);
  };

  const drop = () => {
    if (!grab) return;
    const { id, chip, link } = grab;
    grab = null;
    if (M && engine) M.Composite.remove(engine.world, link);
    if (chip.hasPointerCapture(id)) chip.releasePointerCapture(id);
    delete chip.dataset.held;
    delete tray.dataset.dragging;
  };

  /** Builds (or rebuilds, after a resize) the walls and one body per chip. */
  const build = () => {
    // No box means nothing to measure: the list has just been taken out of the
    // document (the observer can fire before the cleanup runs) or sits in a
    // hidden subtree. The next resize builds it.
    if (!M || disposed || reduced.matches || !tray.clientWidth) return;
    const { Bodies, Body, Composite, Engine } = M;
    const first = engine === null;
    const box = tray.getBoundingClientRect();
    const onScreen = box.bottom > 0 && box.top < window.innerHeight;
    // positions the chips hold right now: their static layout on the first
    // build, their bodies after that
    const prev = first
      ? chips.map((c) => {
          const r = c.getBoundingClientRect();
          return {
            x: r.left - box.left - tray.clientLeft + r.width / 2,
            y: r.top - box.top - tray.clientTop + r.height / 2,
            angle: 0,
          };
        })
      : bodies.map((b) => ({ x: b.position.x, y: b.position.y, angle: b.angle }));

    drop();
    if (engine) Composite.clear(engine.world, false);
    engine ??= Engine.create({
      gravity: { x: 0, y: 1.2 },
      positionIterations: coarse ? 4 : 6,
      velocityIterations: coarse ? 3 : 4,
    });

    width = tray.clientWidth;
    height = tray.clientHeight;
    tray.dataset.live = "";
    sizes = chips.map((c) => ({ w: c.offsetWidth, h: c.offsetHeight }));

    const tall = height + HEADROOM + WALL;
    const wallOpts = { isStatic: true, friction: 0.5 };
    walls = [
      Bodies.rectangle(width / 2, height - INSET + WALL / 2, width + WALL * 2, WALL, wallOpts),
      Bodies.rectangle(width / 2, -HEADROOM - WALL / 2, width + WALL * 2, WALL, wallOpts),
      Bodies.rectangle(INSET - WALL / 2, height - tall / 2, WALL, tall, wallOpts),
      Bodies.rectangle(width - INSET + WALL / 2, height - tall / 2, WALL, tall, wallOpts),
    ];

    // A tray that is already on screen keeps its chips where they are and just
    // comes alive. One that is still below the fold gets them stacked above
    // its top edge, out of sight, ready to fall when it is scrolled to.
    const fromAbove = first && !onScreen;
    const slots = chips.map((_, i) => i).sort(() => Math.random() - 0.5);
    bodies = chips.map((_, i) => {
      const { w, h } = sizes[i];
      const min = INSET + w / 2;
      const max = Math.max(min, width - INSET - w / 2);
      const p = fromAbove
        ? {
            x: min + ((slots[i] + 0.2 + Math.random() * 0.6) / chips.length) * (max - min),
            y: -h - i * 84,
            angle: (Math.random() - 0.5) * 0.5,
          }
        : prev[i];
      const body = Bodies.fromVertices(
        Math.min(max, Math.max(min, p.x)),
        Math.min(height - INSET - h / 2, p.y),
        [pill(w, h)],
        { restitution: 0.22, friction: 0.5, frictionAir: 0.018 },
      );
      Body.setAngle(body, p.angle);
      return body;
    });

    Composite.add(engine.world, [...walls, ...bodies]);
    draw();
    if (!fromAbove) released = true;
    run();
  };

  const load = () => {
    if (loading || engine || disposed || reduced.matches) return;
    loading = true;
    Promise.all([import("matter-js"), document.fonts.ready])
      .then(([mod]) => {
        M = ((mod as { default?: typeof Matter }).default ?? mod) as typeof Matter;
        build();
      })
      .catch(() => {
        // the static list stays as it is
      })
      .finally(() => {
        loading = false;
      });
  };

  const unbuild = () => {
    pause();
    drop();
    if (M && engine) M.Engine.clear(engine);
    engine = null;
    bodies = [];
    walls = [];
    released = false;
    delete tray.dataset.live;
    for (const c of chips) c.style.transform = "";
  };

  const point = (e: PointerEvent) => {
    const box = tray.getBoundingClientRect();
    return { x: e.clientX - box.left - tray.clientLeft, y: e.clientY - box.top - tray.clientTop };
  };

  const onDown = (e: PointerEvent) => {
    if (!M || !engine || grab || e.button !== 0) return;
    const chip = (e.target as HTMLElement).closest("li");
    const i = chip ? chips.indexOf(chip) : -1;
    if (!chip || i < 0) return;
    const body = bodies[i];
    const at = point(e);
    const link = M.Constraint.create({
      pointA: at,
      bodyB: body,
      pointB: { x: at.x - body.position.x, y: at.y - body.position.y },
      length: 0,
      stiffness: 0.22,
      damping: 0.12,
    });
    M.Composite.add(engine.world, link);
    grab = { id: e.pointerId, chip, body, link };
    chip.setPointerCapture(e.pointerId);
    chip.dataset.held = "";
    tray.dataset.dragging = "";
    run();
  };

  const onMove = (e: PointerEvent) => {
    if (!grab || e.pointerId !== grab.id) return;
    const at = point(e);
    grab.link.pointA.x = at.x;
    grab.link.pointA.y = at.y;
    run();
  };

  const onUp = (e: PointerEvent) => {
    if (!grab || e.pointerId !== grab.id) return;
    // the body keeps whatever velocity the drag gave it: that is the flick
    drop();
    run();
  };

  const onVisibility = () => (document.hidden ? pause() : run());
  const onReduced = () => {
    if (reduced.matches) unbuild();
    else if (near) load();
  };

  const nearObserver = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      if (near) load();
    },
    { rootMargin: "100% 0px" },
  );
  const viewObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (entry.intersectionRatio >= 0.4) released = true;
      if (visible) run();
      else pause();
    },
    { threshold: [0, 0.4] },
  );
  const resizeObserver = new ResizeObserver(() => {
    if (tray.clientWidth !== width || tray.clientHeight !== height) build();
  });

  nearObserver.observe(tray);
  viewObserver.observe(tray);
  resizeObserver.observe(tray);
  tray.addEventListener("pointerdown", onDown);
  tray.addEventListener("pointermove", onMove);
  tray.addEventListener("pointerup", onUp);
  tray.addEventListener("pointercancel", onUp);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onReduced);

  return () => {
    disposed = true;
    nearObserver.disconnect();
    viewObserver.disconnect();
    resizeObserver.disconnect();
    tray.removeEventListener("pointerdown", onDown);
    tray.removeEventListener("pointermove", onMove);
    tray.removeEventListener("pointerup", onUp);
    tray.removeEventListener("pointercancel", onUp);
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener("change", onReduced);
    unbuild();
  };
}

export default function TechTray() {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => (ref.current ? mountTray(ref.current) : undefined), []);

  return (
    // role="list" because list-style: none drops the list semantics in Safari
    <ul ref={ref} className={styles.tray} role="list">
      {techStack.map((t) => (
        <li
          key={t.name}
          className={styles.chip}
          style={{ "--c": t.color, "--logo": `url(/logos/${t.logo}.svg)` } as CSSProperties}
        >
          <span className={styles.logo} aria-hidden="true" />
          {t.name}
        </li>
      ))}
    </ul>
  );
}
