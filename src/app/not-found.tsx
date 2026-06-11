"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

export default function NotFound() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.to(titleRef.current, {
      duration: 1.2,
      scrambleText: {
        text: "404",
        chars: "0123456789#?",
        speed: 0.4,
      },
      ease: "none",
    });
  }, []);

  return (
    <main
      className="container-x"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "110px",
        paddingBottom: "80px",
      }}
    >
      <p className="mono-label" style={{ marginBottom: "24px" }}>
        Error — Page not found
      </p>
      <h1
        ref={titleRef}
        className="display-hero"
        style={{ marginBottom: "32px" }}
      >
        4<span style={{ color: "var(--accent)" }}>0</span>4
      </h1>
      <p className="body-lg" style={{ maxWidth: "440px", marginTop: 0, marginBottom: "12px", color: "var(--ink)" }}>
        Lost among the stars?
      </p>
      <p className="body-lg" style={{ maxWidth: "440px", marginTop: 0, marginBottom: "40px" }}>
        The page you&apos;re looking for seems to have drifted into a black
        hole. Let&apos;s get you back to solid ground.
      </p>
      <button
        onClick={() => router.push("/")}
        className="btn-fill"
        style={{ width: "fit-content" }}
      >
        ← Return to Base
      </button>
    </main>
  );
}
