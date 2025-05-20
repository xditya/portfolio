"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const active = usePathname() || "/";
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = React.useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/projects", label: "Projects" },
      { href: "/links", label: "Links" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  useEffect(() => {
    if (mobileMenuRef.current) {
      if (open) {
        gsap.to(mobileMenuRef.current, {
          height: "100vh",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        });
      }
    }
  }, [open]);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-[var(--background)]">
      <div className="w-full flex items-center pl-4 pr-4 py-4">
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
          <div
            className="hidden md:flex gap-2 relative ml-8 justify-center flex-1"
            style={{ minHeight: 44 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-semibold text-base tracking-wide font-sans transition-colors duration-200 relative z-10
                  ${
                    active === link.href
                      ? "bg-[var(--primary)] text-[var(--background)] shadow-inner"
                      : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--background)]"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden md:flex">
          <ThemeToggle />
        </div>
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            className="md:hidden flex items-center text-[var(--foreground)] text-3xl focus:outline-none"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={mobileMenuRef}
        className="md:hidden fixed inset-0 bg-[var(--background)] overflow-hidden flex flex-col items-center justify-center bg-opacity-95"
        style={{ height: 0, opacity: 0, top: "64px" }}
      >
        <div className="flex flex-col gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-3xl font-extrabold tracking-wide font-sans transition-colors duration-200
                ${
                  active === link.href
                    ? "text-[var(--primary)] drop-shadow-md"
                    : "text-[var(--foreground)] hover:text-[var(--accent)]"
                }
              `}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      className="group relative w-10 h-10 flex items-center justify-center focus:outline-none transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="sr-only">Toggle theme</span>
      <span className="absolute inset-0 flex items-center justify-center">
        <svg
          className="transition-all duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r={theme === "dark" ? 8 : 5}
            fill={theme === "dark" ? "var(--foreground)" : "var(--primary)"}
            className="transition-all duration-300"
          />
          <g
            className={`transition-all duration-300 ${
              theme === "dark" ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
          </g>
          {theme === "dark" && (
            <circle
              cx="16"
              cy="10"
              r="5"
              fill="var(--background)"
              className="transition-all duration-300"
            />
          )}
        </svg>
      </span>
    </button>
  );
}
