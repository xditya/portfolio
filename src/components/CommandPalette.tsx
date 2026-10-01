"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { event as trackEvent } from "@/lib/gtag";
import { profile, projects, socials, links, palettePages } from "@/content";

type Item = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  group: string;
  run: () => void;
};

// No open animation: a keyboard-driven, high-frequency surface feels slow when animated.
export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Closed during render, not in an effect, so the new route never paints with the palette open.
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (open) setOpen(false);
  }

  const goto = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const items = useMemo<Item[]>(() => {
    const external = (href: string) =>
      window.open(href, "_blank", "noopener,noreferrer");

    const pages: Item[] = palettePages.map((p) => ({
      id: `p-${p.id}`,
      label: p.label,
      hint: p.href,
      keywords: p.keywords,
      group: "Pages",
      run: () => goto(p.href),
    }));

    const actions: Item[] = [
      {
        id: "a-email",
        label: "Copy email address",
        hint: profile.email,
        keywords: "copy email clipboard contact mail",
        group: "Actions",
        run: () => {
          const clipboard = navigator.clipboard;
          if (!clipboard) return;
          clipboard
            .writeText(profile.email)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {});
        },
      },
      {
        id: "a-resume",
        label: "Download resume",
        hint: "PDF",
        keywords: "resume cv download pdf",
        group: "Actions",
        run: () => external(profile.resume),
      },
    ];

    const projectItems: Item[] = projects.map((p) => ({
      id: `pr-${p.name}`,
      label: p.name,
      hint: `${p.year} · GitHub ↗`,
      keywords: `${p.tagline} ${p.tech.join(" ")} ${p.year}`,
      group: "Projects",
      run: () => external(p.github),
    }));

    const socialItems: Item[] = socials.map((s) => ({
      id: `s-${s.label}`,
      label: s.label,
      hint: "Social ↗",
      keywords: `social follow ${s.href}`,
      group: "Socials",
      run: () => external(s.href),
    }));

    const toolItems: Item[] = links.map((l) => ({
      id: `t-${l.name}`,
      label: l.name,
      hint: l.external ? "Tool ↗" : l.href,
      keywords: `${l.description} tool`,
      group: "Tools",
      run: () => (l.external ? external(l.href) : goto(l.href)),
    }));

    return [...pages, ...actions, ...projectItems, ...socialItems, ...toolItems];
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette("keyboard");
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      } else if (e.key === "Tab" && open) {
        // The input is the only tab stop; handled on window so it holds after
        // a click on the panel drops focus to the body.
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette]);

  useEffect(() => {
    const onOpen = () => openPalette("navbar");
    window.addEventListener("cmdk:open", onOpen);
    return () => window.removeEventListener("cmdk:open", onOpen);
  }, [openPalette]);

  // Both are set: html's overflow-x: clip stops body overflow reaching the viewport.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const copiedToast = copied ? (
    <div
      className="mono-sm"
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: "calc(var(--dock-space) + 28px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 210,
        background: "var(--surface-1)",
        border: "1px solid var(--accent)",
        color: "var(--accent-2)",
        padding: "10px 20px",
        borderRadius: "999px",
        letterSpacing: "0.08em",
      }}
    >
      ✓ Copied {profile.email}
    </div>
  ) : null;

  const flat = grouped.flatMap((g) => g.items);

  // Always mounted so screen readers hear the copy confirmation even when closed.
  const live = (
    <div
      role="status"
      style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
    >
      {copied ? `Copied ${profile.email}` : open && flat.length === 0 ? `Nothing found for ${query}` : ""}
    </div>
  );

  if (!open) return <>{live}{copiedToast}</>;

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
    <>
      {live}
      <div
        className="cmdk-overlay"
        // Lenis scrolls in script and ignores the overflow lock.
        data-lenis-prevent=""
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
            aria-label="Search the site"
            placeholder="Search pages, projects, socials…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
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
                Nothing found for “{query}”. Try a project name, or “contact”.
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
                      tabIndex={-1}
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
            <span className="mono-sm" style={{ color: "var(--text-3)", display: "inline-flex", gap: "6px", alignItems: "center" }}>
              <kbd className="cmdk-kbd">↑↓</kbd> navigate
            </span>
            <span className="mono-sm" style={{ color: "var(--text-3)", display: "inline-flex", gap: "6px", alignItems: "center" }}>
              <kbd className="cmdk-kbd">↵</kbd> open
            </span>
            <span className="mono-sm" style={{ color: "var(--text-3)", display: "inline-flex", gap: "6px", alignItems: "center" }}>
              <kbd className="cmdk-kbd">esc</kbd> close
            </span>
          </div>
        </div>
        {copiedToast}
      </div>
    </>
  );
}
