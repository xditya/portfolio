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
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Dispatch event for home page hero
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
      {/* Desktop + Mobile Navbar */}
      <header
        style={{
          position: "fixed",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          width: "calc(100% - 32px)",
          maxWidth: "860px",
          transition: "all 300ms ease",
        }}
      >
        <nav
          style={{
            background: scrolled
              ? "rgba(6, 8, 11, 0.88)"
              : "rgba(6, 8, 11, 0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(48, 54, 61, 0.9)",
            borderRadius: "14px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.4)"
              : "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 300ms ease",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={() =>
              trackEvent("nav_click", {
                link_label: "Home",
                link_url: "/",
                source: "logo",
              })
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              flexShrink: 0,
            }}
            aria-label="xditya — home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="logo"
              width={28}
              height={28}
              style={{
                width: "28px",
                height: "28px",
                objectFit: "contain",
                filter: "brightness(3) saturate(0.7)",
              }}
            />
            <span
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontWeight: 800,
                fontSize: "17px",
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Aditya
            </span>
          </Link>

          {/* Desktop Links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            className="hidden-mobile"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() =>
                  trackEvent("nav_click", {
                    link_label: label,
                    link_url: href,
                    source: "desktop",
                  })
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isActive(href)
                    ? "var(--accent)"
                    : "var(--text-secondary)",
                  background: isActive(href)
                    ? "var(--accent-glow)"
                    : "transparent",
                  border: isActive(href)
                    ? "1px solid var(--accent-border)"
                    : "1px solid transparent",
                  transition: "all 200ms ease",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(href)) {
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-primary)";
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--bg-elevated)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(href)) {
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
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
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "var(--text-primary)",
              borderRadius: "6px",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="show-mobile"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(6, 8, 11, 0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity 300ms ease",
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
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 700,
              fontSize: "32px",
              letterSpacing: "-0.02em",
              color: isActive(href) ? "var(--accent)" : "var(--text-secondary)",
              textDecoration: "none",
              padding: "12px 32px",
              borderRadius: "12px",
              transition: "all 200ms ease",
              transform: menuOpen
                ? "translateY(0)"
                : `translateY(${20 * (i + 1)}px)`,
              opacity: menuOpen ? 1 : 0,
              transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
            }}
          >
            {label}
          </Link>
        ))}

        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "13px",
            color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          © {new Date().getFullYear()} Aditya
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .hidden-mobile { display: flex; }
        .show-mobile   { display: none !important; }
        @media (max-width: 680px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="3"
        y1={open ? "11" : "6"}
        x2="19"
        y2={open ? "11" : "6"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          transform: open ? "rotate(45deg)" : "none",
          transformOrigin: "11px 11px",
          transition: "all 300ms ease",
        }}
      />
      {!open && (
        <line
          x1="3"
          y1="11"
          x2="19"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
      <line
        x1="3"
        y1={open ? "11" : "16"}
        x2="19"
        y2={open ? "11" : "16"}
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
