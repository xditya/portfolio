"use client";

import { useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FeaturedProject } from "@/content";
import InkReveal from "./InkReveal";
import s from "./FeaturedStack.module.css";

gsap.registerPlugin(ScrollTrigger);

const PHONE_QUERY = "(max-width: 760px)";
const DESKTOP_QUERY = "(min-width: 761px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

// How far a pinned panel recedes while the next one slides over it.
const RECEDE_SCALE = 0.92;
const RECEDE_OPACITY = 0.55;

// The phone strip is a carousel; the desktop stack is not. The roles
// follow the breakpoint through a store, so nothing sets state in an
// effect. The server renders the desktop markup.
function subscribeToPhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isPhoneNow = () => window.matchMedia(PHONE_QUERY).matches;
const isPhoneOnServer = () => false;

// Five screenshots finishing one after another would refresh five times.
// One refresh on the next frame covers them all.
let refreshQueued = false;
function refreshOnLoad() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

/**
 * The five featured projects. Desktop: full-viewport panels, each sticky
 * at the top and pinned by ScrollTrigger, so the next one slides over the
 * last while it scales back and dims. Phones: a scroll-snap strip with the
 * screenshot on top. Reduced motion on desktop: a plain vertical list.
 */
export default function FeaturedStack({
  projects,
}: {
  projects: FeaturedProject[];
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const isPhone = useSyncExternalStore(
    subscribeToPhone,
    isPhoneNow,
    isPhoneOnServer,
  );
  const headingId = `featured-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const panels = Array.from(
      stack.querySelectorAll<HTMLElement>("[data-panel]"),
    );
    if (panels.length < 2) return;

    // ScrollTrigger reverts its own pins before it measures, but it knows
    // nothing about position: sticky. A panel that is stuck while a
    // refresh runs (a screenshot finishing further down, a resize) would
    // report the viewport top as its place in the flow, so the panels sit
    // in the flow for the length of every measurement (see the module).
    const measureStart = () => stack.setAttribute("data-measuring", "");
    const measureEnd = () => stack.removeAttribute("data-measuring");

    const mm = gsap.matchMedia();
    mm.add({ desktop: DESKTOP_QUERY, motion: MOTION_QUERY }, (context) => {
      const conditions: Record<string, boolean> = context.conditions ?? {};
      if (!conditions.desktop || !conditions.motion) return;

      ScrollTrigger.addEventListener("refreshInit", measureStart);
      ScrollTrigger.addEventListener("refresh", measureEnd);

      const last = panels[panels.length - 1];
      measureStart();
      panels.forEach((panel, i) => {
        if (panel === last) return;

        // Held at the top until the last panel arrives there. No spacing:
        // the panels keep their own height in the flow, so the section
        // stays exactly five viewports tall.
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          endTrigger: last,
          end: "top top",
          pin: true,
          pinSpacing: false,
        });

        // The next panel drives the recede as it crosses the viewport.
        const inner = panel.querySelector<HTMLElement>("[data-inner]") ?? panel;
        gsap.fromTo(
          inner,
          { scale: 1, opacity: 1 },
          {
            scale: RECEDE_SCALE,
            opacity: RECEDE_OPACITY,
            ease: "none",
            scrollTrigger: {
              trigger: panels[i + 1],
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      });
      measureEnd();

      // Re-measure everything (the reveals inside the panels included) now
      // that the guard is in place; the page may have loaded mid-stack.
      ScrollTrigger.refresh();

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", measureStart);
        ScrollTrigger.removeEventListener("refresh", measureEnd);
        measureEnd();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section className={s.section} aria-labelledby={headingId}>
      <div className="container-x">
        <h2 id={headingId} className={`display-md ${s.heading}`}>
          Featured
        </h2>
      </div>

      <div
        ref={stackRef}
        className={s.stack}
        role={isPhone ? "region" : undefined}
        aria-roledescription={isPhone ? "carousel" : undefined}
        aria-label={isPhone ? "Featured projects" : undefined}
      >
        {projects.map((p, i) => {
          const nameId = `${headingId}-${i}`;
          return (
            <article
              key={p.name}
              className={s.panel}
              aria-labelledby={nameId}
              data-panel=""
            >
              <div className={s.inner} data-inner="">
                <div className={`container-x ${s.grid}`}>
                  <div className={s.copy}>
                    <p className={s.meta}>{`${p.year} · ${p.highlight}`}</p>
                    <h3 id={nameId} className={`display-md ${s.name}`}>
                      {p.shortName ?? p.name}
                    </h3>
                    <p className={s.tagline}>{p.tagline}</p>
                    <p className={`body-lg ${s.summary}`}>
                      {p.summary ?? p.description}
                    </p>
                    <ul className={s.tech} aria-label="Built with">
                      {(p.featuredTech ?? p.tech).map((t) => (
                        <li key={t} className={`chip ${s.chip}`}>
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className={s.links}>
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`link-u ${s.link}`}
                      >
                        GitHub{" "}
                        <span className={s.arrow} aria-hidden="true">
                          ↗
                        </span>
                      </a>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`link-u ${s.link} ${s.live}`}
                        >
                          Live{" "}
                          <span className={s.arrow} aria-hidden="true">
                            ↗
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  {p.image && (
                    <InkReveal className={s.shot} seed={i * 7 + 3}>
                      <div className={s.frame}>
                        <Image
                          src={p.image}
                          alt={`${p.name} screenshot`}
                          fill
                          sizes="(max-width: 760px) 86vw, 50vw"
                          className={s.img}
                          onLoad={refreshOnLoad}
                        />
                      </div>
                    </InkReveal>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
