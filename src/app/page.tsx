"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { event as trackEvent } from "@/lib/gtag";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/xditya" },
  { label: "X / Twitter", href: "https://twitter.com/xditya" },
  { label: "LinkedIn", href: "https://linkedin.com/in/xditya" },
  { label: "Telegram", href: "https://t.me/xditya" },
  { label: "YouTube", href: "https://youtube.com/@xditya" },
];

const TICKER = [
  "Python",
  "TypeScript",
  "Telegram Bots",
  "Open Source",
  "Next.js",
  "Deno",
  "Automation",
  "MongoDB",
];

const STATEMENT =
  "Full-stack developer interested in Python, TypeScript, and automation. I build Telegram bots, web apps, and open-source tools.";

const STATS = [
  { label: "Repos", value: 20, suffix: "+" },
  { label: "GitHub Stars", value: 1770, suffix: "+" },
  { label: "Followers", value: 576, suffix: "+" },
  { label: "Years Coding", value: new Date().getFullYear() - 2020, suffix: "+" },
];

const FEATURED = [
  {
    num: "01",
    name: "engram",
    tagline: "Remember everything. Own everything.",
    description:
      "A local-first library for links, reels, articles and notes. Share from any app, search the whole page, sync through your own Drive with end-to-end encryption.",
    year: 2026,
    tech: ["TypeScript", "React Native", "Expo"],
    stat: "Local-first",
    github: "https://github.com/xditya/engram",
    url: "https://engram.xditya.me",
  },
  {
    num: "02",
    name: "Ultroid",
    tagline: "Pluggable Telegram userbot",
    description:
      "A Telegram userbot you extend with plugins. 3k+ stars on GitHub.",
    year: 2021,
    tech: ["Python", "MongoDB", "Redis"],
    stat: "3K+ stars",
    github: "https://github.com/TeamUltroid/Ultroid",
    url: "https://t.me/TeamUltroid",
  },
  {
    num: "03",
    name: "ChannelActions",
    tagline: "Telegram bot to auto approve chat join requests",
    description:
      "Approves or declines join requests for Telegram chats. Serves over 1M users.",
    year: 2022,
    tech: ["Deno", "TypeScript", "MongoDB"],
    stat: "1M+ users",
    github: "https://github.com/xditya/ChannelActionsBot",
    url: "https://channelactions.xditya.me",
  },
  {
    num: "04",
    name: "GroupManager",
    tagline: "Python based group managing bot",
    description:
      "A Telegram bot for moderating and managing groups.",
    year: 2020,
    tech: ["Python", "MongoDB"],
    stat: "256+ stars",
    github: "https://github.com/xditya/GroupManager",
  },
];

function useCountUp(target: number, duration = 1.5, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function Stat({
  label,
  value,
  suffix,
  animate,
}: {
  label: string;
  value: number;
  suffix: string;
  animate: boolean;
}) {
  const count = useCountUp(value, 1.6, animate);
  return (
    <div style={{ padding: "28px 0", borderTop: "1px solid var(--line)" }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(40px, 6vw, 76px)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {count}
        <span style={{ color: "var(--accent)" }}>{suffix}</span>
      </div>
      <div className="mono-label" style={{ marginTop: "10px" }}>
        {label}
      </div>
    </div>
  );
}

export default function HomePage() {
  const nameRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const heroBitsRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Stats counter trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      const bits = heroBitsRef.current
        ? Array.from(heroBitsRef.current.children)
        : [];
      gsap.set(bits, { opacity: 0, y: 24 });

      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(nameRef.current, {
        duration: 1,
        scrambleText: {
          text: "Aditya",
          chars: "abcdefghijklmnopqrstuvwxyz",
          speed: 0.4,
          revealDelay: 0.1,
        },
        ease: "none",
      })
        .to(
          dotRef.current,
          {
            duration: 0.5,
            scrambleText: { text: ".", chars: "!@#$%", speed: 0.6 },
            ease: "none",
          },
          "-=0.35",
        )
        .to(
          bits,
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
          "-=0.2",
        );

      // Statement word reveal · scrubbed by scroll
      if (statementRef.current) {
        gsap.to(statementRef.current.querySelectorAll(".w-rv"), {
          opacity: 1,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: statementRef.current,
            start: "top 78%",
            end: "top 30%",
            scrub: 0.4,
          },
        });
      }

      // Feature cards drift in
      gsap.utils.toArray<HTMLElement>(".stack-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>
      {/* ═══════════ HERO ═══════════ */}
      <section
        className="container-x"
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          paddingTop: "110px",
          paddingBottom: "clamp(32px, 5vh, 56px)",
          position: "relative",
        }}
      >
        {/* Status line */}
        <Link
          href="/contact"
          onClick={() =>
            trackEvent("cta_click", {
              cta_label: "Available for Work",
              link_url: "/contact",
              source: "home_hero_status",
            })
          }
          className="mono-label"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "clamp(20px, 3vh, 36px)",
            color: "var(--ink-dim)",
            width: "fit-content",
          }}
        >
          <span
            className="pulse"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent)",
              flexShrink: 0,
            }}
          />
          Available for work · Kerala, India
        </Link>

        {/* Name */}
        <h1 className="display-hero" style={{ marginBottom: "clamp(24px, 4vh, 48px)" }}>
          <span ref={nameRef}>xditya</span>
          <span ref={dotRef} style={{ color: "var(--accent)" }}>
            ?
          </span>
        </h1>

        {/* Sub-row */}
        <div
          ref={heroBitsRef}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "28px",
            borderTop: "1px solid var(--line)",
            paddingTop: "clamp(20px, 3vh, 32px)",
          }}
        >
          <p
            className="body-lg"
            style={{ maxWidth: "440px", margin: 0 }}
          >
            Full-stack dev.{" "}
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>
              Open-source contributor.
            </span>{" "}
            Bot builder.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <Link
              href="/projects"
              className="btn-fill"
              onClick={() =>
                trackEvent("cta_click", {
                  cta_label: "View Projects",
                  link_url: "/projects",
                  source: "home_hero",
                })
              }
            >
              View Projects
            </Link>
            <Link
              href="/contact"
              className="btn-line"
              onClick={() =>
                trackEvent("cta_click", {
                  cta_label: "Get In Touch",
                  link_url: "/contact",
                  source: "home_hero",
                })
              }
            >
              Get In Touch
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "18px",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
              {SOCIAL_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-u mono-sm"
                  style={{ color: "var(--muted)" }}
                  onClick={() =>
                    trackEvent("social_click", {
                      social_platform: label,
                      link_url: href,
                      source: "home",
                    })
                  }
                >
                  {label} ↗
                </a>
              ))}
            </div>
            <span className="scroll-cue" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ═══════════ TICKER ═══════════ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div className="marquee-chunk" key={dup}>
              {TICKER.map((item) => (
                <span
                  key={item}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <span className="marquee-item">{item}</span>
                  <span className="marquee-dot" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ STATEMENT + STATS ═══════════ */}
      <section className="container-x section-pad">
        <p className="mono-label" style={{ marginBottom: "32px" }}>
          01 · About
        </p>
        <p
          ref={statementRef}
          className="statement"
          style={{ maxWidth: "1080px", margin: 0 }}
        >
          {STATEMENT.split(" ").map((word, i) => (
            <span key={i} className="w-rv">
              {word}&nbsp;
            </span>
          ))}
        </p>

        <div style={{ marginTop: "clamp(20px, 4vw, 40px)" }}>
          <Link
            href="/about"
            className="link-u mono-sm"
            style={{ color: "var(--accent-soft)" }}
            onClick={() =>
              trackEvent("cta_click", {
                cta_label: "About Me",
                link_url: "/about",
                source: "home_statement",
              })
            }
          >
            More about me ↗
          </Link>
        </div>

        <div
          ref={statsRef}
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "clamp(20px, 3vw, 48px)",
            marginTop: "clamp(56px, 8vw, 110px)",
          }}
        >
          {STATS.map((s) => (
            <Stat key={s.label} {...s} animate={statsVisible} />
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURED WORK ═══════════ */}
      <section className="container-x" style={{ paddingBottom: "clamp(40px, 6vw, 80px)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "clamp(32px, 5vw, 64px)",
          }}
        >
          <p className="mono-label" style={{ margin: 0 }}>
            02 · Selected Work
          </p>
          <h2 className="display-md">Featured</h2>
        </div>

        <div className="stack-wrap">
          {FEATURED.map((p) => (
            <article key={p.name} className="stack-card">
              <span className="stack-num" aria-hidden="true">
                {p.num}
              </span>

              <div>
                <p className="mono-label" style={{ marginBottom: "18px" }}>
                  {p.year} · {p.stat}
                </p>
                <h3
                  className="display-md"
                  style={{ marginBottom: "14px", maxWidth: "14ch" }}
                >
                  {p.name}
                </h3>
                <p
                  className="mono-sm"
                  style={{ color: "var(--accent-soft)", marginBottom: "20px" }}
                >
                  {p.tagline}
                </p>
                <p className="body-lg" style={{ maxWidth: "520px", margin: 0 }}>
                  {p.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  marginTop: "32px",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {p.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-u mono-sm"
                    style={{ color: "var(--ink-dim)" }}
                  >
                    GitHub ↗
                  </a>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-u mono-sm"
                      style={{ color: "var(--accent-soft)" }}
                    >
                      Live ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "clamp(32px, 5vw, 56px)" }}>
          <Link
            href="/projects"
            className="btn-line"
            onClick={() =>
              trackEvent("cta_click", {
                cta_label: "All Projects",
                link_url: "/projects",
                source: "home_featured",
              })
            }
          >
            All 21 Projects
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
