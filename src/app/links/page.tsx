"use client";

import Link from "next/link";

const LINKS = [
  { name: "Website Status", description: "Check the uptime of my services", href: "/status", external: false, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  )},
  { name: "Link Shortener", description: "Shorten your links easily", href: "https://short.xditya.me", external: true, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
  )},
  { name: "PasteBin", description: "Paste and share code snippets", href: "https://paste.xditya.me", external: true, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
  )},
  { name: "REST APIs", description: "A collection of REST APIs for various purposes", href: "https://apis.xditya.me", external: true, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" /></svg>
  )},
  { name: "Terms & Conditions", description: "Legal terms for freelance clients", href: "/terms", external: false, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  )},
];

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function LinksPage() {
  return (
    <div style={{ paddingTop: "80px" }}>
      <div className="container-md" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
        <div style={{ marginBottom: "48px" }}>
          <span className="badge badge-muted" style={{ marginBottom: "16px" }}>Links</span>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: "16px" }}>Resources & Tools</h1>
          <p style={{ fontSize: "17px", color: "var(--text-secondary)" }}>Useful links and tools I&apos;ve built or use.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {LINKS.map(({ name, description, href, external, icon }) => {
            const Tag = external ? "a" : Link;
            const extraProps = external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <Tag
                key={name}
                href={href}
                {...extraProps}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  padding: "20px 24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 200ms ease",
                  textDecoration: "none",
                  color: "inherit",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                }}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>{name}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{description}</div>
                </div>
                <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  {external ? <ExternalIcon /> : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  )}
                </div>
              </Tag>
            );
          })}
        </div>
      </div>
    </div>
  );
}
