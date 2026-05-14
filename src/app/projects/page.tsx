"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  name: string;
  tagline: string;
  description: string;
  github: string;
  url?: string;
  tech: string[];
  year: number;
  stars?: number;
  users?: string;
  image?: string;
  featured?: boolean;
};

const PROJECTS: Project[] = [
  // 2024
  { name: "Campus Services", tagline: "College services management app", description: "A comprehensive mobile app to streamline campus services — digital wallet, print services, vehicle pass, ID cards, lab access, and smart vending.", github: "https://github.com/xditya/CampusServicesManagementSystem", tech: ["Kotlin", "Android", "MongoDB"], year: 2024 },
  { name: "GeminiBot", tagline: "AI-powered Telegram Bot", description: "A Telegram bot powered by Google's Gemini AI for intelligent conversations and assistance.", github: "https://github.com/xditya/GeminiBot", tech: ["TypeScript", "Deno"], year: 2024, image: "/images/geminibot.jpg" },
  { name: "TGdetailsBot", tagline: "Telegram Bot to fetch message details", description: "Gets message details (as JSON) and chat IDs. A live instance is available on Telegram.", github: "https://github.com/xditya/TGdetailsBot", url: "https://t.me/TGdetailsBot", tech: ["TypeScript"], year: 2024, image: "/images/tgdetails.png" },
  { name: "WhatsApp Utilities", tagline: "WhatsApp Bot", description: "A WhatsApp Bot using whatsapp-web.js to convert images into stickers.", github: "https://github.com/xditya/WhatsAppUtilitiesBot", tech: ["JavaScript"], year: 2024, image: "/images/whatsapputilities.png" },
  // 2023
  { name: "GetRestrictedMessages", tagline: "Copy messages from restricted chats", description: "A tool to copy messages from Telegram chats with forward restrictions enabled.", github: "https://github.com/xditya/GetRestrictedMessages", tech: ["Python"], year: 2023, stars: 83 },
  { name: "VehicleDetection", tagline: "Real-time Traffic Management System", description: "Detects vehicles from video feeds and dynamically manages traffic lights using YOLO and PyQt5.", github: "https://github.com/xditya/VehicleDetection", tech: ["Python", "OpenCV", "PyQt5"], year: 2023, image: "/images/vehicledetection.png" },
  { name: "AyuVritt", tagline: "Bridging ancient wisdom and modern healing via AI", description: "AI-driven platform bridging ancient wisdom and modern healing.", github: "https://github.com/xditya/AyuVritt", url: "https://camel-case.vercel.app/", tech: ["Python", "Flask", "Next.js"], year: 2023, image: "/images/ayuvritt.png" },
  { name: "WebShortener", tagline: "Lightweight Link Shortener", description: "A lightweight and fast link shortener web application with a clean interface.", github: "https://github.com/xditya/WebShortener", tech: ["JavaScript"], year: 2023 },
  { name: "Lyrics Searcher", tagline: "Song lyrics searching app", description: "Android application that allows users to search for lyrics based on song titles.", github: "https://github.com/xditya/LyricsSearcher/", url: "https://github.com/xditya/LyricsSearcher/releases/tag/v0.1", tech: ["Kotlin", "Jetpack Compose"], year: 2023 },
  // 2022
  { name: "ChannelActionsBot", tagline: "Telegram bot to auto approve chat join requests", description: "A bot built to automatically handle join requests for Telegram chats, with over 1M users.", github: "https://github.com/xditya/ChannelActionsBot", url: "https://channelactions.xditya.me", tech: ["Deno", "TypeScript", "MongoDB"], year: 2022, stars: 122, users: "1M+", image: "/images/channelactions.png", featured: true },
  { name: "ChannelAutoPost", tagline: "Telegram bot to auto post messages", description: "Automatically posts messages from one channel to another without the forwarded tag.", github: "https://github.com/xditya/ChannelAutoPost", tech: ["Python"], year: 2022, stars: 224, image: "/images/channelautopost.png" },
  { name: "captchaBot", tagline: "Telegram Captcha Bot", description: "A Telegram bot that provides captcha verification for group chats to prevent spam.", github: "https://github.com/xditya/captchaBot", tech: ["Python"], year: 2022 },
  // 2021
  { name: "YouTubeFeeds", tagline: "YouTube video notifications on Telegram", description: "Get new YouTube video notifications from multiple channels on multiple Telegram chats.", github: "https://github.com/xditya/YouTubeFeeds", tech: ["TypeScript"], year: 2021, stars: 60 },
  { name: "Ultroid", tagline: "Pluggable Telegram userbot", description: "Advanced, multi-featured Telegram UserBot with plugin support. 3k+ stars on GitHub.", github: "https://github.com/TeamUltroid/Ultroid", url: "https://t.me/TeamUltroid", tech: ["Python", "MongoDB", "Redis"], year: 2021, stars: 3000, image: "/images/ultroid.png", featured: true },
  { name: "ForceSub", tagline: "Force Subscribe Bot", description: "A Telegram bot that forces users to subscribe to a channel before they can interact.", github: "https://github.com/xditya/ForceSub", tech: ["Python"], year: 2021, stars: 63 },
  { name: "Telethon Bot", tagline: "Telegram bot boilerplate", description: "Telegram Bot/UserBot boilerplate built with the Telethon library.", github: "https://github.com/xditya/TelethonBot", tech: ["Python"], year: 2021, stars: 54, image: "/images/telethonbot.png" },
  { name: "BotStatus", tagline: "Bot status updater for Telegram", description: "Update your Telegram Bot's status on your channel periodically.", github: "https://github.com/xditya/BotStatus", tech: ["Python"], year: 2021, stars: 53 },
  { name: "VCBot", tagline: "Voice chat music bot", description: "Minimal Telegram voice chat music bot built with Pyrogram.", github: "https://github.com/xditya/VCBot", tech: ["Python"], year: 2021, stars: 38 },
  // 2020
  { name: "GroupManager", tagline: "Python based group managing bot", description: "A comprehensive Telegram group management bot with moderation features.", github: "https://github.com/xditya/GroupManager", tech: ["Python", "MongoDB"], year: 2020, stars: 256, featured: true },
];

const YEARS = [2024, 2023, 2022, 2021, 2020];

const TECH_COLORS: Record<string, string> = {
  Python: "#3776AB",
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  "Next.js": "#F0F6FC",
  Deno: "#70FFAF",
  MongoDB: "#47A248",
  Kotlin: "#7F52FF",
  Android: "#3DDC84",
  Redis: "#DC382D",
  Flask: "#AAAAAA",
  OpenCV: "#5C3EE8",
  PyQt5: "#41CD52",
  "Jetpack Compose": "#4285F4",
};

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function ProjectsPage() {
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const yearRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = document.querySelectorAll(".project-card");
    els.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.5, ease: "power2.out",
          delay: (i % 3) * 0.07,
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    });
  }, []);

  const scrollToYear = (year: number) => {
    setActiveYear(year);
    const el = yearRefs.current[year];
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Track scroll: update active year
  useEffect(() => {
    const handleScroll = () => {
      const OFFSET = 140;
      let current: number | null = null;
      for (const year of YEARS) {
        const el = yearRefs.current[year];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= OFFSET) current = year;
      }
      setActiveYear(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const projectsByYear = YEARS.map((year) => ({
    year,
    projects: PROJECTS.filter((p) => p.year === year),
  }));

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Outer wrapper — wide enough to fit timeline + content side by side */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <span className="badge badge-muted" style={{ marginBottom: "16px" }}>Portfolio</span>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: "16px" }}>Projects</h1>
          <p style={{ fontSize: "17px", color: "var(--text-secondary)" }}>
            {PROJECTS.length} projects spanning {YEARS.length} years — from Telegram bots to mobile apps.
          </p>
        </div>

        {/* Two-column: sidebar + content */}
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

          {/* Sticky timeline sidebar */}
          <div
            ref={sidebarRef}
            className="year-timeline"
            style={{ position: "sticky", top: "90px", width: "140px", flexShrink: 0 }}
          >
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Timeline</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => scrollToYear(year)}
                  style={{
                    textAlign: "left", padding: "8px 12px", borderRadius: "8px", border: "none",
                    background: activeYear === year ? "var(--accent-glow)" : "transparent",
                    color: activeYear === year ? "var(--accent)" : "var(--text-muted)",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: "14px", fontWeight: 500,
                    cursor: "pointer", transition: "all 200ms ease", width: "100%",
                    borderLeft: `2px solid ${activeYear === year ? "var(--accent)" : "transparent"}`,
                  }}
                  onMouseEnter={(e) => {
                    if (activeYear !== year) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeYear !== year) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Projects list */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {projectsByYear.map(({ year, projects }) => (
              <div key={year} ref={(el) => { yearRefs.current[year] = el; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "13px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{year}</h2>
                  <div className="divider" style={{ flex: 1 }} />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{projects.length} projects</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                  {projects.map((project) => (
                    <div
                      key={project.name}
                      className="project-card card"
                      style={{
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Featured accent line */}
                      {project.featured && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--accent)", borderRadius: "12px 12px 0 0" }} />
                      )}

                      {/* Header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div>
                          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>{project.name}</h3>
                          {project.featured && <span className="badge badge-accent" style={{ fontSize: "10px" }}>Featured</span>}
                        </div>
                        {/* Badges */}
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          {project.users && (
                            <span className="badge badge-accent" style={{ fontSize: "10px" }}>{project.users} users</span>
                          )}
                          {project.stars && project.stars >= 100 && (
                            <span className="badge badge-muted" style={{ fontSize: "10px" }}>★ {project.stars >= 1000 ? `${(project.stars / 1000).toFixed(0)}k+` : `${project.stars}+`}</span>
                          )}
                        </div>
                      </div>

                      {/* Tagline */}
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>{project.tagline}</p>

                      {/* Description */}
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, flex: 1 }}>{project.description}</p>

                      {/* Stars (small) */}
                      {project.stars && project.stars < 100 && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          {project.stars}+
                        </div>
                      )}

                      {/* Tech Stack */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {project.tech.map((t) => (
                          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "4px", background: "var(--bg-hover)", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", color: TECH_COLORS[t] || "var(--text-secondary)", border: `1px solid ${(TECH_COLORS[t] || "#484F58") + "30"}` }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Links */}
                      <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
                        <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--text-muted)", cursor: "pointer", transition: "color 200ms ease" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                          GitHub
                        </a>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--accent)", cursor: "pointer", transition: "color 200ms ease" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent-dim)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent)")}>
                            <ExternalIcon /> Live
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .year-timeline { display: block !important; }
        @media (max-width: 860px) {
          .year-timeline { display: none !important; }
        }
      `}</style>
    </div>
  );
}
