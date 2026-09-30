"use client";

import { useEffect } from "react";

// Records where the pointer last went down so the next route can bloom
// from that point. The values live on <html> as --tx / --ty in viewport
// pixels; PageBloom turns them into page coordinates on the wrapper it
// mounts around each page (see template.tsx). A key press clears them, so
// keyboard navigation blooms from the default origin instead of a stale
// click.
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
