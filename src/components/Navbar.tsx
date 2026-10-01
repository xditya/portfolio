"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { event as trackEvent } from "@/lib/gtag";
import { navItems, profile } from "@/content";
import Dock from "@/components/nav/Dock";
import Marker from "@/components/nav/Marker";
import { SearchIcon } from "@/components/nav/Icons";
import { isActivePath, openPalette } from "@/components/nav/shared";
import s from "./Navbar.module.css";

// The server cannot know the platform, so it renders the Mac glyph and the
// client swaps after hydration.
const subscribeNever = () => () => {};
const readCmdKey = () =>
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    ? "⌘"
    : "Ctrl+";
const readServerCmdKey = () => "⌘";

export default function Navbar() {
  const pathname = usePathname();
  const reduce = useReducedMotion() === true;
  const cmdKey = useSyncExternalStore(
    subscribeNever,
    readCmdKey,
    readServerCmdKey,
  );
  const [scrolled, setScrolled] = useState(false);
  // Keyed by route so navigating elsewhere drops the hover without an effect.
  const [hover, setHover] = useState<{ href: string; at: string } | null>(
    null,
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isGame = pathname === "/game";
  const activeHref =
    navItems.find((item) => isActivePath(pathname, item.href))?.href ?? null;
  const markedHref =
    hover !== null && hover.at === pathname ? hover.href : activeHref;

  // The 21px sentinel leaves the viewport once the page scrolls past 20px.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setScrolled(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // globals.css drops the dock's body padding on the game route.
  useEffect(() => {
    if (!isGame) return;
    document.body.dataset.route = "game";
    return () => {
      delete document.body.dataset.route;
    };
  }, [isGame]);

  const clearHover = () => setHover(null);

  return (
    <>
      <div ref={sentinelRef} className={s.sentinel} aria-hidden="true" />

      <header className={s.header} data-scrolled={scrolled ? "" : undefined}>
        <div className={`container-x ${s.inner}`}>
          <Link
            href="/"
            className={s.wordmark}
            aria-label={`${profile.handle} · home`}
            onClick={() =>
              trackEvent("nav_click", {
                link_label: "Home",
                link_url: "/",
                source: "logo",
              })
            }
          >
            {profile.handle}
            <span className={s.dot}>.</span>
          </Link>

          <nav className={s.pill} aria-label="Primary">
            <ul
              className={s.list}
              onPointerLeave={clearHover}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  clearHover();
                }
              }}
            >
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const mark = () => setHover({ href: item.href, at: pathname });
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={s.link}
                      aria-current={active ? "page" : undefined}
                      onPointerEnter={mark}
                      onFocus={mark}
                      onClick={() =>
                        trackEvent("nav_click", {
                          link_label: item.label,
                          link_url: item.href,
                          source: "desktop",
                        })
                      }
                    >
                      {markedHref === item.href && (
                        <Marker id="nav-pill-marker" reduce={reduce} />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className={s.trigger}
              aria-label="Open command palette"
              onClick={openPalette}
            >
              <kbd>{cmdKey}K</kbd>
            </button>
          </nav>

          <button
            type="button"
            className={s.search}
            aria-label="Search"
            onClick={openPalette}
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </header>

      {!isGame && <Dock />}
    </>
  );
}
