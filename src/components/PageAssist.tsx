"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Reading aids: a 2px scroll progress bar and a back-to-top button.
 * Skipped on /game (fixed-viewport page).
 */
export default function PageAssist() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  const onGame = pathname === "/game";

  useEffect(() => {
    if (onGame) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setShowTop(window.scrollY > 600);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onGame, pathname]);

  if (onGame) return null;

  return (
    <>
      <div ref={barRef} className="scroll-progress" aria-hidden="true" />
      <button
        className="to-top"
        data-show={showTop}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </>
  );
}
