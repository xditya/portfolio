"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { animate, inView } from "motion/react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const MAX_STAGGER = 3; // rows that arrive together follow each other, up to here

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const motionAllowed = () => !window.matchMedia(REDUCED).matches;
const onServer = () => false;

// Server markup is visible; only rows below the fold after hydration fade in.
export default function TimelineEntry({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const animated = useSyncExternalStore(subscribe, motionAllowed, onServer);

  useEffect(() => {
    const row = ref.current;
    if (!animated || !row || row.getBoundingClientRect().top < window.innerHeight) return;
    row.style.opacity = "0";
    // the callback returns nothing, so the row is watched for one entry only
    const stop = inView(
      row,
      () => {
        animate(
          row,
          { opacity: [0, 1], y: [16, 0] },
          { type: "spring", duration: 0.6, bounce: 0, delay: Math.min(index, MAX_STAGGER) * 0.05 },
        );
      },
      { amount: 0.3 },
    );
    return () => {
      stop();
      row.style.opacity = "";
      row.style.transform = "";
    };
  }, [animated, index]);

  return (
    <li ref={ref} className={className}>
      {children}
    </li>
  );
}
