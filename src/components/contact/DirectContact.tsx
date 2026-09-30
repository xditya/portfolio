"use client";

import { useEffect, useRef, useState } from "react";
import { event as trackEvent } from "@/lib/gtag";
import { profile, social, bareUrl } from "@/content";
import s from "./DirectContact.module.css";

const telegram = social("Telegram");
const github = social("GitHub");

// Email opens the mail app, so it stays in this tab. The other two are
// external pages and open a new one.
const directLinks = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, newTab: false },
  { label: "Telegram", value: bareUrl(telegram.href), href: telegram.href, newTab: true },
  { label: "GitHub", value: bareUrl(github.href), href: github.href, newTab: true },
];

// Copies the address and shows "Copied" for two seconds. A short blur masks
// each label swap (the .copy-btn styles in globals.css).
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [swap, setSwap] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    trackEvent("contact_email_copy", { source: "contact_info" });
    setSwap(true);
    later(() => {
      setCopied(true);
      setSwap(false);
    }, 120);
    later(() => {
      setSwap(true);
      later(() => {
        setCopied(false);
        setSwap(false);
      }, 120);
    }, 2000);
  };

  return (
    <button
      type="button"
      className={`copy-btn ${s.copy}`}
      data-copied={copied}
      data-swap={swap}
      onClick={copy}
      aria-live="polite"
    >
      <span className="copy-btn-label">{copied ? "✓ Copied" : "Copy"}</span>
    </button>
  );
}

export default function DirectContact() {
  return (
    <div className={s.block}>
      <ul className={s.list} role="list">
        {directLinks.map(({ label, value, href, newTab }) => (
          <li key={label} className={s.row}>
            <span className={s.label}>{label}</span>
            <span className={s.value}>
              <a
                href={href}
                className={`link-u ${s.link}`}
                {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
                onClick={() =>
                  trackEvent("contact_direct_link_click", {
                    link_label: label,
                    link_url: href,
                    source: "contact_info",
                  })
                }
              >
                {value}
              </a>
              {label === "Email" && <CopyButton text={value} />}
            </span>
          </li>
        ))}
      </ul>

      <p className={`body-lg ${s.note}`}>
        Currently <strong className={s.strong}>available for freelance work</strong> and open
        source collaborations.
      </p>
    </div>
  );
}
