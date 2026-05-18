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
        fill={active ? "var(--accent)" : "var(--text-muted)"}
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
        fill={active ? "var(--accent)" : "var(--text-muted)"}
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
        fill={active ? "var(--accent)" : "var(--text-muted)"}
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
        fill={active ? "var(--accent)" : "var(--text-muted)"}
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

function InputField({
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
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          marginBottom: "8px",
        }}
      >
        {label} {required && <span style={{ color: "var(--accent)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  fontSize: "14px",
  fontFamily: "'Space Grotesk', sans-serif",
  outline: "none",
  transition: "border-color 200ms ease",
};

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
    <div style={{ paddingTop: "80px" }}>
      <div
        className="container-wide"
        style={{ paddingTop: "48px", paddingBottom: "80px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "48px", maxWidth: "600px" }}>
          <span className="badge badge-muted" style={{ marginBottom: "16px" }}>
            Contact
          </span>
          <h1
            style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: "16px" }}
          >
            Get In Touch
          </h1>
          <p style={{ fontSize: "17px", color: "var(--text-secondary)" }}>
            Send me a message and I&apos;ll respond as soon as possible.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "48px",
            alignItems: "start",
          }}
          className="contact-grid"
        >
          {/* Left Info Panel */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            <div className="card" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "20px" }}>
                Direct contact
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
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
                  <div key={label}>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "4px",
                      }}
                    >
                      {label}
                    </p>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        fontFamily: "'JetBrains Mono',monospace",
                        cursor: "pointer",
                        transition: "color 200ms ease",
                      }}
                      onClick={() =>
                        trackEvent("contact_direct_link_click", {
                          link_label: label,
                          link_url: href,
                          source: "contact_info",
                        })
                      }
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--accent)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--text-secondary)")
                      }
                    >
                      {value}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: "28px",
                borderLeft: "2px solid var(--accent-border)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginBottom: "12px",
                }}
                className="pulse"
              />
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Currently{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  available for freelance work
                </strong>{" "}
                and open source collaborations.
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
              className="form-row"
            >
              <InputField label="Name" id="name" required>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "var(--accent-border)")
                  }
                  onBlur={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)")
                  }
                />
              </InputField>
              <InputField label="Email" id="email" required>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "var(--accent-border)")
                  }
                  onBlur={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)")
                  }
                />
              </InputField>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
              className="form-row"
            >
              <InputField label="Phone" id="phone">
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (234) 567-8900"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "var(--accent-border)")
                  }
                  onBlur={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)")
                  }
                />
              </InputField>
              <InputField label="Social Handle" id="socialHandle">
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
                    style={{ ...inputStyle, paddingRight: "120px" }}
                    onFocus={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor =
                        "var(--accent-border)")
                    }
                    onBlur={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border)")
                    }
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      gap: "8px",
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
              </InputField>
            </div>

            <InputField label="Message" id="message" required>
              <textarea
                id="message"
                required
                rows={6}
                placeholder="Your message here..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "140px",
                }}
                onFocus={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--accent-border)")
                }
                onBlur={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)")
                }
              />
            </InputField>

            <button
              type="submit"
              disabled={isSubmitting || hcaptchaError}
              className="btn btn-primary"
              style={{
                alignSelf: "flex-start",
                opacity: isSubmitting || hcaptchaError ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spin"
                    style={{
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(0,0,0,0.2)",
                      borderTopColor: "#000",
                      borderRadius: "50%",
                    }}
                  />{" "}
                  Sending...
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>{" "}
                  Send Message
                </>
              )}
            </button>

            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Protected by hCaptcha —{" "}
              <a
                href="https://www.hcaptcha.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", cursor: "pointer" }}
              >
                Privacy Policy
              </a>
              {" & "}
              <a
                href="https://www.hcaptcha.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", cursor: "pointer" }}
              >
                Terms
              </a>
            </p>
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
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "40px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background:
                  modal.type === "success"
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                border: `1px solid ${modal.type === "success" ? "var(--accent-border)" : "rgba(239,68,68,0.3)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              {modal.type === "success" ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>
              {modal.type === "success" ? "Message Sent!" : "Error"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                marginBottom: "24px",
              }}
            >
              {modal.message}
            </p>
            <button
              onClick={() => setModal(null)}
              className={`btn ${modal.type === "success" ? "btn-primary" : "btn-ghost"}`}
              style={{ width: "100%" }}
            >
              {modal.type === "success" ? "Done" : "Try Again"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .contact-grid { grid-template-columns: 1fr 1.6fr !important; }
        .form-row { grid-template-columns: 1fr 1fr !important; }
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
