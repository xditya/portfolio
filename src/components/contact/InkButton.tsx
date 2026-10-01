"use client";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type PointerEvent,
} from "react";
import { animate, type AnimationPlaybackControls } from "motion/react";
import { EASE_OUT } from "@/components/nav/shared";
import { setFillOrigin } from "@/lib/fillOrigin";
import s from "./InkButton.module.css";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// How far the noise pushes the fill's edge around, in px, while the fill
// arrives, and how long each half takes. Leaving is quicker than arriving.
const DISPLACE = 44;
const ARRIVE_SECONDS = 0.8;
const DISSOLVE_SECONDS = 0.4;

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * A .btn-fill whose hover fill arrives as ink in water. The fill itself is
 * the class's own ::before, growing from the pointer's entry side by CSS;
 * on fine pointers with motion allowed, an SVG displacement filter (fractal
 * noise) is put over that layer while it grows and eased back to nothing,
 * so the edge wobbles like dye and then settles. The filter comes off once
 * settled, and never goes on for touch or reduced motion: there the button
 * is the plain .btn-fill.
 */
export default function InkButton({ children, onPointerEnter, onPointerLeave, ...rest }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mapRef = useRef<SVGFEDisplacementMapElement>(null);
  const running = useRef<AnimationPlaybackControls | null>(null);
  // useId's delimiters are not valid inside a url(#...) reference.
  const filterId = `ink-btn-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    return () => running.current?.stop();
  }, []);

  const wobble = (from: number, to: number, duration: number) => {
    const button = buttonRef.current;
    const map = mapRef.current;
    if (!button || !map) return;
    if (!window.matchMedia(FINE_POINTER).matches) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    running.current?.stop();
    button.style.setProperty("--ink-filter", `url(#${filterId})`);
    running.current = animate(from, to, {
      duration,
      ease: EASE_OUT,
      onUpdate: (scale) => map.setAttribute("scale", scale.toFixed(1)),
      onComplete: () => {
        button.style.removeProperty("--ink-filter");
        running.current = null;
      },
    });
  };

  const enter = (e: PointerEvent<HTMLButtonElement>) => {
    setFillOrigin(e);
    onPointerEnter?.(e);
    if (!rest.disabled) wobble(DISPLACE, 0, ARRIVE_SECONDS);
  };

  const leave = (e: PointerEvent<HTMLButtonElement>) => {
    setFillOrigin(e);
    onPointerLeave?.(e);
    if (!rest.disabled) wobble(0, DISPLACE, DISSOLVE_SECONDS);
  };

  return (
    <button
      {...rest}
      ref={buttonRef}
      className={`btn-fill ${s.ink}`}
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <svg className={s.defs} aria-hidden="true" focusable="false" width="0" height="0">
        <filter
          id={filterId}
          x="-20%"
          y="-40%"
          width="140%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="grain" />
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
      {children}
    </button>
  );
}
