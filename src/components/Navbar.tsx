"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { event as trackEvent } from "@/lib/gtag";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/links", label: "Links" },
  { href: "/game", label: "Game" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cmdKey, setCmdKey] = useState("⌘");

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform ?? "")) setCmdKey("Ctrl+");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Dispatch event + lock body scroll while the overlay is open
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("mobileMenuToggle", { detail: { open: menuOpen } }),
    );
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 102,
          background:
            scrolled && !menuOpen ? "rgba(5, 6, 10, 0.82)" : "transparent",
          backdropFilter: scrolled && !menuOpen ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled && !menuOpen ? "blur(14px)" : "none",
          borderBottom:
            scrolled && !menuOpen
              ? "1px solid var(--line)"
              : "1px solid transparent",
          transition: "background 300ms ease, border-color 300ms ease",
        }}
      >
        <nav
          className="container-x"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
          }}
        >
          {/* Wordmark */}
          <Link
            href="/"
            onClick={() =>
              trackEvent("nav_click", {
                link_label: "Home",
                link_url: "/",
                source: "logo",
              })
            }
            aria-label="xditya — home"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "18px",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "baseline",
              zIndex: 102,
              position: "relative",
            }}
          >
            xditya
            <span style={{ color: "var(--accent)" }}>.</span>
          </Link>

          {/* Desktop links */}
          <div
            className="nav-desktop"
            style={{ display: "flex", alignItems: "center", gap: "32px" }}
          >
            {NAV_LINKS.map(({ href, label }, i) => (
              <Link
                key={href}
                href={href}
                className="link-u"
                onClick={() =>
                  trackEvent("nav_click", {
                    link_label: label,
                    link_url: href,
                    source: "desktop",
                  })
                }
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: isActive(href) ? "var(--accent-soft)" : "var(--ink-dim)",
                }}
              >
                <span style={{ color: "var(--muted)", marginRight: "6px" }}>
                  0{i + 1}
                </span>
                {label}
              </Link>
            ))}
            <button
              className="cmdk-trigger"
              onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
              aria-label="Open command palette"
            >
              <SearchIcon />
              <kbd style={{ fontFamily: "inherit" }}>{cmdKey}K</kbd>
            </button>
          </div>

          {/* Mobile: search + hamburger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
            aria-label="Search"
            className="nav-burger"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: "var(--ink-dim)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 102,
              position: "relative",
              marginLeft: "auto",
              marginRight: "4px",
            }}
          >
            <SearchIcon size={18} />
          </button>

          {/* Hamburger */}
          <button
            onClick={() => {
              const nextOpen = !menuOpen;
              setMenuOpen(nextOpen);
              trackEvent("mobile_menu_toggle", {
                state: nextOpen ? "open" : "close",
              });
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="nav-burger"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: "var(--ink)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 102,
              position: "relative",
            }}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </nav>
      </header>

      {/* Full-screen overlay menu */}
      <div
        aria-hidden={!menuOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 101,
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(24px, 8vw, 80px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity 350ms ease",
        }}
      >
        {NAV_LINKS.map(({ href, label }, i) => (
          <Link
            key={href}
            href={href}
            onClick={() =>
              trackEvent("nav_click", {
                link_label: label,
                link_url: href,
                source: "mobile_overlay",
              })
            }
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(40px, 11vw, 72px)",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              lineHeight: 1.15,
              color: isActive(href) ? "var(--accent)" : "var(--ink)",
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              borderBottom: "1px solid var(--line)",
              padding: "14px 0",
              transform: menuOpen ? "translateY(0)" : "translateY(28px)",
              opacity: menuOpen ? 1 : 0,
              transition: `transform 450ms cubic-bezier(0.22,1,0.36,1) ${i * 55}ms, opacity 450ms ease ${i * 55}ms, color 250ms ease`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono-stack)",
                fontWeight: 400,
                fontSize: "13px",
                letterSpacing: "0.15em",
                color: "var(--muted)",
              }}
            >
              0{i + 1}
            </span>
            {label}
          </Link>
        ))}

        <div
          className="mono-label"
          style={{ position: "absolute", bottom: "32px", left: "clamp(24px, 8vw, 80px)" }}
        >
          © {new Date().getFullYear()} Aditya — Kerala, India
        </div>
      </div>

      {/* Responsive switch */}
      <style>{`
        @media (max-width: 720px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="3"
        y1={open ? "11" : "7"}
        x2="19"
        y2={open ? "11" : "7"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          transform: open ? "rotate(45deg)" : "none",
          transformOrigin: "11px 11px",
          transition: "all 300ms ease",
        }}
      />
      <line
        x1="3"
        y1={open ? "11" : "15"}
        x2="19"
        y2={open ? "11" : "15"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          transform: open ? "rotate(-45deg)" : "none",
          transformOrigin: "11px 11px",
          transition: "all 300ms ease",
        }}
      />
    </svg>
  );
}
