"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { event as trackEvent } from "@/lib/gtag";
import { GAME_PROJECTS, GAME_SOCIALS, GAME_LINKS, GAME_ABOUT } from "@/lib/gameData";

type Item = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  group: string;
  run: () => void;
};

/**
 * ⌘K / Ctrl+K command palette.
 *
 * Opens with NO animation: the palette is a keyboard-initiated, high-frequency
 * surface, and animating those makes them feel slow (Emil Kowalski's rule —
 * Raycast does the same).
 */
export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const goto = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const items = useMemo<Item[]>(() => {
    const external = (href: string) =>
      window.open(href, "_blank", "noopener,noreferrer");

    const pages: Item[] = [
      { id: "p-home", label: "Home", hint: "/", keywords: "home index start", group: "Pages", run: () => goto("/") },
      { id: "p-about", label: "About", hint: "/about", keywords: "about me bio experience stats", group: "Pages", run: () => goto("/about") },
      { id: "p-projects", label: "Projects", hint: "/projects", keywords: "projects work index repos", group: "Pages", run: () => goto("/projects") },
      { id: "p-contact", label: "Contact", hint: "/contact", keywords: "contact hire form email message", group: "Pages", run: () => goto("/contact") },
      { id: "p-links", label: "Links", hint: "/links", keywords: "links tools services", group: "Pages", run: () => goto("/links") },
      { id: "p-game", label: "Play the Game", hint: "/game", keywords: "game 3d play grid explore fun three", group: "Pages", run: () => goto("/game") },
    ];

    const actions: Item[] = [
      {
        id: "a-email",
        label: "Copy email address",
        hint: GAME_ABOUT.email,
        keywords: "copy email clipboard contact mail",
        group: "Actions",
        run: () => {
          navigator.clipboard?.writeText(GAME_ABOUT.email).catch(() => {});
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        },
      },
      {
        id: "a-resume",
        label: "Download resume",
        hint: "PDF",
        keywords: "resume cv download pdf",
        group: "Actions",
        run: () => external(GAME_ABOUT.resume),
      },
    ];

    const projects: Item[] = GAME_PROJECTS.map((p) => ({
      id: `pr-${p.name}`,
      label: p.name,
      hint: `${p.year} · GitHub ↗`,
      keywords: `${p.tagline} ${p.tech.join(" ")} ${p.year}`,
      group: "Projects",
      run: () => external(p.github),
    }));

    const socials: Item[] = GAME_SOCIALS.map((s) => ({
      id: `s-${s.label}`,
      label: s.label,
      hint: "Social ↗",
      keywords: `social follow ${s.href}`,
      group: "Socials",
      run: () => external(s.href),
    }));

    const tools: Item[] = GAME_LINKS.map((l) => ({
      id: `t-${l.name}`,
      label: l.name,
      hint: l.external ? "Tool ↗" : l.href,
      keywords: `${l.description} tool`,
      group: "Tools",
      run: () => (l.external ? external(l.href) : goto(l.href)),
    }));

    return [...pages, ...actions, ...projects, ...socials, ...tools];
  }, [goto]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const terms = q.split(/\s+/);
    return items.filter((i) => {
      const hay = `${i.label} ${i.keywords} ${i.group}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, query]);

  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Item[]>();
    for (const r of results) {
      if (!map.has(r.group)) {
        map.set(r.group, []);
        order.push(r.group);
      }
      map.get(r.group)!.push(r);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [results]);

  const openPalette = useCallback((source: string) => {
    setOpen(true);
    setQuery("");
    setActive(0);
    trackEvent("cmdk_open", { source });
  }, []);

  const runItem = useCallback(
    (item: Item) => {
      setOpen(false);
      trackEvent("cmdk_run", { item: item.id });
      item.run();
    },
    [],
  );

  /* Global shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette("keyboard");
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette]);

  /* Open via navbar (custom event keeps Navbar decoupled) */
  useEffect(() => {
    const onOpen = () => openPalette("navbar");
    window.addEventListener("cmdk:open", onOpen);
    return () => window.removeEventListener("cmdk:open", onOpen);
  }, [openPalette]);

  /* Close on route change, focus input on open, lock scroll */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Keep active row in view */
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const copiedToast = copied ? (
    <div
      className="mono-sm"
      role="status"
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 210,
        background: "var(--bg-card)",
        border: "1px solid var(--accent)",
        color: "var(--accent-soft)",
        padding: "10px 20px",
        borderRadius: "999px",
        letterSpacing: "0.08em",
      }}
    >
      ✓ Email copied — {GAME_ABOUT.email}
    </div>
  ) : null;

  if (!open) return copiedToast;

  const flat = grouped.flatMap((g) => g.items);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) runItem(flat[active]);
    }
  };

  let idx = -1;

  return (
    <div
      className="cmdk-overlay"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="cmdk-panel">
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder="Search pages, projects, socials…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKey}
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-activedescendant={flat[active] ? `cmdk-${flat[active].id}` : undefined}
          spellCheck={false}
        />
        <div className="cmdk-list" ref={listRef} id="cmdk-list" role="listbox">
          {flat.length === 0 && (
            <div className="cmdk-empty">
              Nothing found for “{query}” — try a project name or “contact”.
            </div>
          )}
          {grouped.map(({ group, items: gi }) => (
            <div key={group}>
              <p className="mono-label cmdk-group-label">{group}</p>
              {gi.map((item) => {
                idx += 1;
                const i = idx;
                return (
                  <button
                    key={item.id}
                    id={`cmdk-${item.id}`}
                    data-idx={i}
                    data-active={i === active}
                    className="cmdk-item"
                    role="option"
                    aria-selected={i === active}
                    onPointerMove={() => setActive(i)}
                    onClick={() => runItem(item)}
                  >
                    <span>{item.label}</span>
                    <span className="cmdk-hint">{item.hint}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-footer">
          <span className="mono-sm" style={{ color: "var(--muted)", display: "inline-flex", gap: "6px", alignItems: "center" }}>
            <kbd className="cmdk-kbd">↑↓</kbd> navigate
          </span>
          <span className="mono-sm" style={{ color: "var(--muted)", display: "inline-flex", gap: "6px", alignItems: "center" }}>
            <kbd className="cmdk-kbd">↵</kbd> open
          </span>
          <span className="mono-sm" style={{ color: "var(--muted)", display: "inline-flex", gap: "6px", alignItems: "center" }}>
            <kbd className="cmdk-kbd">esc</kbd> close
          </span>
        </div>
      </div>
      {copiedToast}
    </div>
  );
}
