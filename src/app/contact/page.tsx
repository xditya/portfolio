"use client";

import { useState, useEffect, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Footer from "@/components/Footer";
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import { FaTwitter, FaInstagram, FaTelegram, FaLinkedin } from "react-icons/fa";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Register the plugin
gsap.registerPlugin(ScrambleTextPlugin);

export default function ContactPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    socialHandle: "",
  });
  const [hcaptchaError, setHcaptchaError] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    details?: Array<{ field: string; message: string }>;
  }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const [showModal, setShowModal] = useState(false);
  const [highlightedIcon, setHighlightedIcon] = useState<string | null>(null); // State for highlighted icon

  useEffect(() => {
    // Check if hCaptcha site key is configured
    if (!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY) {
      setHcaptchaError(true);
      setStatus({
        type: "error",
        message:
          "hCaptcha is not properly configured. Please contact the administrator.",
      });
    }

    // Title animation
    if (titleRef.current) {
      gsap.set(titleRef.current, { visibility: "hidden" });
      gsap.to(titleRef.current, {
        duration: 1.5,
        scrambleText: {
          text: "Contact Me",
          chars: "lowerCase",
          revealDelay: 0.5,
          speed: 0.75,
        },
        visibility: "visible",
        ease: "power1.inOut",
        delay: 0.5,
      });
    }

    // Content fade in
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.8,
          ease: "power2.out",
        }
      );
    }
  }, []);

  // Function to normalize URL input
  const normalizeUrl = (url: string) => {
    let normalized = url.toLowerCase();
    // Remove http(s):// and www.
    normalized = normalized.replace(/^(https?:\/\/)?(www\.)?/, "");
    // Remove trailing slash
    normalized = normalized.replace(/\/+$/, "");
    return normalized;
  };

  // Function to check URL and set highlighted icon
  const checkHighlight = (value: string) => {
    const normalizedValue = normalizeUrl(value);

    if (normalizedValue.startsWith("twitter.com/")) {
      setHighlightedIcon("x");
    } else if (normalizedValue.startsWith("instagram.com/")) {
      setHighlightedIcon("instagram");
    } else if (normalizedValue.startsWith("t.me/")) {
      setHighlightedIcon("telegram");
    } else if (normalizedValue.startsWith("linkedin.com/in/")) {
      setHighlightedIcon("linkedin");
    } else {
      setHighlightedIcon(null);
    }
  };

  const handleSocialIconClick = (
    platform: "x" | "instagram" | "telegram" | "linkedin"
  ) => {
    let baseUrl = "";
    switch (platform) {
      case "x":
        baseUrl = "twitter.com/";
        break;
      case "instagram":
        baseUrl = "instagram.com/";
        break;
      case "telegram":
        baseUrl = "t.me/";
        break;
      case "linkedin":
        baseUrl = "linkedin.com/in/";
        break;
    }

    // Prefill only if the current input is empty or doesn't start with a known base URL pattern
    const isCurrentlyPrefilled = [
      "twitter.com/",
      "instagram.com/",
      "t.me/",
      "linkedin.com/in/",
    ].some((prefix) => formData.socialHandle.startsWith(prefix));

    if (!formData.socialHandle || isCurrentlyPrefilled) {
      setFormData({ ...formData, socialHandle: baseUrl });
    }
    // Always highlight the clicked icon
    setHighlightedIcon(platform);
  };

  const handleSocialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, socialHandle: value });
    checkHighlight(value); // Check and highlight based on input value
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      // Execute hCaptcha verification
      if (hcaptchaRef.current) {
        const { response: token } = await hcaptchaRef.current.execute({
          async: true,
        });
        if (!token) {
          throw new Error("Failed to verify captcha");
        }

        const requestBody = {
          ...formData,
          hcaptchaToken: token,
        };

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            data.details?.[0]?.message || data.error || "Something went wrong";
          throw new Error(errorMessage);
        }

        setStatus({
          type: "success",
          message: "Message sent successfully!",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          socialHandle: "",
        });
        setHighlightedIcon(null);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorWithDetails = error as Error & {
        details?: Array<{ field: string; message: string }>;
      };
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
        details: errorWithDetails.details,
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center mb-12">
            <button
              onClick={() => router.back()}
              className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors duration-200 absolute left-0"
              aria-label="Go back"
            >
              <IoArrowBack className="text-3xl" />
            </button>
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary)] text-center w-full"
            >
              Contact Me
            </h1>
          </div>

          <div ref={contentRef} className="space-y-8">
            {status.type && (
              <div
                className={`p-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <p className="font-medium">{status.message}</p>
                {status.details && status.details.length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {status.details.map((detail, index) => (
                      <li key={index}>{detail.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
                <label
                  htmlFor="name"
                  className="block text-xl font-semibold text-[var(--primary)] mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border-[var(--foreground)]/20 bg-[var(--background)] text-[var(--foreground)] text-lg p-4 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
                  <label
                    htmlFor="email"
                    className="block text-xl font-semibold text-[var(--primary)] mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border-[var(--foreground)]/20 bg-[var(--background)] text-[var(--foreground)] text-lg p-4 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all duration-300"
                    required
                  />
                </div>

                <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
                  <label
                    htmlFor="phone"
                    className="block text-xl font-semibold text-[var(--primary)] mb-2"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border-[var(--foreground)]/20 bg-[var(--background)] text-[var(--foreground)] text-lg p-4 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all duration-300"
                    placeholder="+91 9876543221"
                  />
                </div>
              </div>

              {/* Social Handle Section */}
              <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
                <label
                  htmlFor="socialHandle"
                  className="block text-xl font-semibold text-[var(--primary)] mb-2"
                >
                  Social Handle
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    id="socialHandle"
                    value={formData.socialHandle}
                    onChange={handleSocialInputChange}
                    className="flex-shrink-0 md:flex-grow rounded-lg border-[var(--foreground)]/20 bg-[var(--background)] text-[var(--foreground)] text-lg p-4 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all duration-300"
                    placeholder="Profile Link or Username"
                  />
                  <button
                    type="button"
                    onClick={() => handleSocialIconClick("x")}
                    aria-label="X (formerly Twitter)"
                  >
                    <FaTwitter
                      className={`text-xl cursor-pointer transition-colors ${
                        highlightedIcon === "x"
                          ? "text-[var(--primary)]"
                          : "text-[var(--foreground)]/50 hover:text-[var(--primary)]"
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialIconClick("instagram")}
                    aria-label="Instagram"
                  >
                    <FaInstagram
                      className={`text-xl cursor-pointer transition-colors ${
                        highlightedIcon === "instagram"
                          ? "text-[var(--primary)]"
                          : "text-[var(--foreground)]/50 hover:text-[var(--primary)]"
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialIconClick("telegram")}
                    aria-label="Telegram"
                  >
                    <FaTelegram
                      className={`text-xl cursor-pointer transition-colors ${
                        highlightedIcon === "telegram"
                          ? "text-[var(--primary)]"
                          : "text-[var(--foreground)]/50 hover:text-[var(--primary)]"
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialIconClick("linkedin")}
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin
                      className={`text-xl cursor-pointer transition-colors ${
                        highlightedIcon === "linkedin"
                          ? "text-[var(--primary)]"
                          : "text-[var(--foreground)]/50 hover:text-[var(--primary)]"
                      }`}
                    />
                  </button>
                </div>
                {highlightedIcon && !formData.socialHandle.includes("/") && (
                  <p className="mt-2 text-sm text-[var(--primary)]">
                    Enter only your username after the prefilled link.
                  </p>
                )}
              </div>

              <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
                <label
                  htmlFor="message"
                  className="block text-xl font-semibold text-[var(--primary)] mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={6}
                  className="mt-1 block w-full rounded-lg border-[var(--foreground)]/20 bg-[var(--background)] text-[var(--foreground)] text-lg p-4 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all duration-300 resize-none"
                  required
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || hcaptchaError}
                  className="w-full flex justify-center py-3 px-4 border border-[var(--primary)] rounded-lg text-lg font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                <p className="text-sm text-[var(--foreground)]/60 text-center mt-4">
                  This site is protected by hCaptcha and its{" "}
                  <a
                    href="https://www.hcaptcha.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://www.hcaptcha.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  apply.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <HCaptcha
        ref={hcaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
        size="invisible"
        onError={() => {
          setHcaptchaError(true);
          setStatus({
            type: "error",
            message: "Failed to verify captcha. Please try again.",
          });
          setShowModal(true);
        }}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--background)] p-8 rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
            >
              <IoCloseCircle className="text-2xl" />
            </button>

            <div className="text-center">
              {status.type === "success" ? (
                <IoCheckmarkCircle className="text-5xl text-green-500 mx-auto mb-4" />
              ) : (
                <IoCloseCircle className="text-5xl text-red-500 mx-auto mb-4" />
              )}

              <h3 className="text-2xl font-bold mb-4">
                {status.type === "success" ? "Success!" : "Error"}
              </h3>

              <p className="text-[var(--foreground)]/80 mb-6">
                {status.message}
              </p>

              {status.details && status.details.length > 0 && (
                <div className="text-left bg-[var(--foreground)]/5 rounded-lg p-4 mb-6">
                  <ul className="list-disc list-inside space-y-2">
                    {status.details.map((detail, index) => (
                      <li key={index} className="text-[var(--foreground)]/70">
                        {detail.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 px-4 bg-[var(--primary)] text-[var(--background)] rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors"
              >
                {status.type === "success" ? "Close" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
