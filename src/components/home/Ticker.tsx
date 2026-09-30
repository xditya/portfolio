"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ticker } from "@/content";
import s from "./Ticker.module.css";

gsap.registerPlugin(ScrollTrigger);

// Seconds for one chunk to pass. The desktop loop is scaled by scroll
// velocity on top of this; phones drift at this speed and nothing else.
const DRIFT_DESKTOP = 32;
const DRIFT_PHONE = 46;

// Scroll velocity (px/s) that doubles the drift. Scrolling up past it
// turns the loop around; the result is clamped to +-6x.
const VELOCITY_UNIT = 700;
const MAX_SPEED = 6;

/**
 * The page's one marquee: the eight skills, twice, drifting left. On
 * desktop the speed and direction follow the scroll velocity and settle
 * back with inertia. Hover pauses it. Under reduced motion the items sit
 * in a static wrapped row (Ticker.module.css) and nothing here runs.
 */
export default function Ticker() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    // gsap.matchMedia only runs the callback while at least one listed
    // query matches, so the conditions are stated positively: `motion`
    // matches on a desktop with no preference, `phone` on narrow screens.
    // Listing only `reduce` and `phone` left the desktop case silent.
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        phone: "(max-width: 760px)",
      },
      (context) => {
        const conditions: Record<string, boolean> = context.conditions ?? {};
        if (!conditions.motion) return;
        const phone = Boolean(conditions.phone);

        const loop = gsap.timeline({ repeat: -1 }).to(track, {
          xPercent: -50,
          ease: "none",
          duration: phone ? DRIFT_PHONE : DRIFT_DESKTOP,
        });
        // Start deep into the repeats so the loop can run backwards for a
        // long time before it would hit its own start.
        loop.totalTime(loop.duration() * 100);

        let hovered = false;
        let visible = true;
        const sync = () => {
          if (hovered || !visible) loop.pause();
          else loop.play();
        };
        const onEnter = () => {
          hovered = true;
          sync();
        };
        const onLeave = () => {
          hovered = false;
          sync();
        };
        root.addEventListener("pointerenter", onEnter);
        root.addEventListener("pointerleave", onLeave);

        // No work while the strip is off screen.
        const observer = new IntersectionObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          visible = entry.isIntersecting;
          sync();
        });
        observer.observe(root);

        if (!phone) {
          ScrollTrigger.create({
            onUpdate: (self) => {
              const velocity = self.getVelocity();
              const target = gsap.utils.clamp(
                -MAX_SPEED,
                MAX_SPEED,
                1 + velocity / VELOCITY_UNIT,
              );
              gsap.to(loop, {
                timeScale: target,
                duration: 0.25,
                ease: "power2.out",
                overwrite: true,
                onComplete: () => {
                  gsap.to(loop, {
                    timeScale: 1,
                    duration: 1.6,
                    ease: "power3.out",
                    overwrite: true,
                  });
                },
              });
            },
          });
        }

        return () => {
          root.removeEventListener("pointerenter", onEnter);
          root.removeEventListener("pointerleave", onLeave);
          observer.disconnect();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className={s.ticker} aria-hidden="true">
      <div ref={trackRef} className={s.track}>
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className={copy === 0 ? s.chunk : `${s.chunk} ${s.dup}`}
          >
            {ticker.map((item) => (
              <span key={item} className={s.cell}>
                <span className={s.item}>{item}</span>
                <span className={s.sep} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
