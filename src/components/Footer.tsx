"use client";

import Link from "next/link";
import { event as trackEvent } from "@/lib/gtag";
import { profile, socials, footerLinks, currentYear } from "@/content";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container-x ${styles.signoff}`}>
        <p className={styles.eyebrow}>
          Have an idea?{" "}
          <span className={styles.available}>{profile.available}</span>
        </p>
        <Link
          href="/contact"
          className={`display-lg ${styles.cta}`}
          onClick={() =>
            trackEvent("cta_click", {
              cta_label: "Let's Talk",
              link_url: "/contact",
              source: "footer",
            })
          }
        >
          Let&apos;s talk
          <span className={styles.arrow} aria-hidden="true">
            {" "}
            ↗
          </span>
        </Link>
      </div>

      <div className={styles.bottom}>
        <div className={`container-x ${styles.bar}`}>
          <span className={styles.wordmark}>
            {profile.handle}
            <span className={styles.dot}>.</span>
          </span>

          <nav className={styles.links} aria-label="Footer">
            {footerLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={`link-u ${styles.link}`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className={styles.socials}>
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`link-u ${styles.social}`}
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

        <div className={`container-x ${styles.legal}`}>
          {`© ${currentYear} ${profile.name}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
