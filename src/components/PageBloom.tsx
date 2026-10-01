"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

// --tx / --ty are viewport pixels but clip-path resolves against this
// wrapper's page box, so the origin is converted here before first paint.
export default function PageBloom({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const place = () => {
      const root = document.documentElement.style;
      const tx = parseFloat(root.getPropertyValue("--tx"));
      const ty = parseFloat(root.getPropertyValue("--ty"));
      const width = window.innerWidth;
      const height = window.innerHeight;

      // No recorded click: match the stylesheet's default origin.
      const x = Number.isFinite(tx) ? tx : width / 2;
      const y = Number.isFinite(ty) ? ty : height * 0.2;

      const dx = Math.max(x, width - x);
      const dy = Math.max(y, height - y);
      const radius = Math.ceil(Math.hypot(dx, dy) * 1.02 + 2);

      const box = el.getBoundingClientRect();
      el.style.setProperty("--bx", `${Math.round(x - box.left)}px`);
      el.style.setProperty("--by", `${Math.round(y - box.top)}px`);
      el.style.setProperty("--br", `${radius}px`);
    };

    // Run again in the next frame (still before first paint): Next scrolls a
    // pushed route to the top after this effect.
    place();
    const frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
