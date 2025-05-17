"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string>(
    typeof window !== "undefined" ? window.location.hash || "#" : "#"
  );
  const [indicatorStyle, setIndicatorStyle] =
    React.useState<React.CSSProperties>({});
  const linkRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onHashChange = () => setActive(window.location.hash || "#");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navLinks = React.useMemo(
    () => [
      { href: "#", label: "Home" },
      { href: "#projects", label: "Projects" },
      { href: "#about", label: "About" },
      { href: "#contact", label: "Contact" },
    ],
    []
  );

  React.useEffect(() => {
    const idx = navLinks.findIndex(
      (link) => active === link.href || (link.href === "#" && active === "#")
    );
    const linkEl = linkRefs.current[idx];
    const containerEl = containerRef.current;
    if (linkEl && containerEl) {
      const linkRect = linkEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      setIndicatorStyle({
        left: linkRect.left - containerRect.left + containerEl.scrollLeft,
        top: linkRect.top - containerRect.top + containerEl.scrollTop,
        width: linkRect.width,
        height: linkRect.height,
      });
    }
  }, [active, navLinks, open]);

  // Update on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        const idx = navLinks.findIndex(
          (link) =>
            active === link.href || (link.href === "#" && active === "#")
        );
        const linkEl = linkRefs.current[idx];
        const containerEl = containerRef.current;
        if (linkEl && containerEl) {
          const linkRect = linkEl.getBoundingClientRect();
          const containerRect = containerEl.getBoundingClientRect();
          setIndicatorStyle({
            left: linkRect.left - containerRect.left + containerEl.scrollLeft,
            top: linkRect.top - containerRect.top + containerEl.scrollTop,
            width: linkRect.width,
            height: linkRect.height,
          });
        }
      }, 50);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [active, navLinks]);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-[var(--background)]">
      <div className="w-full flex items-center pl-4 pr-4 py-3">
        <div className="flex items-center flex-1">
          <Link href="/#" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded"
            />
            {/* <span className="hidden sm:block text-xl font-bold text-white">
              Aditya S
            </span> */}
          </Link>
          <div
            className="hidden md:flex gap-2 relative ml-8"
            ref={containerRef}
            style={{ minHeight: 44 }}
          >
            {/* Sliding indicator */}
            <div
              className="absolute bg-[var(--primary)] rounded-lg shadow-inner transition-all duration-300"
              style={{
                ...indicatorStyle,
                zIndex: 0,
                pointerEvents: "none",
                transitionProperty:
                  "left, top, width, height, background-color",
              }}
            />
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-base tracking-wide font-sans transition-colors duration-200 relative z-10
                  ${
                    active === link.href ||
                    (link.href === "#" && active === "#")
                      ? "text-[var(--background)]"
                      : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--background)]"
                  }
                `}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        {/* Desktop: theme toggle at right end */}
        <div className="hidden md:flex">
          <ThemeToggle />
        </div>
        {/* Mobile: theme toggle before hamburger */}
        <div className="flex md:hidden items-center gap-2 ml-2">
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
      {open && (
        <div className="md:hidden bg-[#181820] px-4 pb-4 flex flex-col gap-2 animate-fade-in-down">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg font-semibold text-base tracking-wide font-sans transition-colors duration-200 relative z-10
                ${
                  active === link.href || (link.href === "#" && active === "#")
                    ? "bg-[var(--primary)] text-[var(--background)] shadow-inner"
                    : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--background)]"
                }
              `}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
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

  useEffect(() => {
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
        {/* Animated sun/moon icon */}
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
          {/* Sun rays */}
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
          {/* Moon cutout */}
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
