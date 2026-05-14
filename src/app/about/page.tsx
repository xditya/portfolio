"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
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

function StatCard({ label, value, suffix = "", animate }: { label: string; value: number; suffix?: string; animate: boolean }) {
  const count = useCountUp(value, 1.5, animate);
  return (
    <div className="card" style={{ padding: "20px 16px", textAlign: "center", cursor: "default", minWidth: 0 }}>
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1, marginBottom: "6px" }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function AboutPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [githubStats, setGithubStats] = useState({ repos: 20, stars: 1770, followers: 576 });

  useEffect(() => {
    fetch("https://api.github.com/users/xditya")
      .then((r) => r.json())
      .then((d) => {
        if (d.public_repos) setGithubStats((p) => ({ ...p, repos: d.public_repos, followers: d.followers }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal-on-scroll");
    els.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } }
      );
    });
  }, []);

  const scrollToCard = useCallback((idx: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[idx] as HTMLElement;
    if (card) {
      container.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
      setActiveCard(idx);
    }
  }, []);

  const yearsOfCoding = new Date().getFullYear() - 2020;

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* ── Page Header ── */}
      <div className="container-wide" style={{ paddingTop: "40px", paddingBottom: "48px" }}>
        <span className="badge badge-muted" style={{ marginBottom: "14px" }}>About me</span>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", marginBottom: "14px", maxWidth: "640px" }}>
          Building things for the web & Telegram
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "580px" }}>
          Full-stack developer interested in Python, TypeScript, and automation. I build Telegram bots, web apps, and open-source tools.
        </p>
      </div>

      <div className="container-wide" style={{ paddingBottom: "80px" }}>

        {/* ── Profile strip ── */}
        <div className="reveal-on-scroll" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px 24px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent-border)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Aditya" style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; const p = (e.currentTarget as HTMLImageElement).parentElement!; p.innerHTML = `<span style="font-family:'Archivo',sans-serif;font-weight:800;font-size:22px;color:var(--accent)">A</span>`; }} />
          </div>
          {/* Name / role */}
          <div style={{ flex: 1, minWidth: "160px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "2px" }}>Aditya</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Full-stack Developer · Kerala, India</p>
          </div>
          {/* Badges + links */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span className="badge badge-accent">Open Source</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
              {new Date().getFullYear() - 2003}y old
            </span>
          </div>
          {/* Socials */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "GitHub", href: "https://github.com/xditya" },
              { label: "Telegram", href: "https://t.me/xditya" },
              { label: "Email", href: "mailto:contact@xditya.me" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace", transition: "color 200ms ease", cursor: "pointer" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}>
                {label}
              </a>
            ))}
          </div>
          {/* Resume */}
          <a href="/resume.pdf" download className="btn btn-ghost" style={{ fontSize: "13px", padding: "8px 14px", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Resume
          </a>
        </div>

        {/* ── Stats ── */}
        <div ref={statsRef} className="reveal-on-scroll" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }} id="stats-grid">
          <StatCard label="Repos" value={githubStats.repos} suffix="+" animate={statsVisible} />
          <StatCard label="Stars" value={githubStats.stars} suffix="+" animate={statsVisible} />
          <StatCard label="Followers" value={githubStats.followers} suffix="+" animate={statsVisible} />
          <StatCard label="Years Coding" value={yearsOfCoding} suffix="+" animate={statsVisible} />
        </div>

        {/* ── Two columns: What I Do + How I Work ── */}
        <div className="reveal-on-scroll" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }} id="what-how-grid">
          {[
            { title: "What I Do", content: "Build Telegram bots, web applications, and automation tools using Python and TypeScript.", tags: ["Python", "TypeScript", "Telegram"] },
            { title: "How I Work", content: "Simple and automated. I focus on solving real problems efficiently and building scalable solutions.", tags: ["Efficiency", "Automation", "Open Source"] },
          ].map(({ title, content, tags }) => (
            <div key={title} className="card" style={{ padding: "20px", borderLeft: "2px solid var(--accent-border)" }}>
              <h3 style={{ fontSize: "14px", marginBottom: "10px" }}>{title}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "14px" }}>{content}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {tags.map((t) => <span key={t} className="tech-chip">{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tech Stack ── */}
        <div className="reveal-on-scroll card" style={{ padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "14px", marginBottom: "16px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Tech Stack</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {TECH_STACK.map(({ name, color }) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "6px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "default", transition: "all 200ms ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = color + "55"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Experience ── */}
        <div className="reveal-on-scroll">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px" }}>Experience</h2>
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { label: "←", action: () => scrollToCard(Math.max(0, activeCard - 1)), disabled: activeCard === 0 },
                { label: "→", action: () => scrollToCard(Math.min(EXPERIENCE.length - 1, activeCard + 1)), disabled: activeCard === EXPERIENCE.length - 1 },
              ].map(({ label, action, disabled }) => (
                <button key={label} onClick={action} disabled={disabled} aria-label={label}
                  style={{ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-surface)", color: disabled ? "var(--text-muted)" : "var(--text-primary)", cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "all 200ms ease" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable cards */}
          <div ref={scrollRef} style={{ display: "flex", gap: "12px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "4px" }}>
            {EXPERIENCE.map((exp, i) => (
              <div key={i} onClick={() => setActiveCard(i)}
                style={{ minWidth: "300px", maxWidth: "300px", padding: "20px", background: "var(--bg-surface)", border: `1px solid ${exp.current ? "var(--accent-border)" : "var(--border)"}`, borderRadius: "12px", cursor: "pointer", transition: "all 200ms ease", flexShrink: 0 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "3px" }}>{exp.title}</h3>
                    <p style={{ fontSize: "12px", color: "var(--accent)", fontFamily: "'JetBrains Mono',monospace" }}>{exp.company}</p>
                  </div>
                  {exp.current && <span className="badge badge-accent" style={{ fontSize: "10px" }}>Now</span>}
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace", marginBottom: "10px" }}>{exp.period}</p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{exp.description}</p>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginTop: "14px" }}>
            {EXPERIENCE.map((_, i) => (
              <button key={i} onClick={() => scrollToCard(i)} aria-label={`Experience ${i + 1}`}
                style={{ width: i === activeCard ? "18px" : "5px", height: "5px", borderRadius: "3px", background: i === activeCard ? "var(--accent)" : "var(--border)", border: "none", cursor: "pointer", padding: 0, transition: "all 300ms ease" }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        #stats-grid    { grid-template-columns: repeat(4, 1fr) !important; }
        #what-how-grid { grid-template-columns: 1fr 1fr !important; }
        @media (max-width: 640px) {
          #stats-grid    { grid-template-columns: repeat(2, 1fr) !important; }
          #what-how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
