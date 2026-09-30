"use client";

import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import s from "./InkReveal.module.css";

gsap.registerPlugin(ScrollTrigger, CustomEase);

const PHONE_QUERY = "(max-width: 760px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

// How far the noise pushes the picture around before it settles, in px,
// and how long the settle takes. Phones get a plain crossfade instead:
// an SVG filter over a large image is slow there.
const DISPLACE_FROM = 90;
const SETTLE_SECONDS = 1.1;
const CROSSFADE_SECONDS = 0.4;
const START = "top 75%";

// The site's --ease-out curve (globals.css), registered with GSAP the
// first time a reveal runs. Lazy so the module also loads on the server.
let inkEase: gsap.EaseFunction | undefined;
function easeOut(): gsap.EaseFunction {
  inkEase ??= CustomEase.create("inkOut", "0.2, 0.8, 0.2, 1");
  return inkEase;
}

type Props = {
  children: ReactNode;
  className?: string;
  /** Seed for the noise, so neighbouring reveals do not share a pattern. */
  seed?: number;
};

/**
 * Reveals its children the way ink settles in water. The server renders
 * them visible; with motion allowed the script hides them before the
 * first client paint and, when they scroll into view, animates an SVG
 * displacement map (fractal noise) from 90px to 0 while the opacity goes
 * 0 to 1. Phones crossfade instead. Under reduced motion, and without JS,
 * the children simply sit there.
 */
export default function InkReveal({ children, className, seed = 2 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SVGFEDisplacementMapElement>(null);
  // Set once the reveal has run, so a breakpoint change does not replay it.
  const played = useRef(false);
  // useId's delimiters are not valid inside a url(#...) reference.
  const filterId = `ink-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    const map = mapRef.current;
    if (!root || !content || !map) return;

    const mm = gsap.matchMedia();
    mm.add({ phone: PHONE_QUERY, motion: MOTION_QUERY }, (context) => {
      const conditions: Record<string, boolean> = context.conditions ?? {};
      if (!conditions.motion || played.current) return;

      const ease = easeOut();
      const onStart = () => {
        played.current = true;
      };

      if (conditions.phone) {
        gsap.fromTo(
          content,
          { opacity: 0 },
          {
            opacity: 1,
            duration: CROSSFADE_SECONDS,
            ease,
            onStart,
            scrollTrigger: { trigger: root, start: START, once: true },
          },
        );
        return;
      }

      // The filter is only attached while the ink moves. Once settled it
      // comes off again so scrolling past the image costs nothing extra.
      gsap.set(content, { opacity: 0, filter: `url(#${filterId})` });
      gsap.set(map, { attr: { scale: DISPLACE_FROM } });

      const settle = gsap
        .timeline({
          paused: true,
          onStart,
          onComplete: () => {
            gsap.set(content, { clearProps: "filter" });
          },
        })
        .to(content, { opacity: 1, duration: SETTLE_SECONDS, ease }, 0)
        .to(map, { attr: { scale: 0 }, duration: SETTLE_SECONDS, ease }, 0);

      ScrollTrigger.create({
        trigger: root,
        start: START,
        once: true,
        animation: settle,
        toggleActions: "play none none none",
      });
    });

    return () => mm.revert();
  }, [filterId]);

  return (
    <div ref={rootRef} className={className ? `${s.reveal} ${className}` : s.reveal}>
      <svg className={s.defs} aria-hidden="true" focusable="false" width="0" height="0">
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
            baseFrequency="0.012"
            numOctaves="2"
            seed={seed}
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
      <div ref={contentRef} className={s.content}>
        {children}
      </div>
    </div>
  );
}
