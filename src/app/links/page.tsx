"use client";

import Link from "next/link";

const LINKS = [
  { name: "Website Status", description: "Check the uptime of my services", href: "/status", external: false },
  { name: "Link Shortener", description: "Shorten your links easily", href: "https://short.xditya.me", external: true },
  { name: "PasteBin", description: "Paste and share code snippets", href: "https://paste.xditya.me", external: true },
  { name: "REST APIs", description: "A collection of REST APIs for various purposes", href: "https://apis.xditya.me", external: true },
  { name: "Terms & Conditions", description: "Legal terms for freelance clients", href: "/terms", external: false },
];

export default function LinksPage() {
  return (
    <div style={{ paddingTop: "110px" }}>
      <div className="container-x" style={{ paddingBottom: "40px" }}>
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          Index — Tools &amp; services
        </p>
        <h1 className="display-lg" style={{ marginBottom: "28px" }}>
          Links
        </h1>
        <p className="body-lg" style={{ maxWidth: "520px", margin: 0 }}>
          Useful links and tools I&apos;ve built or use.
        </p>
      </div>

      <div className="container-x" style={{ paddingTop: "32px" }}>
        <div>
          {LINKS.map(({ name, description, href, external }, i) => {
            const inner = (
              <>
                <span className="idx-dim mono-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span
                    className="idx-title"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "clamp(18px, 2.6vw, 30px)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                    }}
                  >
                    {name}
                  </span>
                  <span
                    className="idx-dim mono-sm"
                    style={{ display: "block", marginTop: "6px" }}
                  >
                    {description}
                  </span>
                </span>
                <span className="idx-tech idx-dim mono-sm">
                  {external ? "external" : "internal"}
                </span>
                <span
                  className="idx-arrow"
                  aria-hidden="true"
                  style={{ fontSize: "20px", lineHeight: 1, justifySelf: "end" }}
                >
                  ↗
                </span>
              </>
            );

            return external ? (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="idx-row"
              >
                {inner}
              </a>
            ) : (
              <Link key={name} href={href} className="idx-row">
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
