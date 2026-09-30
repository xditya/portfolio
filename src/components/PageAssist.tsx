"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

/**
 * Reading aids: a 2px scroll progress bar and a back-to-top button.
 * Skipped on /game (fixed-viewport page).
 */
export default function PageAssist() {
  const pathname = usePathname();
  if (pathname === "/game") return null;
  return <ReadingAids />;
}

// Motion's useScroll owns the window scroll subscription. The bar reads
// scrollYProgress straight into its transform (no React render per frame);
// the button only re-renders when the scroll crosses 600px or reaches the
// last 120px of the page, where it would sit on the footer's bottom row.
function ReadingAids() {
  const { scrollY, scrollYProgress } = useScroll();
  const [showTop, setShowTop] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const p = scrollYProgress.get();
    const left = p > 0 ? (y * (1 - p)) / p : Infinity;
    setShowTop(y > 600 && left > 120);
  });

  return (
    <>
      <motion.div
        className="scroll-progress"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      <button
        className="to-top"
        data-show={showTop}
        aria-label="Back to top"
        // Invisible until the page is scrolled, so it must not take focus.
        inert={!showTop}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          })
        }
      >
        ↑
      </button>
    </>
  );
}
