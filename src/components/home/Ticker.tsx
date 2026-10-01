"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ticker } from "@/content";
import s from "./Ticker.module.css";

gsap.registerPlugin(ScrollTrigger);

// Seconds for one chunk to pass.
const DRIFT_DESKTOP = 32;
const DRIFT_PHONE = 46;

// Scroll velocity (px/s) that doubles the drift.
const VELOCITY_UNIT = 700;
const MAX_SPEED = 6;

export default function Ticker() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    // gsap.matchMedia only runs the callback while a listed query matches,
    // so the conditions are stated positively.
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
        // Start deep into the repeats so the loop can run backwards.
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
