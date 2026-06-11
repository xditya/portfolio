"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TECH_STACK = [
  { name: "Python", color: "#3776AB" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Next.js", color: "#F0F6FC" },
  { name: "Deno", color: "#70FFAF" },
  { name: "MongoDB", color: "#47A248" },
  { name: "Kotlin", color: "#7F52FF" },
];

const EXPERIENCE = [
  {
    title: "Product Engineer",
    company: "UST",
    period: "2025 – Present",
    description: "Working on product development and engineering solutions.",
    current: true,
  },
  {
    title: "Lead Developer",
    company: "TeamUltroid",
    period: "2021 – Present",
    description:
      "Built the core architecture and key modules of the project. Handle GitHub repos, code reviews, and work with contributors from around the world.",
    current: false,
  },
  {
    title: "Tech Intern",
    company: "BreadcrumbsAI",
    period: "2024",
    description:
      "Developed web scraping scripts in Python using Playwright and BeautifulSoup. Implemented error handling and logging for reliable data collection.",
    current: false,
  },
  {
    title: "Project Lead & Backend Developer",
    company: "GDSC MBCET",
    period: "2022 – 2024",
    description:
      "Coordinated club activities. Developed automation scripts for events and the backend of the GDSC MBCET website.",
    current: false,
  },
  {
    title: "Campus Lead",
    company: "GTECH μLearn, MBCET",
    period: "2023 – 2024",
    description:
      "Managed campus-wide learning and skill development initiatives. Achieved 1 Million karma points in the campus.",
    current: false,
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
  suffix = "",
  animate,
}: {
  label: string;
  value: number;
  suffix?: string;
  animate: boolean;
}) {
  const count = useCountUp(value, 1.5, animate);
  return (
    <div style={{ padding: "24px 0", borderTop: "1px solid var(--line)" }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(36px, 5vw, 64px)",
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

export default function AboutPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [githubStats, setGithubStats] = useState({
    repos: 20,
    stars: 1770,
    followers: 576,
  });

  useEffect(() => {
    fetch("https://api.github.com/users/xditya")
      .then((r) => r.json())
      .then((d) => {
        if (d.public_repos)
          setGithubStats((p) => ({
            ...p,
            repos: d.public_repos,
            followers: d.followers,
          }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal-on-scroll").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  const yearsOfCoding = new Date().getFullYear() - 2020;
  const age = new Date().getFullYear() - 2003;

  return (
    <div style={{ paddingTop: "110px" }}>
      {/* ── Header ── */}
      <div className="container-x" style={{ paddingBottom: "clamp(40px, 6vw, 72px)" }}>
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          01 — About me
        </p>
        <h1 className="display-lg" style={{ marginBottom: "28px", maxWidth: "12ch" }}>
          Building things for the web &amp; Telegram
        </h1>
        <p className="body-lg" style={{ maxWidth: "560px", margin: 0 }}>
          Full-stack developer interested in Python, TypeScript, and
          automation. I build Telegram bots, web apps, and open-source tools.
        </p>
      </div>

      {/* ── Profile strip ── */}
      <div className="container-x reveal-on-scroll">
        <div
          className="hairline-t hairline-b"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
            paddingBlock: "28px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid var(--line-strong)",
              background: "var(--bg-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Aditya"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const p = (e.currentTarget as HTMLImageElement).parentElement!;
                p.innerHTML = `<span style="font-family:var(--font-display);font-weight:900;font-size:26px;color:var(--accent)">A</span>`;
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "180px" }}>
            <h2
              style={{
                fontSize: "20px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Aditya
            </h2>
            <p className="mono-sm" style={{ color: "var(--ink-dim)", margin: 0 }}>
              Full-stack Developer · Kerala, India · {age}y old
            </p>
          </div>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center" }}>
            <span className="badge badge-accent">Open Source</span>
            {[
              { label: "GitHub", href: "https://github.com/xditya" },
              { label: "Telegram", href: "https://t.me/xditya" },
              { label: "Email", href: "mailto:contact@xditya.me" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-u mono-sm"
                style={{ color: "var(--muted)" }}
              >
                {label} ↗
              </a>
            ))}
          </div>

          <a href="/resume.pdf" download className="btn-line" style={{ padding: "12px 24px" }}>
            Resume ↓
          </a>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="container-x reveal-on-scroll" ref={statsRef}>
        <div
          className="about-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "clamp(20px, 3vw, 48px)",
            paddingBlock: "clamp(40px, 6vw, 72px)",
          }}
        >
          <Stat label="Repos" value={githubStats.repos} suffix="+" animate={statsVisible} />
          <Stat label="Stars" value={githubStats.stars} suffix="+" animate={statsVisible} />
          <Stat label="Followers" value={githubStats.followers} suffix="+" animate={statsVisible} />
          <Stat label="Years Coding" value={yearsOfCoding} suffix="+" animate={statsVisible} />
        </div>
      </div>

      {/* ── What I Do / How I Work ── */}
      <div className="container-x reveal-on-scroll">
        <div
          className="about-two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(24px, 4vw, 64px)",
          }}
        >
          {[
            {
              title: "What I Do",
              content:
                "Build Telegram bots, web applications, and automation tools using Python and TypeScript.",
              tags: ["Python", "TypeScript", "Telegram"],
            },
            {
              title: "How I Work",
              content:
                "Simple and automated. I focus on solving real problems efficiently and building scalable solutions.",
              tags: ["Efficiency", "Automation", "Open Source"],
            },
          ].map(({ title, content, tags }) => (
            <div key={title} className="hairline-t" style={{ paddingTop: "24px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                {title}
              </h3>
              <p className="body-lg" style={{ marginTop: 0, marginBottom: "20px" }}>
                {content}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="container-x reveal-on-scroll" style={{ marginTop: "clamp(48px, 7vw, 96px)" }}>
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          02 — Tech Stack
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {TECH_STACK.map(({ name, color }) => (
            <span
              key={name}
              className="chip"
              style={{ padding: "12px 22px", fontSize: "14px" }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                }}
              />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Experience ── */}
      <div className="container-x" style={{ marginTop: "clamp(48px, 7vw, 96px)" }}>
        <p className="mono-label reveal-on-scroll" style={{ marginBottom: "32px" }}>
          03 — Experience
        </p>

        <div>
          {EXPERIENCE.map((exp) => (
            <div
              key={`${exp.title}-${exp.company}`}
              className="reveal-on-scroll exp-row hairline-t"
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "24px",
                paddingBlock: "28px",
              }}
            >
              <div>
                <p className="mono-sm" style={{ color: "var(--muted)", margin: 0 }}>
                  {exp.period}
                </p>
                {exp.current && (
                  <span
                    className="badge badge-accent"
                    style={{ marginTop: "10px" }}
                  >
                    Now
                  </span>
                )}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "clamp(20px, 2.6vw, 28px)",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  {exp.title}
                </h3>
                <p
                  className="mono-sm"
                  style={{ color: "var(--accent-soft)", marginTop: 0, marginBottom: "12px" }}
                >
                  {exp.company}
                </p>
                <p className="body-lg" style={{ maxWidth: "640px", margin: 0 }}>
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .about-stats   { grid-template-columns: repeat(2, 1fr) !important; }
          .about-two-col { grid-template-columns: 1fr !important; }
          .exp-row       { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
      `}</style>
    </div>
  );
}
