"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import dynamic from "next/dynamic";
import { setFillOrigin } from "@/lib/fillOrigin";

gsap.registerPlugin(ScrambleTextPlugin);

// Loaded lazily: the not-found page sits in every route's tree, and a static
// import made every page preload the ink stylesheet without using it.
const InkLayer = dynamic(() => import("@/components/ink/InkLayer"), { ssr: false });

const DRIP = { x: 0.68, y: 0.3 };

export default function NotFoundStage() {
  const stageRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Layout effect so the first paint shows the scramble, not the resting digits.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const title = titleRef.current;
    if (!stage || !title) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(title, {
        duration: 1.2,
        scrambleText: {
          text: "404",
          chars: "0123456789#?",
          speed: 0.4,
          revealDelay: 0.1,
        },
        ease: "none",
      });
    }, stage);

    return () => {
      ctx.revert();
      title.textContent = "404";
    };
  }, []);

  // Not <main>: the layout already provides one.
  return (
    <section ref={stageRef} className="nf-stage">
      <InkLayer intensity={0.55} idle opening={DRIP} />
      <div className="nf-ground" aria-hidden="true" />

      <div className="container-x nf-inner">
        <header className="nf-head">
          <h1 ref={titleRef} className="display-lg">
            404
          </h1>
          <p className="body-lg nf-lede">Page not found</p>
        </header>

        <div className="nf-text">
          <p className="body-lg nf-ask">Lost among the stars?</p>
          <p className="body-lg nf-line">
            The page you&apos;re looking for seems to have drifted into a black
            hole. Let&apos;s get you back to solid ground.
          </p>
          <Link
            href="/"
            className="btn-line nf-back"
            onPointerEnter={setFillOrigin}
            onPointerLeave={setFillOrigin}
          >
            ← Return to Base
          </Link>
        </div>
      </div>
    </section>
  );
}
