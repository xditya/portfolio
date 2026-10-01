"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { event as trackEvent } from "@/lib/gtag";
import { profile, siteStats, type GithubStats } from "@/content";
import Stats from "./Stats";
import s from "./Statement.module.css";

gsap.registerPlugin(ScrollTrigger);

// Where a word starts before the scroll scrub brings it to full opacity.
const WORD_DIM = 0.2;

/**
 * The statement, revealed word by word as it scrolls in, the link to
 * /about, and the four odometers. The server sends the words at full
 * opacity; GSAP dims them on mount, so the paragraph reads without JS
 * and under reduced motion.
 */
export default function Statement({ github }: { github: GithubStats }) {
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        Array.from(text.children),
        { opacity: WORD_DIM },
        {
          opacity: 1,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: text,
            start: "top 78%",
            end: "top 30%",
            scrub: 0.4,
          },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section className={`container-x ${s.section}`}>
      <p ref={textRef} className={`statement ${s.text}`}>
        {profile.statement.split(" ").map((word, i) => (
          <span key={i} className={`w-rv ${s.word}`}>
            {word}&nbsp;
          </span>
        ))}
      </p>

      <p className={s.moreRow}>
        <Link
          href="/about"
          className={s.more}
          onClick={() =>
            trackEvent("cta_click", {
              cta_label: "About Me",
              link_url: "/about",
              source: "home_statement",
            })
          }
        >
          More about me
          <span className={s.arrow} aria-hidden="true">
            ↗
          </span>
        </Link>
      </p>

      <Stats stats={siteStats(github)} />
    </section>
  );
}
