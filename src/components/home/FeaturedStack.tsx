"use client";

import { useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FeaturedProject } from "@/content";
import { event as trackEvent } from "@/lib/gtag";
import InkReveal from "./InkReveal";
import s from "./FeaturedStack.module.css";

gsap.registerPlugin(ScrollTrigger);

const PHONE_QUERY = "(max-width: 760px)";
const DESKTOP_QUERY = "(min-width: 761px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

const RECEDE_SCALE = 0.92;
const RECEDE_OPACITY = 0.55;

// Degrees: up to TILT_MAX of lean at TILT_RANGE of phone tilt. The rest
// position drifts toward the reading (TILT_SETTLE per event), so the card
// lies flat however the phone is held and nothing needs calibrating.
const TILT_MAX = 16;
const TILT_RANGE = 20;
const TILT_SETTLE = 0.004;

type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

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

  // iOS only grants orientation from a permission request inside a user
  // gesture. Asked on every touch until granted, since Safari may not count
  // a touch as a gesture.
  const Orientation = DeviceOrientationEvent as OrientationWithPermission;
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

// Carousel roles follow the breakpoint through a store, so nothing sets
// state in an effect.
function subscribeToPhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isPhoneNow = () => window.matchMedia(PHONE_QUERY).matches;
const isPhoneOnServer = () => false;

// Batches screenshot loads into one ScrollTrigger refresh per frame.
let refreshQueued = false;
function refreshOnLoad() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

function Head({ id, count }: { id: string; count: number }) {
  return (
    <div className={`container-x ${s.head}`}>
      <h2 id={id} className={`display-md ${s.heading}`}>
        Featured
      </h2>
      <Link
        href="/projects"
        className={`link-u ${s.link}`}
        onClick={() =>
          trackEvent("cta_click", {
            cta_label: "All Projects",
            link_url: "/projects",
            source: "home_featured",
          })
        }
      >
        {`All ${count} projects`}{" "}
        <span className={s.arrow} aria-hidden="true">
          ↗
        </span>
      </Link>
    </div>
  );
}

export default function FeaturedStack({
  projects,
  count,
}: {
  projects: FeaturedProject[];
  /** Total projects in the index. */
  count: number;
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

    // ScrollTrigger knows nothing about position: sticky, so a stuck panel
    // would measure at the viewport top; panels drop sticky while measuring.
    // A refresh also rewraps the pins, dropping focus to the body and
    // cancelling focus scrolls, so focus is held and restored across it.
    let held: HTMLElement | null = null;
    const measureStart = () => {
      stack.setAttribute("data-measuring", "");
      const a = document.activeElement;
      if (a instanceof HTMLElement && stack.contains(a)) held = a;
    };
    const measureEnd = () => {
      stack.removeAttribute("data-measuring");
      if (held && held.isConnected && document.activeElement !== held) {
        held.focus({ preventScroll: true });
      }
      held = null;
      const a = document.activeElement;
      // Only for keyboard focus: a link left focused by a click must not
      // pull the page back after a later refresh.
      if (a instanceof HTMLElement && stack.contains(a) && a.matches(":focus-visible")) {
        const r = a.getBoundingClientRect();
        if (r.top < 88 || r.bottom > window.innerHeight - 16) {
          a.scrollIntoView({ block: "nearest" });
        }
      }
    };

    mm.add({ desktop: DESKTOP_QUERY, motion: MOTION_QUERY }, (context) => {
      const conditions: Record<string, boolean> = context.conditions ?? {};
      if (!conditions.desktop || !conditions.motion) return;

      ScrollTrigger.addEventListener("refreshInit", measureStart);
      ScrollTrigger.addEventListener("refresh", measureEnd);

      const last = panels[panels.length - 1];
      const pins = new Map<HTMLElement, ScrollTrigger>();
      measureStart();
      panels.forEach((panel, i) => {
        if (panel === last) return;

        // No pin spacing: panels keep their own height in the flow.
        const pin = ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          endTrigger: last,
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        pins.set(panel, pin);

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

      // Re-measure now that the guard is in place; the page may have loaded mid-stack.
      ScrollTrigger.refresh();

      // The browser will not scroll to a control already in the viewport, so
      // Shift+Tab could leave focus under the panel above. Keyboard focus
      // scrolls back to the focused panel's start.
      const onFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (!target.matches(":focus-visible")) return;
        const panel = target.closest<HTMLElement>("[data-panel]");
        const pin = panel && pins.get(panel);
        if (pin && window.scrollY > pin.start + 1) {
          window.scrollTo({ top: pin.start, behavior: "instant" });
        }
      };
      stack.addEventListener("focusin", onFocusIn);

      return () => {
        stack.removeEventListener("focusin", onFocusIn);
        ScrollTrigger.removeEventListener("refreshInit", measureStart);
        ScrollTrigger.removeEventListener("refresh", measureEnd);
        measureEnd();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section className={s.section} aria-labelledby={headingId}>
      {/* Outside the pinned panels so it scrolls away with the page. */}
      <Head id={headingId} count={count} />

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
              role={isPhone ? "group" : undefined}
              aria-roledescription={isPhone ? "slide" : undefined}
              aria-labelledby={isPhone ? `${nameId} ${nameId}-pos` : nameId}
              data-panel=""
              data-first={i === 0 ? "" : undefined}
            >
              <div className={s.inner} data-inner="">
                <div className={`container-x ${s.grid}`}>
                  <div className={s.copy}>
                    <p className={s.meta}>{`${p.year} · ${p.highlight}`}</p>
                    <h3 id={nameId} className={`display-md ${s.name}`}>
                      {p.shortName ?? p.name}
                    </h3>
                    {isPhone && (
                      <span id={`${nameId}-pos`} className="sr-only">
                        {` ${i + 1} of ${projects.length}`}
                      </span>
                    )}
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
