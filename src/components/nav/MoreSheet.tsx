"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { event as trackEvent } from "@/lib/gtag";
import { SearchIcon } from "./Icons";
import { EASE_OUT, INSTANT, isActivePath, moreItems, openPalette } from "./shared";
import s from "./MoreSheet.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Closes without the menu toggle event, for a row or Search. */
  onDismiss: () => void;
  /** The More button, which takes focus back when the sheet closes. */
  returnFocus: RefObject<HTMLButtonElement | null>;
};

const FOCUSABLE = 'a[href], button:not([disabled])';

// Bottom sheet behind the dock's More cell. Slides up over a dimmed page,
// traps focus while open, and closes on Esc, backdrop tap, Close, a row,
// or a route change (handled by the parent).
export default function MoreSheet({ open, onClose, onDismiss, returnFocus }: Props) {
  const pathname = usePathname();
  const reduce = useReducedMotion() === true;
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    // Captured now: the button that opened the sheet gets focus back on close.
    const trigger = returnFocus.current;
    sheet?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // The palette shortcut closes the sheet first, so the two scroll locks
      // never overlap: this cleanup puts the overflow back before the
      // palette records it.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === sheet)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Capture phase: this runs ahead of the palette's own window listener.
    // React commits each listener's update before the next listener fires,
    // so in the bubble phase the palette would open (and record the locked
    // overflow) while the sheet was still holding it.
    window.addEventListener("keydown", onKey, true);

    // Lock page scroll. Both elements are set because html carries
    // overflow-x: clip, which stops body's overflow propagating to the viewport.
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey, true);
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
      trigger?.focus({ preventScroll: true });
    };
  }, [open, onClose, returnFocus]);

  const transition = reduce ? INSTANT : { duration: 0.24, ease: EASE_OUT };
  // Leaving is quicker than arriving.
  const exitTransition = reduce ? INSTANT : { duration: 0.16, ease: EASE_OUT };

  // The wrapper sits outside AnimatePresence, so it always carries the live
  // `open` value and the stylesheet can take pointer events off the layers
  // while they animate out. Its children are fixed; it takes no space.
  // data-lenis-prevent keeps wheel events over the open sheet out of Lenis,
  // which scrolls the page in script and ignores the overflow lock.
  return (
    <div className={s.layer} data-open={open}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className={s.backdrop}
            data-lenis-prevent=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: exitTransition }}
            transition={transition}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        {open && (
          <motion.div
            key="sheet"
            ref={sheetRef}
            id="nav-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nav-more-title"
            tabIndex={-1}
            className={s.sheet}
            data-lenis-prevent=""
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            exit={{ y: "115%", transition: exitTransition }}
            transition={transition}
          >
            <div className={s.head}>
              <h2 id="nav-more-title" className={s.title}>
                More
              </h2>
              <button type="button" className={s.close} onClick={onClose}>
                Close
              </button>
            </div>
            <ul className={s.list}>
              {moreItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={s.row}
                    aria-current={
                      isActivePath(pathname, item.href) ? "page" : undefined
                    }
                    onClick={() => {
                      trackEvent("nav_click", {
                        link_label: item.label,
                        link_url: item.href,
                        source: "dock_more",
                      });
                      onDismiss();
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className={s.searchCell}>
                <button
                  type="button"
                  className={`${s.row} ${s.search}`}
                  onClick={() => {
                    onDismiss();
                    openPalette();
                  }}
                >
                  <SearchIcon size={18} />
                  Search
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
