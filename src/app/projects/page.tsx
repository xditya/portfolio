"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { event as trackEvent } from "@/lib/gtag";

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

function formatStat(p: Project) {
  if (p.users) return `${p.users} users`;
  if (p.stars) {
    return p.stars >= 1000
      ? `★ ${(p.stars / 1000).toFixed(0)}K+`
      : `★ ${p.stars}+`;
  }
  return null;
}

/** Cursor-following image preview for rows that have screenshots. */
function useHoverPreview() {
  const posRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!enabled.current) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      // lerp toward the cursor — gives the follow a hint of momentum
      current.current.x += (target.current.x - current.current.x) * 0.16;
      current.current.y += (target.current.y - current.current.y) * 0.16;
      if (posRef.current) {
        posRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const show = (img?: string) => {
    if (!enabled.current) return;
    setImage(img ?? null);
  };

  return { posRef, image, show };
}

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState<string | null>(null);
  const { posRef, image, show } = useHoverPreview();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".idx-row").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            delay: (i % 4) * 0.05,
            scrollTrigger: { trigger: el, start: "top 92%" },
          },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  // Techs that appear on 2+ projects, ordered by frequency
  const techFilters = useMemo(() => {
    const counts = new Map<string, number>();
    PROJECTS.forEach((p) => p.tech.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1]);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      if (tech && !p.tech.includes(tech)) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.tagline} ${p.description} ${p.tech.join(" ")} ${p.year}`.toLowerCase();
      return q.split(/\s+/).every((t) => hay.includes(t));
    });
  }, [query, tech]);

  const projectsByYear = YEARS.map((year) => ({
    year,
    projects: filtered.filter((p) => p.year === year),
  })).filter(({ projects }) => projects.length > 0);

  const isFiltering = query.trim() !== "" || tech !== null;
  let runningIndex = 0;

  return (
    <div style={{ paddingTop: "110px" }}>
      <div className="container-x" style={{ paddingBottom: "40px" }}>
        {/* Header */}
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          Index — {PROJECTS.length} projects / {YEARS.length} years
        </p>
        <h1 className="display-lg" style={{ marginBottom: "28px" }}>
          Projects
        </h1>
        <p className="body-lg" style={{ maxWidth: "560px", margin: 0 }}>
          {PROJECTS.length} projects spanning {YEARS.length} years — from
          Telegram bots to mobile apps.
        </p>
      </div>

      {/* Search + filters */}
      <div className="container-x">
        <div className="hairline-t" style={{ paddingTop: "24px" }}>
          <input
            type="search"
            className="field-u"
            placeholder="Search projects — try “telegram”, “python”, “2022”…"
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: "560px" }}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            {techFilters.map(([t, n]) => (
              <button
                key={t}
                className="chip"
                data-on={tech === t}
                aria-pressed={tech === t}
                onClick={() => {
                  const next = tech === t ? null : t;
                  setTech(next);
                  if (next) trackEvent("projects_filter", { tech: next });
                }}
              >
                {t}
                <span style={{ color: "var(--muted)" }}>{n}</span>
              </button>
            ))}
            <span className="mono-sm" style={{ color: "var(--muted)", marginLeft: "auto" }} aria-live="polite">
              {isFiltering ? `${filtered.length} of ${PROJECTS.length}` : `${PROJECTS.length} projects`}
            </span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="container-x" style={{ paddingBlock: "72px" }}>
          <p className="body-lg" style={{ margin: "0 0 20px" }}>
            No projects match{query.trim() ? ` “${query.trim()}”` : ""}
            {tech ? ` with ${tech}` : ""}.
          </p>
          <button
            className="btn-line"
            onClick={() => {
              setQuery("");
              setTech(null);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Year groups */}
      <div className="container-x" style={{ paddingTop: "32px" }}>
        {projectsByYear.map(({ year, projects }) => (
          <section key={year} style={{ marginBottom: "clamp(48px, 7vw, 88px)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2
                className="outline-text"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(40px, 7vw, 88px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {year}
              </h2>
              <span className="mono-label">
                {projects.length} project{projects.length > 1 ? "s" : ""}
              </span>
            </div>

            <div>
              {projects.map((project) => {
                runningIndex += 1;
                const stat = formatStat(project);
                return (
                  <div
                    key={project.name}
                    className="idx-row"
                    onMouseEnter={() => show(project.image)}
                    onMouseLeave={() => show()}
                  >
                    <span className="idx-dim mono-sm">
                      {String(runningIndex).padStart(2, "0")}
                    </span>

                    <span>
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="idx-title idx-stretch"
                        aria-label={`${project.name} on GitHub`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "clamp(18px, 2.6vw, 30px)",
                          letterSpacing: "-0.02em",
                          lineHeight: 1.15,
                        }}
                      >
                        {project.name}
                        {project.featured && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "var(--accent)",
                              flexShrink: 0,
                            }}
                            title="Featured"
                          />
                        )}
                      </a>
                      <span
                        className="idx-dim mono-sm"
                        style={{ display: "block", marginTop: "6px" }}
                      >
                        {project.tagline}
                      </span>
                    </span>

                    <span className="idx-tech idx-dim mono-sm">
                      {project.tech.join(" · ")}
                    </span>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        justifySelf: "end",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      {stat && (
                        <span
                          className="idx-dim mono-sm"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {stat}
                        </span>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chip live-chip"
                          style={{ background: "var(--bg)" }}
                        >
                          Live ↗
                        </a>
                      )}
                      <span
                        className="idx-arrow"
                        aria-hidden="true"
                        style={{ fontSize: "20px", lineHeight: 1 }}
                      >
                        ↗
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Cursor-following screenshot preview (desktop only) */}
      <div ref={posRef} className="idx-preview-pos" aria-hidden="true">
        <div
          className="idx-preview"
          data-show={!!image}
          style={image ? { backgroundImage: `url(${image})` } : undefined}
        />
      </div>

      <style>{`
        @media (max-width: 760px) {
          .live-chip { display: none !important; }
        }
      `}</style>
    </div>
  );
}
