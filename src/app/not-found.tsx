"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import InkLayer from "@/components/ink/InkLayer";
import { setFillOrigin } from "@/components/home/Hero";
import s from "./not-found.module.css";

gsap.registerPlugin(ScrambleTextPlugin);

// One drop, up and to the right of the type, that spreads slowly on its own.
const DRIP = { x: 0.68, y: 0.3 };

export default function NotFound() {
  const stageRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // The server renders "404" at rest, which is also what reduced motion
  // gets. With motion allowed the digits scramble into place the way the
  // home name does. A layout effect so the first client paint already shows
  // the scramble's first frame rather than the resting digits.
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

  // A section, not a main: the layout already wraps every page in <main>.
  return (
    <section ref={stageRef} className={s.stage}>
      <InkLayer intensity={0.55} idle opening={DRIP} />
      <div className={s.ground} aria-hidden="true" />

      <div className={`container-x ${s.inner}`}>
        <header className={s.head}>
          <h1 ref={titleRef} className="display-lg">
            404
          </h1>
          <p className={`body-lg ${s.lede}`}>Page not found</p>
        </header>

        <div className={s.text}>
          <p className={`body-lg ${s.ask}`}>Lost among the stars?</p>
          <p className={`body-lg ${s.line}`}>
            The page you&apos;re looking for seems to have drifted into a black
            hole. Let&apos;s get you back to solid ground.
          </p>
          <Link
            href="/"
            className={`btn-line ${s.back}`}
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
