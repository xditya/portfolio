"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import InkLayer from "@/components/ink/InkLayer";
import { event as trackEvent } from "@/lib/gtag";
import { profile } from "@/content";
import { setFillOrigin } from "@/lib/fillOrigin";
import s from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

// --w must be set on the h1 itself: the CSS rule reads it there, and custom
// properties only flow downward.
const WIDTH_REST = 78;
const WIDTH_WIDE = 100;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // The server renders the resting state so the page reads without JS. A
  // layout effect so the swap to the intro state happens before first paint.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const name = nameRef.current;
    const dot = dotRef.current;
    const about = aboutRef.current;
    const actions = actionsRef.current;
    if (!section || !heading || !name || !dot || !about || !actions) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bits = [...Array.from(about.children), ...Array.from(actions.querySelectorAll("a"))];
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
          <div ref={aboutRef} className={s.about}>
            <p className={s.tagline}>
              {profile.tagline.lead} <b>{profile.tagline.emphasis}</b>{" "}
              {profile.tagline.trail}
            </p>
            <p className={s.place}>{profile.location}</p>
          </div>

          <div ref={actionsRef} className={s.actions}>
            <div className={s.ctas}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
