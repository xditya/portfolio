"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue } from "motion/react";
import type { Stat } from "@/content";
import s from "./Stats.module.css";

// The site's --ease-out curve; Motion cannot read a CSS variable.
const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
const DURATION = 1.6;
const STAGGER = 0.08;

const format = (n: number) => String(Math.round(n));

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Odometer({
  stat,
  active,
  index,
}: {
  stat: Stat;
  active: boolean;
  index: number;
}) {
  // The rendered text is a motion value, so the count never touches React
  // state. It starts as the final value: that is what the server sends and
  // what reduced motion keeps.
  const text = useMotionValue(format(stat.value));

  // With motion allowed, the number is zeroed before the first client
  // paint and counts up once the grid scrolls into view.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    text.set(format(0));
  }, [text]);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const controls = animate(0, stat.value, {
      duration: DURATION,
      ease: EASE_OUT,
      delay: index * STAGGER,
      onUpdate: (latest) => text.set(format(latest)),
    });
    return () => controls.stop();
  }, [active, index, stat.value, text]);

  return (
    <div className={s.stat}>
      <div className={s.value}>
        <motion.span>{text}</motion.span>
        <span className={s.suffix}>{stat.suffix}</span>
      </div>
      <div className={s.label}>{stat.label}</div>
    </div>
  );
}

/** Four odometers (Repos, GitHub Stars, Followers, Years Coding). */
export default function Stats({ stats }: { stats: Stat[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.25 });

  return (
    <div ref={gridRef} className={s.grid}>
      {stats.map((stat, i) => (
        <Odometer key={stat.label} stat={stat} active={inView} index={i} />
      ))}
    </div>
  );
}
