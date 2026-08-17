"use client";

import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { event as trackEvent } from "@/lib/gtag";

const SOCIAL_PLATFORMS = [
  {
    key: "x",
    label: "X / Twitter",
    baseUrl: "twitter.com/",
    icon: (active: boolean) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? "var(--accent-soft)" : "var(--muted)"}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.066 2.25H8.79l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    baseUrl: "instagram.com/",
    icon: (active: boolean) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? "var(--accent-soft)" : "var(--muted)"}
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    key: "telegram",
    label: "Telegram",
    baseUrl: "t.me/",
    icon: (active: boolean) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? "var(--accent-soft)" : "var(--muted)"}
      >
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    baseUrl: "linkedin.com/in/",
    icon: (active: boolean) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? "var(--accent-soft)" : "var(--muted)"}
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [swap, setSwap] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    trackEvent("contact_email_copy", { source: "contact_info" });
    // brief blur masks the label crossfade
    setSwap(true);
    setTimeout(() => {
      setCopied(true);
      setSwap(false);
    }, 120);
    setTimeout(() => {
      setSwap(true);
      setTimeout(() => {
        setCopied(false);
        setSwap(false);
      }, 120);
    }, 2000);
  };

  return (
    <button className="copy-btn" data-copied={copied} data-swap={swap} onClick={copy} aria-live="polite">
      <span className="copy-btn-label">{copied ? "✓ Copied" : "Copy"}</span>
    </button>
  );
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mono-label"
        style={{ display: "block", marginBottom: "4px" }}
      >
        {label}{" "}
        {required && <span style={{ color: "var(--accent-soft)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    socialHandle: "",
  });
  const [highlightedIcon, setHighlightedIcon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const [hcaptchaError, setHcaptchaError] = useState(false);

  const normalizeUrl = (url: string) =>
    url
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/+$/, "");

  const checkHighlight = (value: string) => {
    const n = normalizeUrl(value);
    const match = SOCIAL_PLATFORMS.find((p) => n.startsWith(p.baseUrl));
    setHighlightedIcon(match?.key ?? null);
  };

  const handleSocialIconClick = (platform: string) => {
    const p = SOCIAL_PLATFORMS.find((x) => x.key === platform);
    if (!p) return;
    const knownPrefixes = SOCIAL_PLATFORMS.map((x) => x.baseUrl);
    const isAlreadyPrefilled = knownPrefixes.some((prefix) =>
      formData.socialHandle.startsWith(prefix),
    );
    if (!formData.socialHandle || isAlreadyPrefilled) {
      setFormData({ ...formData, socialHandle: p.baseUrl });
    }
    trackEvent("contact_social_prefill_click", {
      social_platform: p.label,
      source: "contact_form",
    });
    setHighlightedIcon(platform);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    trackEvent("contact_form_submit_attempt", {
      source: "contact_page",
    });
    try {
      if (hcaptchaRef.current) {
        const { response: token } = await hcaptchaRef.current.execute({
          async: true,
        });
        if (!token) throw new Error("Failed to verify captcha");
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, hcaptchaToken: token }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.details?.[0]?.message || data.error || "Something went wrong",
          );
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          socialHandle: "",
        });
        setHighlightedIcon(null);
        trackEvent("contact_form_submit", {
          status: "success",
          source: "contact_page",
        });
        setModal({
          open: true,
          type: "success",
          message: "Your message has been sent. I'll get back to you soon.",
        });
        setTimeout(() => setModal(null), 4000);
      }
    } catch (err) {
      trackEvent("contact_form_submit", {
        status: "error",
        source: "contact_page",
      });
      setModal({
        open: true,
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: "110px" }}>
      <div className="container-x" style={{ paddingBottom: "40px" }}>
        {/* Header */}
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          Contact · Usually replies within a day
        </p>
        <h1 className="display-lg" style={{ marginBottom: "28px" }}>
          Say hi<span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <p className="body-lg" style={{ maxWidth: "520px", margin: 0 }}>
          Send me a message and I&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="container-x">
        <div
          className="contact-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "clamp(40px, 6vw, 96px)",
            alignItems: "start",
            paddingTop: "32px",
          }}
        >
          {/* ── Left: direct contact ── */}
          <div>
            <div className="hairline-t" style={{ paddingTop: "28px" }}>
              {[
                {
                  label: "Email",
                  value: "contact@xditya.me",
                  href: "mailto:contact@xditya.me",
                },
                {
                  label: "Telegram",
                  value: "t.me/xditya",
                  href: "https://t.me/xditya",
                },
                {
                  label: "GitHub",
                  value: "github.com/xditya",
                  href: "https://github.com/xditya",
                },
              ].map(({ label, value, href }) => (
                <div key={label} style={{ marginBottom: "28px" }}>
                  <p className="mono-label" style={{ marginBottom: "6px" }}>
                    {label}
                  </p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-u"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "clamp(16px, 1.8vw, 22px)",
                        letterSpacing: "-0.01em",
                        color: "var(--ink)",
                      }}
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
                </div>
              ))}
            </div>

            <div
              className="hairline-t"
              style={{ paddingTop: "28px", marginTop: "12px" }}
            >
              <span
                className="pulse"
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginBottom: "14px",
                }}
              />
              <p className="body-lg" style={{ margin: 0, maxWidth: "320px" }}>
                Currently{" "}
                <strong style={{ color: "var(--ink)" }}>
                  available for freelance work
                </strong>{" "}
                and open source collaborations.
              </p>
            </div>
          </div>

          {/* ── Right: form ── */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            <div
              className="form-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "32px",
              }}
            >
              <Field label="Name" id="name" required>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="field-u"
                />
              </Field>
              <Field label="Email" id="email" required>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="field-u"
                />
              </Field>
            </div>

            <div
              className="form-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "32px",
              }}
            >
              <Field label="Phone" id="phone">
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (234) 567-8900"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="field-u"
                />
              </Field>
              <Field label="Social Handle" id="socialHandle">
                <div style={{ position: "relative" }}>
                  <input
                    id="socialHandle"
                    type="text"
                    placeholder="twitter.com/username"
                    value={formData.socialHandle}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        socialHandle: e.target.value,
                      });
                      checkHighlight(e.target.value);
                    }}
                    className="field-u"
                    style={{ paddingRight: "120px" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "2px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    {SOCIAL_PLATFORMS.map(({ key, label, icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSocialIconClick(key)}
                        aria-label={label}
                        title={label}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          opacity: highlightedIcon === key ? 1 : 0.5,
                          transition: "opacity 200ms ease",
                        }}
                      >
                        {icon(highlightedIcon === key)}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>
            </div>

            <Field label="Message" id="message" required>
              <textarea
                id="message"
                required
                rows={5}
                placeholder="Your message here..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="field-u"
                style={{ resize: "vertical", minHeight: "120px" }}
              />
            </Field>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "24px",
              }}
            >
              <button
                type="submit"
                disabled={isSubmitting || hcaptchaError}
                className="btn-fill"
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spin"
                      style={{
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                      }}
                    />{" "}
                    Sending...
                  </>
                ) : (
                  <>Send Message ↗</>
                )}
              </button>

              <p className="mono-sm" style={{ color: "var(--muted)", margin: 0 }}>
                Protected by hCaptcha ·{" "}
                <a
                  href="https://www.hcaptcha.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-u"
                  style={{ color: "var(--ink-dim)" }}
                >
                  Privacy
                </a>
                {" & "}
                <a
                  href="https://www.hcaptcha.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-u"
                  style={{ color: "var(--ink-dim)" }}
                >
                  Terms
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* hCaptcha (invisible) */}
      <HCaptcha
        ref={hcaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
        size="invisible"
        onError={() => {
          setHcaptchaError(true);
        }}
      />

      {/* Modal */}
      {modal?.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5,6,10,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--line-strong)",
              borderRadius: "20px",
              padding: "clamp(32px, 5vw, 48px)",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <p
              className="mono-label"
              style={{
                marginBottom: "16px",
                color:
                  modal.type === "success" ? "var(--accent-soft)" : "#f87171",
              }}
            >
              {modal.type === "success" ? "// message sent" : "// error"}
            </p>
            <h3
              style={{
                fontSize: "clamp(24px, 3vw, 32px)",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              {modal.type === "success" ? "Thank you!" : "Try again"}
            </h3>
            <p className="body-lg" style={{ marginTop: 0, marginBottom: "28px" }}>
              {modal.message}
            </p>
            <button
              onClick={() => setModal(null)}
              className={modal.type === "success" ? "btn-fill" : "btn-line"}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {modal.type === "success" ? "Done" : "Close"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
