"use client";

import Link from "next/link";
import { event as trackEvent } from "@/lib/gtag";

const SOCIAL = [
  { label: "GitHub", href: "https://github.com/xditya" },
  { label: "Telegram", href: "https://t.me/xditya" },
  { label: "X / Twitter", href: "https://twitter.com/xditya" },
  { label: "LinkedIn", href: "https://linkedin.com/in/xditya" },
  { label: "YouTube", href: "https://youtube.com/@xditya" },
];

const PAGES = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/links", label: "Links" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="hairline-t"
      style={{ position: "relative", zIndex: 2, marginTop: "clamp(80px, 12vw, 160px)" }}
    >
      {/* Big CTA */}
      <div className="container-x" style={{ paddingBlock: "clamp(64px, 10vw, 140px)" }}>
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          Have an idea? <span style={{ color: "var(--accent-soft)" }}>Available for work</span>
        </p>
        <Link
          href="/contact"
          className="footer-cta display-lg"
          onClick={() =>
            trackEvent("cta_click", {
              cta_label: "Let's Talk",
              link_url: "/contact",
              source: "footer",
            })
          }
          style={{ display: "inline-block" }}
        >
          Let&apos;s talk
          <span className="footer-cta-arrow" aria-hidden="true"> ↗</span>
        </Link>
      </div>

      {/* Bottom bar */}
      <div className="hairline-t">
        <div
          className="container-x"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            paddingBlock: "28px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "15px",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            xditya<span style={{ color: "var(--accent)" }}>.</span>
          </span>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {PAGES.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="link-u mono-sm"
                style={{ color: "var(--ink-dim)" }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {SOCIAL.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="link-u mono-sm"
                style={{ color: "var(--muted)" }}
                onClick={() =>
                  trackEvent("social_click", {
                    social_platform: label,
                    link_url: href,
                    source: "footer",
                  })
                }
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="container-x" style={{ paddingBottom: "28px" }}>
          <span className="mono-sm" style={{ color: "var(--muted)" }}>
            © {year} Aditya. All rights reserved.
          </span>
        </div>
      </div>

      <style>{`
        .footer-cta { color: var(--ink); transition: color 300ms ease; }
        .footer-cta:hover { color: var(--accent); }
        .footer-cta-arrow {
          display: inline-block;
          transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .footer-cta:hover .footer-cta-arrow { transform: translate(10px, -8px); }
      `}</style>
    </footer>
  );
}
