"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { animate } from "motion/react";
import { projects } from "@/content";
import { EASE_OUT } from "@/components/nav/shared";
import { useActiveRow } from "./RowHighlight";
import s from "./ProjectPreview.module.css";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// The card is 16:10. The stylesheet lifts it 112% of its height, so it
// floats above the cursor with a gap of 12%.
const CARD_WIDTH = 320;
const CARD_HEIGHT = CARD_WIDTH / 1.6;
const CARD_GAP = CARD_HEIGHT * 0.12;
const EDGE = 8;

// Share of the remaining distance covered per frame. The lag reads as a
// little momentum; under reduced motion the card sits on the cursor.
const FOLLOW = 0.16;

// How far the noise pushes the picture around before it settles, in px.
const DISPLACE_FROM = 40;
const SETTLE_SECONDS = 0.5;

const shots = projects.flatMap((p) =>
  p.image ? [{ id: p.name, src: p.image }] : [],
);

/**
 * The screenshot that follows the cursor over project rows. Render it once,
 * inside the RowGroup that holds the ProjectRows: it shows the picture of
 * the row the pointer is on and hides over rows without one. Fine pointers
 * only; on touch devices it is display: none and never listens.
 */
export default function ProjectPreview() {
  const active = useActiveRow();
  const posRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SVGFEDisplacementMapElement>(null);
  // useId's delimiters are not valid inside a url(#...) reference.
  const filterId = `preview-ink-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Keyboard focus moves the highlight but has no cursor to follow.
  const shownId =
    active?.pointer && shots.some((shot) => shot.id === active.id)
      ? active.id
      : null;

  // Follow the cursor. The loop sleeps once the card has caught up.
  useEffect(() => {
    const pos = posRef.current;
    if (!pos || !window.matchMedia(FINE_POINTER).matches) return;

    const follow = window.matchMedia(REDUCED_MOTION).matches ? 1 : FOLLOW;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      current.x += dx * follow;
      current.y += dy * follow;
      pos.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      raf = Math.abs(dx) + Math.abs(dy) > 0.5 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: MouseEvent) => {
      // Keep the card inside the window: clamp it sideways, and hang it
      // under the cursor (clear of the pointer glyph) when there is no
      // room above.
      const half = CARD_WIDTH / 2 + EDGE;
      const reach = CARD_HEIGHT + CARD_GAP;
      target.x = Math.min(Math.max(e.clientX, half), window.innerWidth - half);
      target.y =
        e.clientY < reach + EDGE
          ? e.clientY + reach + CARD_GAP * 2
          : e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Each picture arrives through the ink filter. The filter is attached
  // only while the noise settles, so a resting preview costs nothing.
  useEffect(() => {
    const frame = frameRef.current;
    const map = mapRef.current;
    if (!shownId || !frame || !map) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    const detach = () => {
      frame.style.filter = "";
    };
    frame.style.filter = `url(#${filterId})`;
    const settle = animate(DISPLACE_FROM, 0, {
      duration: SETTLE_SECONDS,
      ease: EASE_OUT,
      onUpdate: (scale) => map.setAttribute("scale", String(scale)),
      onComplete: detach,
    });

    return () => {
      settle.stop();
      detach();
    };
  }, [shownId, filterId]);

  return (
    <div ref={posRef} className={s.pos} aria-hidden="true">
      <svg className={s.defs} focusable="false" width="0" height="0">
        <filter
          id={filterId}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="2"
            seed="5"
            result="grain"
          />
          <feDisplacementMap
            ref={mapRef}
            in="SourceGraphic"
            in2="grain"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div
        className={s.card}
        style={{ width: CARD_WIDTH }}
        data-show={shownId ? "" : undefined}
      >
        <div ref={frameRef} className={s.frame}>
          {shots.map((shot) => (
            <Image
              key={shot.id}
              src={shot.src}
              alt=""
              fill
              sizes={`${CARD_WIDTH}px`}
              className={s.shot}
              data-on={shot.id === shownId ? "" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
