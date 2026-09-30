"use client";

import { motion } from "motion/react";
import { markerTransition } from "./shared";

type Props = {
  /** One id per navigation surface, so the pill and the dock never share a marker. */
  id: string;
  className: string;
  reduce: boolean;
};

// The tint behind the active (or hovered) item. It renders inside whichever
// item currently owns it; sharing a layoutId lets Motion spring it from the
// old item to the new one instead of cutting.
export default function Marker({ id, className, reduce }: Props) {
  return (
    <motion.span
      layoutId={id}
      className={className}
      style={{ borderRadius: 999 }}
      transition={markerTransition(reduce)}
      aria-hidden="true"
    />
  );
}
