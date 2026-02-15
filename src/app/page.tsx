"use client";

import React, { useRef, useEffect } from "react";
import { LuFolderOpen, LuUser, LuMail } from "react-icons/lu";
import {
  FaGithub,
  FaXTwitter,
  FaLinkedin,
  FaTelegram,
  FaYoutube,
} from "react-icons/fa6";

import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Register the plugin once
gsap.registerPlugin(ScrambleTextPlugin);

export default function Home() {
  // Ref for the "xditya" part
  const nameRef = useRef(null);
  // Ref for the "?" part
  const punctRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const socialsRef = useRef(null);
  const availabilityRef = useRef(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Listen for mobile menu toggle
  useEffect(() => {
    const handleMenuToggle = (e: CustomEvent<{ open: boolean }>) => {
      if (!contentRef.current || !ctaRef.current || !socialsRef.current) return;
      
      if (e.detail.open) {
        // Menu opened - move content down below the navbar menu
        gsap.to(contentRef.current, {
          y: 200,
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.to(ctaRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in",
        });
        // Move social icons up to stay visible on screen
        gsap.to(socialsRef.current, {
          y: -180,
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        // Menu closed - restore content
        gsap.to(contentRef.current, {
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.to(ctaRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          delay: 0.15,
          ease: "power2.out",
        });
        // Restore social icons position
        gsap.to(socialsRef.current, {
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };
    
    window.addEventListener("mobileMenuToggle", handleMenuToggle as EventListener);
    return () => {
      window.removeEventListener("mobileMenuToggle", handleMenuToggle as EventListener);
    };
  }, []);
  
  // const [githubStats, setGithubStats] = useState({ stars: 0, repos: 0 });

  useEffect(() => {
    // Fetch GitHub stats
    // const fetchStats = async () => {
    //   try {
    //     const response = await fetch("https://api.github.com/users/xditya");
    //     const data = await response.json();
    //     setGithubStats({ stars: 1770, repos: data.public_repos || 0 });
    //   } catch {
    //     setGithubStats({ stars: 1770, repos: 200 });
    //   }
    // };
    // fetchStats();

    const nameElement = nameRef.current;
    const punctElement = punctRef.current;

    // Ensure both refs are connected to DOM elements before animating
    if (nameElement && punctElement) {
      // Tween for the name part ("xditya" -> "Aditya")
      const nameTween = gsap.to(nameElement, {
        delay: 0.3, // Short delay before starting
        scrambleText: {
          text: "Aditya", // The final text for this span
          chars: "abcdefghijklmnopqrstuvwxyz", // Characters to use for scrambling the name
          speed: 0.4, // Speed of the name scramble/reveal
        },
        duration: 0.8, // Faster scramble duration
        ease: "power1.inOut",
        onComplete: () => {
          // This function runs *after* the name tween finishes

          // Tween for the punctuation part ("?" -> ".")
          gsap.to(punctElement, {
            scrambleText: {
              text: ".", // The final text for this span
              chars: "!@#$%", // Scramble with symbols before resolving to '.'
              speed: 0.5, // Speed of the punctuation change (can be faster)
            },
            duration: 0.5, // Duration for the punctuation change (adjust as needed)
            ease: "power1.inOut",
            onComplete: () => {
              // Move heading up smoothly
              gsap.to(headingRef.current, {
                y: 0,
                duration: 0.8,
                ease: "power2.out",
              });

              // Reveal availability badge
              if (availabilityRef.current) {
                gsap.to(availabilityRef.current, {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  delay: 1.0,
                  ease: "power2.out",
                });
              }
              
              // After heading moves up, reveal subtitle and buttons in sequence
              gsap.to(subtitleRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: 0.3,
                ease: "power2.out",
              });
              
              // Animate CTA buttons with stagger
              gsap.to(ctaRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: 0.5,
                ease: "power2.out",
              });
              
              // Animate social icons
              gsap.to(socialsRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: 0.7,
                ease: "power2.out",
              });
            },
          });
        },
      });

      // Optional: Clean up tweens on component unmount
      return () => {
        nameTween.kill();
        // The second tween is tied to the first's onComplete,
        // killing the first should prevent the second from starting if unmounted early.
      };
    } else {
      console.error(
        "Refs not connected - elements not found for GSAP animation."
      );
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 via-transparent to-transparent pointer-events-none" /> */}
      
      <div ref={contentRef} className="w-full max-w-2xl flex flex-col items-center text-center gap-4 pt-32 pb-16 relative z-10">
        
        <h1 ref={headingRef} className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-2 translate-y-24">
          Hi, I&apos;m {/* Container span to keep styling */}
          <span className="text-[var(--primary)]">
            {/* Span for the name part - initially "xditya" */}
            <span ref={nameRef}>xditya</span>
            {/* Span for the punctuation part - initially "?" */}
            <span ref={punctRef}>?</span>
          </span>
        </h1>
        
        <p ref={subtitleRef} className="text-base sm:text-lg text-[var(--foreground)]/60 font-medium mb-6 font-sans opacity-0 translate-y-5">
          Full-stack dev. Open-source contributor. Bot builder.
        </p>



        <div ref={ctaRef} className="flex flex-wrap justify-center gap-3 mb-10 opacity-0 translate-y-5">
          <a
            href="/projects"
            className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--background)] font-semibold rounded-full px-8 py-3 text-base border border-[var(--primary)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:scale-105 transition-all"
          >
            <LuFolderOpen className="text-lg" /> View Projects
          </a>
          <a
            href="/about"
            className="flex items-center justify-center gap-2 bg-[var(--foreground)]/5 text-[var(--foreground)] font-semibold rounded-full px-8 py-3 text-base border border-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-[var(--background)] hover:border-[var(--primary)] hover:scale-105 transition-all"
          >
            <LuUser className="text-lg" /> About Me
          </a>
          <a
            href="/contact"
            className="flex items-center justify-center gap-2 bg-[var(--foreground)]/5 text-[var(--foreground)] font-semibold rounded-full px-8 py-3 text-base border border-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-[var(--background)] hover:border-[var(--primary)] hover:scale-105 transition-all"
          >
            <LuMail className="text-lg" /> Contact
          </a>
        </div>

        <div ref={socialsRef} className="flex gap-3 mt-2 opacity-0 translate-y-5">
          <a
            href="https://github.com/xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--foreground)]/5 hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)]/70 rounded-xl p-3 transition-all hover:scale-110 text-xl border border-[var(--primary)]/10 hover:border-[var(--primary)]"
          >
            <FaGithub />
          </a>
          <a
            href="https://x.com/its_xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--foreground)]/5 hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)]/70 rounded-xl p-3 transition-all hover:scale-110 text-xl border border-[var(--primary)]/10 hover:border-[var(--primary)]"
          >
            <FaXTwitter />
          </a>
          <a
            href="https://linkedin.com/in/xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--foreground)]/5 hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)]/70 rounded-xl p-3 transition-all hover:scale-110 text-xl border border-[var(--primary)]/10 hover:border-[var(--primary)]"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://t.me/xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--foreground)]/5 hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)]/70 rounded-xl p-3 transition-all hover:scale-110 text-xl border border-[var(--primary)]/10 hover:border-[var(--primary)]"
          >
            <FaTelegram />
          </a>
          <a
            href="https://youtube.com/@xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--foreground)]/5 hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)]/70 rounded-xl p-3 transition-all hover:scale-110 text-xl border border-[var(--primary)]/10 hover:border-[var(--primary)]"
          >
            <FaYoutube />
          </a>
        </div>
      </div>

      <a
        ref={availabilityRef}
        href="/contact"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)]/80 backdrop-blur-md border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium opacity-0 translate-y-10 hover:bg-[var(--primary)]/10 transition-all hover:scale-105 hover:border-[var(--primary)]/40 shadow-lg cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Available for Work
      </a>
    </main>
  );
}
