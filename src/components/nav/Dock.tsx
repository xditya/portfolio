"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { event as trackEvent } from "@/lib/gtag";
import Marker from "./Marker";
import MoreSheet from "./MoreSheet";
import { dockItems, isActivePath, moreItems } from "./shared";
import s from "./Dock.module.css";

// Phone only (CSS hides it above 760px). Five equal cells: four pages and
// More, which opens the sheet. A route change closes the sheet for good: the
// last seen path is kept in state and reconciled during render (React's
// "adjust state when a prop changes" pattern), so no effect runs and the
// sheet cannot come back on its own when Back or Forward returns to the
// route it was opened on.
export default function Dock() {
  const pathname = usePathname();
  const reduce = useReducedMotion() === true;
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const moreRef = useRef<HTMLButtonElement>(null);

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (open) setOpen(false);
  }

  const moreActive = moreItems.some((item) => isActivePath(pathname, item.href));

  const toggleSheet = () => {
    const next = !open;
    setOpen(next);
    trackEvent("mobile_menu_toggle", { state: next ? "open" : "close" });
  };

  // Every user-initiated close (backdrop, Esc, Close, a row) goes through
  // here; the route-change close above stays silent, like the old overlay.
  const closeSheet = useCallback(() => {
    setOpen(false);
    trackEvent("mobile_menu_toggle", { state: "close" });
  }, []);

  // If the window grows past the phone breakpoint while the sheet is open,
  // drop it so the scroll lock does not linger behind a hidden sheet.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <nav className={s.dock} aria-label="Primary">
        <ul className={s.list}>
          {dockItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href} className={s.cell}>
                <Link
                  href={item.href}
                  className={s.item}
                  aria-current={active ? "page" : undefined}
                  onClick={() =>
                    trackEvent("nav_click", {
                      link_label: item.label,
                      link_url: item.href,
                      source: "dock",
                    })
                  }
                >
                  {active && <Marker id="nav-dock-marker" reduce={reduce} />}
                  <span className={s.label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className={s.cell}>
            <button
              ref={moreRef}
              type="button"
              className={s.item}
              aria-expanded={open}
              data-active={moreActive || undefined}
              aria-haspopup="dialog"
              aria-controls={open ? "nav-more-sheet" : undefined}
              onClick={toggleSheet}
            >
              {moreActive && <Marker id="nav-dock-marker" reduce={reduce} />}
              <span className={s.label}>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <MoreSheet open={open} onClose={closeSheet} returnFocus={moreRef} />
    </>
  );
}
