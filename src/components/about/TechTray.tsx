"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type Matter from "matter-js";
import { techStack } from "@/content";
import styles from "./TechTray.module.css";

const STEP = 1000 / 60; // fixed physics step, whatever the display refresh rate
const INSET = 10; // gap between the tray edge and the walls (the tray's padding)
const WALL = 400; // wall thickness, far more than a chip can travel in one step
const HEADROOM = 600; // hidden space above the tray: chips wait and fly here
const MAX_SPEED = 40; // px per step, so a hard flick cannot tunnel a wall
const CALM_FRAMES = 30; // still for this long: stop the loop until the next touch
const ARC = 8; // segments per rounded end of a chip's outline
const TAU = Math.PI * 2;
// A body is a shade larger than its chip, so what squish the solver leaves
// in a deep pile happens between the outlines, not between the chips.
const BODY_MARGIN = 1;

// The tray's height follows from the chips: the loose pile stands about
// PACK times as tall as the chips' area spread over the tray's width, plus
// a crown of leaning chips on top, measured in chip heights. The crown also
// holds the clearance under the top edge.
const PACK = 1.3;
const CROWN = 3;

// The pour: chips enter one after another through the top edge.
const CADENCE = 2; // steps between two chips, at the fastest
const CLEAR = 5; // steps a chip needs to fall out of the way of the next one
const ENTRY_SPEED = 14; // px per step, downwards
const ENTRY_TILT = 0.3; // spread of the entry angle, rad

// A spring towards upright for chips that lean further than LEAN, so none
// rests on end or upside down. Chips close to flat are left to the pile.
// Angular acceleration per ms² for each radian of lean past LEAN.
const RIGHTING = 8e-5;
const LEAN = 0.25; // rad
// Past STEEP a second, stiffer spring joins in, and that one never lets go.
const STEEP_RIGHTING = 3e-4;
const STEEP = 0.6; // rad

// A pile this deep keeps creeping long after it has landed, and the spring
// keeps it shuffling. So SETTLE_AFTER steps after the last chip was let go,
// poured in or moving faster than FAST, the air thickens and the spring lets
// go over SETTLE_OVER steps, which eases the pile to a stop. Nothing gets
// past FAST in thick air, so from there only a pointer wakes the pile.
// Gravity eases off at the same time: a stack of seventeen rows under full
// weight sinks into itself faster than the solver can push it apart, and a
// lighter pile lets the last of that squish out.
const AIR = 0.02;
const THICK_AIR = 0.2;
const GRAVITY = 1.2;
const SETTLED_GRAVITY = 0.4;
const FAST = 4; // px per step
const FAST_TURN = 0.1; // rad per step
const SETTLE_AFTER = 30;
const SETTLE_OVER = 20;
// Thick air for this long past the end of the settle counts as still, even
// if a wedged chip is still twitching under the steep spring.
const SETTLE_CAP = SETTLE_AFTER + SETTLE_OVER + 90;
const DRAG_START = 4; // px the pointer travels before a press counts as a drag

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
  const count = chips.length;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let M: typeof Matter | null = null;
  let engine: Matter.Engine | null = null;
  let bodies: Matter.Body[] = [];
  let sizes: { w: number; h: number }[] = [];
  let width = 0;
  let height = 0;
  let grab: {
    id: number;
    chip: HTMLElement;
    body: Matter.Body;
    link: Matter.Constraint;
    x: number;
    y: number;
    dragging: boolean;
  } | null = null;

  // Bodies join the world in this order. The first `poured` are in; the rest
  // wait above the tray.
  let order: number[] = [];
  let poured = 0;
  let tick = 0;
  let nextAt = 0;
  const enteredAt = new Float64Array(count); // by place in `order`
  const enteredX = new Float64Array(count);
  const shown = new Float64Array(count * 3); // x, y, angle each chip was last drawn at

  let near = false; // within a viewport of the screen: worth loading the engine
  let visible = false; // any part of the tray is on screen
  let released = false; // enough of the tray has been seen for the pour to start
  let loading = false;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let calm = 0;
  let slow = 0; // steps in a row with nothing held, entering or faster than FAST

  /**
   * Moves the chips to their bodies. The solver leaves a resting chip a
   * fraction of a pixel and a fraction of a degree off, which softens its text
   * and hairline, so the last frame before the loop stops puts every chip on
   * whole pixels, and flat if it is within half a degree of flat.
   */
  const draw = (resting = false) => {
    for (let i = 0; i < count; i++) {
      const b = bodies[i];
      let x = b.position.x - sizes[i].w / 2;
      let y = b.position.y - sizes[i].h / 2;
      let angle = b.angle;
      if (resting) {
        const flat = Math.round(angle / TAU) * TAU;
        if (Math.abs(angle - flat) < 0.009) angle = flat;
        x = Math.round(x);
        y = Math.round(y);
      }
      const at = i * 3;
      if (shown[at] === x && shown[at + 1] === y && shown[at + 2] === angle) continue;
      shown[at] = x;
      shown[at + 1] = y;
      shown[at + 2] = angle;
      chips[i].style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`;
    }
  };

  /**
   * Lets the next chip in if there is room for it under the top edge: a
   * place along the width that no chip has come through in the last moment.
   */
  const pour = () => {
    if (!M || !engine || poured >= count || tick < nextAt) return;
    const i = order[poured];
    const { w, h } = sizes[i];
    const min = INSET + w / 2;
    const max = Math.max(min, width - INSET - w / 2);
    for (let tries = 0; tries < 6; tries++) {
      const x = min + Math.random() * (max - min);
      let free = true;
      for (let k = poured - 1; k >= 0 && tick - enteredAt[k] < CLEAR; k--) {
        if (Math.abs(x - enteredX[k]) < (w + sizes[order[k]].w) / 2 + 6) {
          free = false;
          break;
        }
      }
      if (!free) continue;
      const body = bodies[i];
      M.Body.setPosition(body, { x, y: -h / 2 - w * 0.08 - 2 });
      M.Body.setAngle(body, (Math.random() - 0.5) * ENTRY_TILT);
      M.Body.setVelocity(body, { x: 0, y: ENTRY_SPEED });
      M.Composite.add(engine.world, body);
      enteredAt[poured] = tick;
      enteredX[poured] = x;
      poured++;
      nextAt = tick + CADENCE;
      return;
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (!M || !engine) return;
    acc += Math.min(now - last, 50);
    last = now;
    while (acc >= STEP) {
      acc -= STEP;
      tick++;
      pour();
      const ease = Math.min(1, Math.max(0, (slow - SETTLE_AFTER) / SETTLE_OVER));
      const air = AIR + ease * (THICK_AIR - AIR);
      const righting = RIGHTING * (1 - ease);
      engine.gravity.y = GRAVITY + ease * (SETTLED_GRAVITY - GRAVITY);
      for (let k = 0; k < poured; k++) {
        const b = bodies[order[k]];
        b.frictionAir = air;
        if (grab && grab.body === b) continue; // a held chip swings freely
        // lean from upright, between -PI and PI
        const lean = b.angle - Math.round(b.angle / TAU) * TAU;
        const size = Math.abs(lean);
        if (size <= LEAN) continue;
        // each spring grows from zero at its limit, so a chip resting right
        // at one is not kicked back and forth across it
        let pull = righting * (size - LEAN);
        if (size > STEEP) pull += STEEP_RIGHTING * (size - STEEP);
        b.torque -= Math.sign(lean) * pull * b.inertia;
      }
      M.Engine.update(engine, STEP);
      let quick = grab !== null || poured < count;
      for (let k = 0; k < poured; k++) {
        const b = bodies[order[k]];
        if (b.speed > FAST || b.angularSpeed > FAST_TURN) quick = true;
        if (b.speed > MAX_SPEED) {
          const s = MAX_SPEED / b.speed;
          M.Body.setVelocity(b, { x: b.velocity.x * s, y: b.velocity.y * s });
        }
        // safety net: a chip whose centre is outside the walls once nothing
        // is held comes back in from the top
        if (
          !grab &&
          (b.position.y > height - INSET || b.position.x < INSET || b.position.x > width - INSET)
        ) {
          M.Body.setPosition(b, { x: width / 2, y: -60 });
          M.Body.setVelocity(b, { x: 0, y: 0 });
        }
      }
      slow = quick ? 0 : slow + 1;
    }
    let moving = grab !== null || poured < count;
    for (let i = 0; !moving && slow < SETTLE_CAP && i < count; i++) {
      const b = bodies[i];
      moving = b.speed * b.speed + b.angularSpeed * b.angularSpeed > 0.02;
    }
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

  /** Builds (or rebuilds, after the width changed) the walls and one body per chip. */
  const build = () => {
    // No box means nothing to measure: the list has just been taken out of the
    // document (the observer can fire before the cleanup runs) or sits in a
    // hidden subtree. The next resize builds it.
    if (!M || disposed || reduced.matches || !tray.clientWidth) return;
    const { Bodies, Composite, Engine } = M;
    const first = engine === null;

    drop();
    if (engine) Composite.clear(engine.world, false);
    // Seventeen rows of chips on a phone need many passes to be pushed apart.
    engine ??= Engine.create({ gravity: { x: 0, y: GRAVITY }, positionIterations: 20, velocityIterations: 6 });

    // Back to the wrapped list for a moment to measure the chips. Its height
    // (the stylesheet adds clearance above the rows) is the tray's estimate
    // of what the pile needs; the pile's own need is worked out from the
    // chips' area below, and that is what the tray is pinned to.
    delete tray.dataset.live;
    tray.style.height = "";
    const box = tray.getBoundingClientRect();
    // A tray that is on screen when it first comes alive keeps its chips
    // where they are. In every other case (still below the fold, or built
    // again for a new width) they wait above the top edge and pour in.
    const inPlace = first && box.bottom > 0 && box.top < window.innerHeight;
    sizes = chips.map((c) => ({ w: c.offsetWidth, h: c.offsetHeight }));
    const home = inPlace
      ? chips.map((c) => {
          const r = c.getBoundingClientRect();
          return {
            x: r.left - box.left - tray.clientLeft + r.width / 2,
            y: r.top - box.top - tray.clientTop + r.height / 2,
          };
        })
      : null;
    width = tray.clientWidth;
    let area = 0;
    let tallest = 0;
    for (const { w, h } of sizes) {
      area += w * h;
      tallest = Math.max(tallest, h);
    }
    const need = Math.ceil(INSET * 2 + (area / (width - INSET * 2)) * PACK + CROWN * tallest);
    // Chips already in view sit where the rows put them, so that tray only
    // ever grows; one that is off screen takes the pile's height outright.
    tray.style.height = `${home ? Math.max(tray.offsetHeight, need) : need}px`;
    tray.dataset.live = "";
    height = tray.clientHeight;

    // The side walls run on past the floor: a held chip pushed into a wall is
    // pushed back out sideways, never out through the wall's end.
    const tall = height + HEADROOM + WALL * 2;
    const wallOpts = { isStatic: true, friction: 0.5 };
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, height - INSET + WALL / 2, width + WALL * 2, WALL, wallOpts),
      Bodies.rectangle(width / 2, -HEADROOM - WALL / 2, width + WALL * 2, WALL, wallOpts),
      Bodies.rectangle(INSET - WALL / 2, height + WALL - tall / 2, WALL, tall, wallOpts),
      Bodies.rectangle(width - INSET + WALL / 2, height + WALL - tall / 2, WALL, tall, wallOpts),
    ]);

    bodies = sizes.map(({ w, h }, i) =>
      Bodies.fromVertices(
        home ? home[i].x : width / 2,
        home ? home[i].y : -HEADROOM / 2,
        [pill(w + BODY_MARGIN * 2, h + BODY_MARGIN * 2)],
        { restitution: 0.12, friction: 0.5, frictionAir: AIR },
      ),
    );
    order = chips.map((_, i) => i).sort(() => Math.random() - 0.5);
    tick = 0;
    nextAt = 0;
    shown.fill(NaN);
    if (home) {
      Composite.add(engine.world, bodies);
      poured = count;
      released = true;
    } else {
      poured = 0;
    }
    draw();
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
    released = false;
    delete tray.dataset.live;
    tray.style.height = "";
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
    grab = { id: e.pointerId, chip, body, link, x: e.clientX, y: e.clientY, dragging: false };
    chip.setPointerCapture(e.pointerId);
    chip.dataset.held = "";
    run();
  };

  const onMove = (e: PointerEvent) => {
    if (!grab || e.pointerId !== grab.id) return;
    // A press that stays put is not a drag: a double click can still select
    // a chip's name. Selection is switched off only once the chip is pulled.
    if (!grab.dragging && Math.hypot(e.clientX - grab.x, e.clientY - grab.y) > DRAG_START) {
      grab.dragging = true;
      tray.dataset.dragging = "";
      window.getSelection()?.removeAllRanges();
    }
    // The anchor stops where the chip meets a wall, so the pull can never
    // drive a chip into one, however far the pointer goes. pointB is the
    // grip's offset from the chip's centre, kept in world orientation.
    const at = point(e);
    const { bounds, position } = grab.body;
    const { pointB } = grab.link;
    const gx = position.x + pointB.x;
    const gy = position.y + pointB.y;
    grab.link.pointA.x = Math.min(Math.max(at.x, INSET + gx - bounds.min.x), width - INSET - (bounds.max.x - gx));
    grab.link.pointA.y = Math.min(Math.max(at.y, -HEADROOM), height - INSET - (bounds.max.y - gy));
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
  // The pour starts once two fifths of the tray are in view, or two fifths
  // of the screen where the tray is the taller of the two.
  const viewObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      const enough = 0.4 * Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? Infinity);
      if (visible && entry.intersectionRect.height >= enough) released = true;
      if (visible) run();
      else pause();
    },
    { threshold: [0, 0.1, 0.2, 0.3, 0.4] },
  );
  // Only the width is watched: the height is set from it in build().
  const resizeObserver = new ResizeObserver(() => {
    if (tray.clientWidth !== width) build();
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
