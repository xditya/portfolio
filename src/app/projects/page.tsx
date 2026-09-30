"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { event as trackEvent } from "@/lib/gtag";
import { projects, projectYears, techCounts, formatStat } from "@/content";

gsap.registerPlugin(ScrollTrigger);

const years = projectYears();

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
      // lerp toward the cursor · gives the follow a hint of momentum
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
  const techFilters = useMemo(() => techCounts().filter(([, n]) => n >= 2), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (tech && !p.tech.includes(tech)) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.tagline} ${p.description} ${p.tech.join(" ")} ${p.year}`.toLowerCase();
      return q.split(/\s+/).every((t) => hay.includes(t));
    });
  }, [query, tech]);

  const projectsByYear = years.map((year) => ({
    year,
    items: filtered.filter((p) => p.year === year),
  })).filter(({ items }) => items.length > 0);

  const isFiltering = query.trim() !== "" || tech !== null;
  let runningIndex = 0;

  return (
    <div style={{ paddingTop: "110px" }}>
      <div className="container-x" style={{ paddingBottom: "40px" }}>
        {/* Header */}
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          Index · {projects.length} projects / {years.length} years
        </p>
        <h1 className="display-lg" style={{ marginBottom: "28px" }}>
          Projects
        </h1>
        <p className="body-lg" style={{ maxWidth: "560px", margin: 0 }}>
          {projects.length} projects across {years.length} years, from
          Telegram bots to mobile apps.
        </p>
      </div>

      {/* Search + filters */}
      <div className="container-x">
        <div className="hairline-t" style={{ paddingTop: "24px" }}>
          <input
            type="search"
            className="field-u"
            placeholder="Search projects (try “telegram” or “2022”)"
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
              {isFiltering ? `${filtered.length} of ${projects.length}` : `${projects.length} projects`}
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
        {projectsByYear.map(({ year, items }) => (
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
                {items.length} project{items.length > 1 ? "s" : ""}
              </span>
            </div>

            <div>
              {items.map((project) => {
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
