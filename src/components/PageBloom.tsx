"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

// The wrapper template.tsx mounts around every page. Its stylesheet reveals
// the page through a circle (the ink bloom) whose centre and radius come
// from --bx / --by / --br on this element.
//
// PageTransition stores the last pointerdown on <html> as --tx / --ty in
// viewport pixels, but clip-path resolves against this wrapper's own box,
// which starts at the top of the page. After Back or Forward the browser
// restores a scroll position, so the same viewport point sits further down
// the page and a page-box origin taken from viewport pixels landed above
// the viewport: the circle took most of its 550ms to reach anything
// visible. The origin is converted here, before the first paint of the new
// page, and the radius is measured from the current viewport so it always
// just covers it.
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

      // No recorded click (first load, keyboard navigation): the
      // stylesheet's default origin, a fifth of the way down the viewport.
      const x = Number.isFinite(tx) ? tx : width / 2;
      const y = Number.isFinite(ty) ? ty : height * 0.2;

      // The farthest viewport corner from the origin, with a little slack.
      const dx = Math.max(x, width - x);
      const dy = Math.max(y, height - y);
      const radius = Math.ceil(Math.hypot(dx, dy) * 1.02 + 2);

      // Viewport to page box. The wrapper starts at the top of the document,
      // so this is x + scrollX and y + scrollY, measured rather than assumed.
      const box = el.getBoundingClientRect();
      el.style.setProperty("--bx", `${Math.round(x - box.left)}px`);
      el.style.setProperty("--by", `${Math.round(y - box.top)}px`);
      el.style.setProperty("--br", `${radius}px`);
    };

    // Once now, with the scroll position the page mounts at (the one the
    // browser restored on Back and Forward), and once more in the frame
    // callback, which still runs before the first paint: Next scrolls a
    // pushed route to the top in its own layout-phase work, after this
    // effect, and the second pass sees that.
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
