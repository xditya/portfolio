"use client";

import { useEffect } from "react";

// A key press clears the origin so keyboard navigation does not bloom from a stale click.
export default function PageTransition() {
  useEffect(() => {
    const root = document.documentElement.style;

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      root.setProperty("--tx", `${Math.round(e.clientX)}px`);
      root.setProperty("--ty", `${Math.round(e.clientY)}px`);
    };

    const onKeyDown = () => {
      root.removeProperty("--tx");
      root.removeProperty("--ty");
    };

    const options: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener("pointerdown", onPointerDown, options);
    window.addEventListener("keydown", onKeyDown, options);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, options);
      window.removeEventListener("keydown", onKeyDown, options);
    };
  }, []);

  return null;
}
