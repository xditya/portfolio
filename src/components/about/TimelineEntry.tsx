"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { motion } from "motion/react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const motionAllowed = () => !window.matchMedia(REDUCED).matches;
const onServer = () => false;

/**
 * One row of the experience list. The server sends a plain, visible <li>,
 * and reduced motion keeps it. With motion allowed the row is swapped after
 * hydration for one that fades up the first time it scrolls into view; rows
 * that arrive together follow each other by their place in the list.
 */
export default function TimelineEntry({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const animated = useSyncExternalStore(subscribe, motionAllowed, onServer);

  if (!animated) return <li className={className}>{children}</li>;

  return (
    <motion.li
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        type: "spring",
        duration: 0.6,
        bounce: 0,
        delay: index * 0.05,
      }}
    >
      {children}
    </motion.li>
  );
}
