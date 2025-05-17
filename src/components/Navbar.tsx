"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

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
      (link) =>
        (link.href === "#" && (active === "#" || active === "/")) ||
        (active === link.href && link.href !== "#")
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
    <nav className="w-full fixed top-0 left-0 z-50 bg-[#181820]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
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
          className="hidden md:flex gap-2 relative"
          ref={containerRef}
          style={{ minHeight: 44 }}
        >
          {/* Sliding indicator */}
          <div
            className="absolute bg-[#23232e] rounded-lg shadow-inner transition-all duration-300"
            style={{
              ...indicatorStyle,
              zIndex: 0,
              pointerEvents: "none",
              transitionProperty: "left, top, width, height, background-color",
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
                  (link.href === "#" && (active === "#" || active === "/")) ||
                  (active === link.href && link.href !== "#")
                    ? "text-white"
                    : "text-gray-300 hover:bg-[#23232e] hover:text-white"
                }
              `}
            >
              {link.label}
            </a>
          ))}
        </div>
        <button
          className="md:hidden flex items-center text-white text-3xl focus:outline-none"
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
      {open && (
        <div className="md:hidden bg-[#181820] px-4 pb-4 flex flex-col gap-2 animate-fade-in-down">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg font-semibold text-base tracking-wide font-sans transition-colors duration-200 relative z-10
                ${
                  (link.href === "#" && (active === "#" || active === "/")) ||
                  (active === link.href && link.href !== "#")
                    ? "bg-[#23232e] text-white shadow-inner"
                    : "text-gray-300 hover:bg-[#23232e] hover:text-white"
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
