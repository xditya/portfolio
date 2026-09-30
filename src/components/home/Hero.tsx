"use client";

import { useLayoutEffect, useRef, type PointerEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import InkLayer from "@/components/ink/InkLayer";
import { event as trackEvent } from "@/lib/gtag";
import { profile } from "@/content";
import s from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

/**
 * Sets `--o`, the side a button's fill grows from, to the half the pointer
 * entered (or left) through. Wired to pointerenter and pointerleave so the
 * fill retracts toward the exit side too.
 */
export function setFillOrigin(e: PointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty(
    "--o",
    e.clientX - rect.left < rect.width / 2 ? "left" : "right",
  );
}

// Width axis of the name: condensed at rest, wide once the hero has
// scrolled out. Hero.module.css reads it as --w on the h1 (.hero .name), so
// the value has to be set on the h1 itself: custom properties only flow
// downward, and a value on the inner span would never reach that rule.
const WIDTH_REST = 78;
const WIDTH_WIDE = 100;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);

  // The server renders the resting state ("Aditya.", tagline and buttons
  // visible) so the page reads correctly without JS and under reduced
  // motion. With motion allowed, the name starts as the handle and
  // scrambles into place, then the tagline and buttons fade up. A layout
  // effect so the swap happens before the first client paint.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const name = nameRef.current;
    const dot = dotRef.current;
    const tagline = taglineRef.current;
    const ctas = ctasRef.current;
    if (!section || !heading || !name || !dot || !tagline || !ctas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bits = [tagline, ...Array.from(ctas.children)];
    const width = { w: WIDTH_REST };

    const ctx = gsap.context(() => {
      name.textContent = profile.handle;
      dot.textContent = "?";
      gsap.set(bits, { opacity: 0, y: 24 });

      gsap
        .timeline({ delay: 0.15 })
        .to(name, {
          duration: 1,
          scrambleText: {
            text: profile.name,
            chars: "abcdefghijklmnopqrstuvwxyz",
            speed: 0.4,
            revealDelay: 0.1,
          },
          ease: "none",
        })
        .to(
          dot,
          {
            duration: 0.4,
            scrambleText: { text: ".", chars: "!@#$%", speed: 0.6 },
            ease: "none",
          },
          "-=0.3",
        )
        .to(
          bits,
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
          "-=0.2",
        );

      // The name breathes from condensed to wide across the first screen
      // of scroll.
      gsap.to(width, {
        w: WIDTH_WIDE,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        onUpdate: () => {
          heading.style.setProperty("--w", width.w.toFixed(2));
        },
      });
    }, section);

    return () => {
      ctx.revert();
      name.textContent = profile.name;
      dot.textContent = ".";
      heading.style.removeProperty("--w");
    };
  }, []);

  return (
    <section ref={sectionRef} className={s.hero}>
      <InkLayer />
      <div className={s.vignette} aria-hidden="true" />

      <div className={`container-x ${s.inner}`}>
        <div className={s.meta}>
          <Link
            href="/contact"
            className={s.status}
            onClick={() =>
              trackEvent("cta_click", {
                cta_label: "Available for Work",
                link_url: "/contact",
                source: "home_hero_status",
              })
            }
          >
            <span className={s.ok} aria-hidden="true" />
            {profile.available}
          </Link>
          <span className={s.place}>{profile.basedIn}</span>
        </div>

        <h1
          ref={headingRef}
          className={`display-hero ${s.name}`}
          aria-label={`${profile.name}.`}
        >
          <span ref={nameRef}>{profile.name}</span>
          <span ref={dotRef} className={s.dot}>
            .
          </span>
        </h1>

        <div className={s.row}>
          <p ref={taglineRef} className={s.tagline}>
            {profile.tagline.lead} <b>{profile.tagline.emphasis}</b>{" "}
            {profile.tagline.trail}
          </p>

          <div ref={ctasRef} className={s.ctas}>
            <Link
              href="/projects"
              className="btn-fill"
              onPointerEnter={setFillOrigin}
              onPointerLeave={setFillOrigin}
              onClick={() =>
                trackEvent("cta_click", {
                  cta_label: "View Projects",
                  link_url: "/projects",
                  source: "home_hero",
                })
              }
            >
              View projects
            </Link>
            <Link
              href="/contact"
              className="btn-line"
              onPointerEnter={setFillOrigin}
              onPointerLeave={setFillOrigin}
              onClick={() =>
                trackEvent("cta_click", {
                  cta_label: "Get In Touch",
                  link_url: "/contact",
                  source: "home_hero",
                })
              }
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
