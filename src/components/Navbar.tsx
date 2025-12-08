"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const active = usePathname() || "/";
  const menuRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [active]);

  // Prevent body scroll when menu is open & dispatch event for page animations
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open } }));
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Animate links on open
  useEffect(() => {
    if (open) {
      linkRefs.current.forEach((link, i) => {
        if (link) {
          link.style.opacity = "0";
          link.style.transform = "translateY(20px)";
          setTimeout(() => {
            link.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            link.style.opacity = "1";
            link.style.transform = "translateY(0)";
          }, 80 + i * 60);
        }
      });
    }
  }, [open]);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-[var(--background)]">
      <div className="w-full flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 z-50">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded"
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
        
        {/* Desktop nav */}
        <div
          className="hidden md:flex gap-2 absolute left-1/2 -translate-x-1/2"
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

        <div className="hidden md:flex">
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-3 z-50">
          <ThemeToggle />
          <button
            className="flex items-center justify-center w-10 h-10 text-[var(--foreground)] focus:outline-none relative"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {/* Animated hamburger */}
            <div className="w-6 h-5 flex flex-col justify-between items-center">
              <span 
                className={`block w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                  open ? "rotate-45 translate-y-[9px]" : ""
                }`}
              />
              <span 
                className={`block w-full h-0.5 bg-current rounded-full transition-all duration-200 ${
                  open ? "opacity-0 scale-0" : ""
                }`}
              />
              <span 
                className={`block w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                  open ? "-rotate-45 -translate-y-[9px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu - glass overlay */}
      <div
        ref={menuRef}
        className={`md:hidden fixed inset-0 transition-all duration-400 ease-out ${
          open 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-xl" />
        
        <div className="flex flex-col justify-center items-start h-full pl-8 pr-4 relative z-10">
          {/* Navigation links - left aligned */}
          <div className="flex flex-col items-start gap-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => { linkRefs.current[index] = el; }}
                className={`group relative py-3 transition-all duration-300 flex items-center gap-4 ${
                  active === link.href
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                }`}
                onClick={() => setOpen(false)}
                style={{ opacity: 0, transform: "translateY(20px)" }}
              >
                {/* Active indicator line */}
                <span className={`w-6 h-px transition-all duration-300 ${
                  active === link.href 
                    ? "bg-[var(--primary)]" 
                    : "bg-[var(--foreground)]/20 group-hover:bg-[var(--primary)]/50 group-hover:w-8"
                }`} />
                
                {/* Link text */}
                <span className={`text-4xl font-bold tracking-tight transition-all duration-300 ${
                  active === link.href 
                    ? "" 
                    : "group-hover:translate-x-1"
                }`}>
                  {link.label}
                </span>
                
                {/* Number indicator */}
                <span className={`text-xs font-mono transition-all duration-300 ${
                  active === link.href 
                    ? "text-[var(--primary)]/60" 
                    : "text-[var(--foreground)]/20 group-hover:text-[var(--foreground)]/40"
                }`}>
                  .0{index + 1}
                </span>
              </Link>
            ))}
          </div>
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
