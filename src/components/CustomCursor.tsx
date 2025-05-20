"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(
        window.matchMedia("(max-width: 768px)").matches ||
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0
      );
    };

    // Initial check
    checkMobile();

    // Listen for window resize
    window.addEventListener("resize", checkMobile);

    const cursor = cursorRef.current;

    if (!cursor || isMobile) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power1.out",
      });
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, {
        scale: 1.5, // Slightly less enlargement
        backgroundColor: "var(--accent)", // Change color
        duration: 0.3,
        ease: "power2.out",
        mixBlendMode: "normal", // Ensure solid color on hover
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, {
        scale: 1, // Revert size
        backgroundColor: "var(--primary)", // Revert color
        duration: 0.3,
        ease: "power2.out",
        mixBlendMode: "difference", // Revert blend mode
      });
    };

    window.addEventListener("mousemove", moveCursor);

    // Add event listeners for interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, [role='button']"
    );

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("resize", checkMobile);
      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isMobile]);

  // Don't render cursor on mobile
  if (isMobile) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed w-6 h-6 bg-[var(--primary)] rounded-full pointer-events-none z-[9999] mix-blend-difference"
    ></div>
  );
};

export default CustomCursor;
