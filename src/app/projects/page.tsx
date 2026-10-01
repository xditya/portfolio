"use client";

import { useRef, useState } from "react";
import { event as trackEvent } from "@/lib/gtag";
import { projects, projectYears, techCounts } from "@/content";
import { RowGroup } from "@/components/index/RowHighlight";
import { RowList } from "@/components/index/IndexRow";
import ProjectRow from "@/components/index/ProjectRow";
import ProjectPreview from "@/components/index/ProjectPreview";
import s from "./page.module.css";

const years = projectYears();

// A tech only one project uses would filter down to that one row.
const techFilters = techCounts().filter(([, n]) => n >= 2);

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState<string | null>(null);
  // Phones: the rows whose details are open. Each row opens on its own, so a
  // tap never changes the height of anything above the row being tapped.
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  const q = query.trim();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

  // Every term has to appear somewhere in the project's text.
  const filtered = projects.filter((p) => {
    if (tech && !p.tech.includes(tech)) return false;
    const hay = `${p.name} ${p.tagline} ${p.description} ${p.tech.join(" ")} ${p.year}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });

  const groups = years
    .map((year) => ({ year, items: filtered.filter((p) => p.year === year) }))
    .filter(({ items }) => items.length > 0);

  // The number printed on each row, counted in the order the rows appear.
  const position = new Map(
    groups.flatMap(({ items }) => items).map((p, i) => [p.name, i + 1]),
  );

  const isFiltering = q !== "" || tech !== null;

  return (
    <div className={s.page}>
      <header className={`container-x ${s.tool}`}>
        <div className={s.title}>
          <h1 className="display-lg">Projects</h1>
          <p className={`body-lg ${s.lede}`}>
            {projects.length} projects across {years.length} years, from
            Telegram bots to mobile apps.
          </p>
        </div>

        <input
          ref={searchRef}
          type="search"
          name="q"
          className={`field-u ${s.search}`}
          placeholder="Search projects (try “telegram” or “2022”)"
          aria-label="Search projects"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className={s.chips} role="group" aria-label="Filter by tech">
          {techFilters.map(([t, n]) => (
            <button
              key={t}
              type="button"
              className={`chip ${s.filter}`}
              data-on={tech === t}
              aria-pressed={tech === t}
              onClick={() => {
                const next = tech === t ? null : t;
                setTech(next);
                if (next) trackEvent("projects_filter", { tech: next });
              }}
            >
              {t}
              <span className={s.filterCount}>{n}</span>
            </button>
          ))}
        </div>

        <p className={`mono-sm ${s.count}`} aria-live="polite">
          {isFiltering
            ? `${filtered.length} of ${projects.length}`
            : `${projects.length} projects`}
        </p>
      </header>

      <RowGroup className={`container-x ${s.index}`}>
        <ProjectPreview />

        {filtered.length === 0 && (
          <div className={s.empty}>
            <p className={`body-lg ${s.emptyText}`}>
              No projects match{q ? ` “${q}”` : ""}
              {tech ? ` with ${tech}` : ""}.
            </p>
            <button
              type="button"
              className="btn-line"
              onClick={() => {
                setQuery("");
                setTech(null);
                // The button is about to unmount; hand focus to the search.
                searchRef.current?.focus();
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {groups.map(({ year, items }) => (
          <section key={year} className={s.group}>
            <div className={s.year}>
              <h2 className={s.yearNum}>{year}</h2>
              <span className={`mono-sm ${s.yearCount}`}>
                {items.length} project{items.length > 1 ? "s" : ""}
              </span>
            </div>

            <RowList>
              {items.map((project) => (
                <ProjectRow
                  key={project.name}
                  project={project}
                  index={position.get(project.name) ?? 0}
                  open={open.has(project.name)}
                  onToggle={() =>
                    setOpen((prev) => {
                      const next = new Set(prev);
                      if (!next.delete(project.name)) next.add(project.name);
                      return next;
                    })
                  }
                />
              ))}
            </RowList>
          </section>
        ))}
      </RowGroup>
    </div>
  );
}
