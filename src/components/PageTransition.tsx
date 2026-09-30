"use client";

import { useEffect } from "react";

// Records where the pointer last went down so the next route can bloom
// from that point (see template.module.css). The values live on <html>
// as --tx / --ty (the origin) and --tr (the radius that just covers the
// viewport from there). A key press clears them, so keyboard navigation
// blooms from the stylesheet's default origin instead of a stale click.
export default function PageTransition() {
  useEffect(() => {
    const root = document.documentElement.style;

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      const x = e.clientX;
      const y = e.clientY;
      const dx = Math.max(x, window.innerWidth - x);
      const dy = Math.max(y, window.innerHeight - y);
      const radius = Math.ceil(Math.hypot(dx, dy) * 1.02 + 2);
      root.setProperty("--tx", `${Math.round(x)}px`);
      root.setProperty("--ty", `${Math.round(y)}px`);
      root.setProperty("--tr", `${radius}px`);
    };

    const onKeyDown = () => {
      root.removeProperty("--tx");
      root.removeProperty("--ty");
      root.removeProperty("--tr");
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
