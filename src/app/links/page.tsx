"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { IoArrowBack, IoLink } from "react-icons/io5";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Footer from "@/components/Footer";

interface LinkItem {
  name: string;
  url: string;
  description?: string;
}

const links: LinkItem[] = [
  {
    name: "Website Status",
    url: "/status",
    description: "Check the status of my websites",
  },
  {
    name: "Link Shortener",
    url: "https://short.xditya.me",
    description: "Shorten your links easily",
  },
  {
    name: "PasteBin",
    url: "https://paste.xditya.me",
    description: "Paste your code snippets and share them",
  },
  {
    name: "Collection of REST APIs",
    url: "https://apis.xditya.me",
    description: "A collection of REST APIs for various purposes",
  },
  {
    name: "My Bots",
    url: "/bots",
    description: "Check out my bots",
  },
  {
    name: "Terms & Conditions",
    url: "/terms",
    description: "Read the terms and conditions (for freelance clients)",
  },
];

const LinksPage = () => {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const linkRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    // Title animation
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }
      );
    }

    // Link items animation
    linkRefs.current.forEach((link, index) => {
      if (link) {
        gsap.fromTo(
          link,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.2 + index * 0.1,
            ease: "power2.out",
          }
        );
      }
    });
  }, []);

  const setLinkRef = (el: HTMLDivElement | null, index: number) => {
    linkRefs.current[index] = el;
  };

  const isExternalLink = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
        <div className="max-w-2xl mx-auto relative">
          <div className="mb-12">
            <button
              onClick={handleBack}
              className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--primary)]/10 mb-4 flex items-center gap-2"
              aria-label="Go back"
            >
              <IoArrowBack className="text-xl" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary)] text-center"
            >
              Links
            </h1>
          </div>

          <div className="space-y-4">
            {links.map((link, index) => (
              <div
                key={index}
                ref={(el) => setLinkRef(el, index)}
                className="group"
              >
                <Link
                  href={link.url}
                  {...(isExternalLink(link.url) && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  className="block bg-[var(--foreground)]/5 border border-[var(--primary)]/10 rounded-2xl p-6 transition-all duration-300 hover:border-[var(--primary)]/30 hover:bg-[var(--foreground)]/8 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--primary)]/5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/5 to-[var(--primary)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--background)] transition-colors duration-300">
                             <IoLink className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--primary)] mb-1 group-hover:text-[var(--accent)] transition-colors duration-300">
                                {link.name}
                            </h2>
                            {link.description && (
                                <p className="text-sm text-[var(--foreground)]/60 group-hover:text-[var(--foreground)]/80 transition-colors duration-300">
                                {link.description}
                                </p>
                            )}
                        </div>
                    </div>
                    {isExternalLink(link.url) && (
                      <FiExternalLink className="w-5 h-5 text-[var(--foreground)]/40 group-hover:text-[var(--accent)] transition-colors duration-300" />
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LinksPage;
