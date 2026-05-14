"use client";

import Link from "next/link";

const SOCIAL = [
  {
    label: "GitHub",
    href: "https://github.com/xditya",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/xditya",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com/xditya",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.066 2.25H8.79l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid var(--border)",
        padding: "32px 24px",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 800,
              fontSize: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--accent)" }}>x</span>ditya
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            © {year} Aditya. All rights reserved.
          </span>
        </div>

        {/* Center: links */}
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { href: "/about", label: "About" },
            { href: "/projects", label: "Projects" },
            { href: "/contact", label: "Contact" },
            { href: "/terms", label: "Terms" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                transition: "color 200ms ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-secondary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-muted)")
              }
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: socials */}
        <div style={{ display: "flex", gap: "12px" }}>
          {SOCIAL.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-primary)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(48,54,61,1)";
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-surface)";
              }}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
