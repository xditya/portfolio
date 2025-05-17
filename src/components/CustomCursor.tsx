"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    const trails = trailRefs.current;

    if (!cursor || isMobile) return;

    // Set initial position and hide cursor
    gsap.set([cursor, ...trails], {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      scale: 0,
    });

    let mouseX = 0;
    let mouseY = 0;
    let isFirstMove = true;

    // Mouse move animation with magnetic effect
    const moveElements = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check if cursor is outside window
      if (
        mouseX < 0 ||
        mouseX > window.innerWidth ||
        mouseY < 0 ||
        mouseY > window.innerHeight
      ) {
        gsap.to([cursor, ...trails], {
          scale: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
        return;
      }

      // Show cursor on first move
      if (isFirstMove) {
        gsap.to([cursor, ...trails], {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
        isFirstMove = false;
      }

      // Magnetic effect for interactive elements
      const interactiveElement = document.elementFromPoint(
        e.clientX,
        e.clientY
      );
      if (interactiveElement?.matches('a, button, [role="button"]')) {
        const rect = interactiveElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Apply magnetic effect
        if (distance < 100) {
          const angle = Math.atan2(deltaY, deltaX);
          mouseX = centerX + Math.cos(angle) * distance * 0.3;
          mouseY = centerY + Math.sin(angle) * distance * 0.3;
        }
      }

      // Smooth cursor movement
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power2.out",
      });

      // Trail effect
      trails.forEach((trail, index) => {
        if (!trail) return;

        const delay = index * 0.01;
        gsap.to(trail, {
          x: mouseX,
          y: mouseY,
          duration: 0.2,
          delay,
          ease: "power2.out",
        });
      });
    };

    // Add hover effect for interactive elements
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;

      // Check if the element is a social icon
      if (target.closest(".social-icon")) {
        gsap.to([cursor, ...trails], {
          scale: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
        return;
      }

      gsap.to(cursor, {
        scale: 2,
        backgroundColor: "var(--secondary)",
        opacity: 0.5,
        duration: 0.3,
        ease: "power2.out",
      });
      trails.forEach((trail, index) => {
        if (!trail) return;
        gsap.to(trail, {
          scale: 2 - index * 0.3,
          backgroundColor: "var(--secondary)",
          opacity: 0.3 - index * 0.1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;

      // Check if the element is a social icon
      if (target.closest(".social-icon")) {
        gsap.to([cursor, ...trails], {
          scale: 1,
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        });
        return;
      }

      gsap.to(cursor, {
        scale: 1,
        backgroundColor: "var(--primary)",
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      trails.forEach((trail) => {
        if (!trail) return;
        gsap.to(trail, {
          scale: 1,
          backgroundColor: "var(--primary)",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    };

    // Add event listeners
    window.addEventListener("mousemove", moveElements);

    // Add hover effect to all interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, [role='button']"
    );
    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    // Hide cursor when leaving window
    const handleMouseLeaveWindow = () => {
      gsap.to([cursor, ...trails], {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseEnterWindow = () => {
      gsap.to([cursor, ...trails], {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    return () => {
      window.removeEventListener("mousemove", moveElements);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
      window.removeEventListener("resize", checkMobile);

      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isMobile]);

  // Conditionally apply a class to hide cursor on mobile
  const cursorClass = `fixed w-4 h-4 bg-[var(--primary)] rounded-full pointer-events-none z-[9999] ${
    isMobile ? "hidden" : ""
  }`;

  const trailClass = `fixed w-2 h-2 bg-[var(--primary)] rounded-full pointer-events-none z-[9998] ${
    isMobile ? "hidden" : ""
  }`;

  // Don't render cursor on mobile
  if (isMobile) return null;

  return (
    <>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          ref={(el) => {
            trailRefs.current[index] = el;
          }}
          className={trailClass}
          style={{
            opacity: 1 - index * 0.25,
            transform: `scale(${1 - index * 0.15})`,
          }}
        />
      ))}
      <div ref={cursorRef} className={cursorClass} />
    </>
  );
};

export default CustomCursor;
