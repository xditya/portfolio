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

// Phone tilt. A screenshot leans with the phone, up to TILT_MAX degrees at
// TILT_RANGE degrees of tilt. The rest position follows the reading slowly
// (TILT_SETTLE per event), so the card lies flat however the phone is
// held once it stops moving, and there is nothing to calibrate.
const TILT_MAX = 9;
const TILT_RANGE = 30;
const TILT_SETTLE = 0.004;

type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/** Leans every screenshot frame in `stack` with the phone. Returns the teardown. */
function attachTilt(stack: HTMLElement) {
  let restBeta: number | null = null;
  let restGamma: number | null = null;
  let frame = 0;
  let x = 0;
  let y = 0;

  const clamp = (v: number) =>
    (Math.max(-TILT_RANGE, Math.min(TILT_RANGE, v)) / TILT_RANGE) * TILT_MAX;

  const write = () => {
    frame = 0;
    stack.style.setProperty("--tilt-x", `${x.toFixed(2)}deg`);
    stack.style.setProperty("--tilt-y", `${y.toFixed(2)}deg`);
  };

  const onOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    // Read against the screen's rotation, so landscape leans the same way.
    const turn = screen.orientation?.angle ?? 0;
    const [beta, gamma] =
      turn === 90
        ? [-e.gamma, e.beta]
        : turn === 270
          ? [e.gamma, -e.beta]
          : turn === 180
            ? [-e.beta, -e.gamma]
            : [e.beta, e.gamma];
    restBeta =
      restBeta == null ? beta : restBeta + (beta - restBeta) * TILT_SETTLE;
    restGamma =
      restGamma == null ? gamma : restGamma + (gamma - restGamma) * TILT_SETTLE;
    // Tipping the top away leans the card back; tipping right leans it right.
    x = clamp(restBeta - beta);
    y = clamp(gamma - restGamma);
    if (!frame) frame = requestAnimationFrame(write);
  };

  const listen = () =>
    window.addEventListener("deviceorientation", onOrientation);

  // iOS only hands out orientation after a permission request made inside a
  // user gesture; the first touch on the strip is that gesture. Elsewhere the
  // events flow without asking.
  const Orientation = DeviceOrientationEvent as OrientationWithPermission;
  // Asked on every touch until granted: a dismissed sheet or a touch that
  // Safari did not count as a gesture gets another chance.
  const ask = () => {
    Orientation.requestPermission?.()
      .then((state) => {
        if (state !== "granted") return;
        stack.removeEventListener("touchend", ask);
        listen();
      })
      .catch(() => {});
  };
  if (Orientation.requestPermission) {
    stack.addEventListener("touchend", ask, { passive: true });
  } else {
    listen();
  }

  return () => {
    stack.removeEventListener("touchend", ask);
    window.removeEventListener("deviceorientation", onOrientation);
    if (frame) cancelAnimationFrame(frame);
    stack.style.removeProperty("--tilt-x");
    stack.style.removeProperty("--tilt-y");
  };
}

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

    const mm = gsap.matchMedia();

    if (typeof DeviceOrientationEvent !== "undefined") {
      mm.add({ phone: PHONE_QUERY, motion: MOTION_QUERY }, (context) => {
        const conditions: Record<string, boolean> = context.conditions ?? {};
        if (!conditions.phone || !conditions.motion) return;
        return attachTilt(stack);
      });
    }

    // ScrollTrigger reverts its own pins before it measures, but it knows
    // nothing about position: sticky. A panel that is stuck while a
    // refresh runs (a screenshot finishing further down, a resize) would
    // report the viewport top as its place in the flow, so the panels sit
    // in the flow for the length of every measurement (see the module).
    const measureStart = () => stack.setAttribute("data-measuring", "");
    const measureEnd = () => stack.removeAttribute("data-measuring");

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
