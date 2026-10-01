"use client";

import { motion } from "motion/react";
import { markerTransition } from "./shared";
import s from "./Marker.module.css";

type Props = {
  /** One id per navigation surface, so the pill and the dock never share a marker. */
  id: string;
  reduce: boolean;
};

export default function Marker({ id, reduce }: Props) {
  return (
    <motion.span
      layoutId={id}
      className={s.marker}
      style={{ borderRadius: 999 }}
      transition={markerTransition(reduce)}
      aria-hidden="true"
    />
  );
}
