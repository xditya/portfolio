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

// A route change closes the sheet during render rather than in an effect, so
// Back or Forward to the route it was opened on cannot reopen it.
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

  // A row or Search closes silently instead, so a navigation reports only its nav_click.
  const closeSheet = useCallback(() => {
    setOpen(false);
    trackEvent("mobile_menu_toggle", { state: "close" });
  }, []);

  // Close past the phone breakpoint so the scroll lock does not linger behind a hidden sheet.
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

      <MoreSheet
        open={open}
        onClose={closeSheet}
        onDismiss={() => setOpen(false)}
        returnFocus={moreRef}
      />
    </>
  );
}
