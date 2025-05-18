"use client";

import React, { useRef, useEffect } from "react";
import { LuFolderOpen } from "react-icons/lu";
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

  useEffect(() => {
    const nameElement = nameRef.current;
    const punctElement = punctRef.current;

    // Ensure both refs are connected to DOM elements before animating
    if (nameElement && punctElement) {
      // Tween for the name part ("xditya" -> "Aditya")
      const nameTween = gsap.to(nameElement, {
        delay: 1, // Wait for 1 second before starting this animation
        scrambleText: {
          text: "Aditya", // The final text for this span
          chars: "abcdefghijklmnopqrstuvwxyz", // Characters to use for scrambling the name
          speed: 0.3, // Speed of the name scramble/reveal (adjust as needed)
          // Default reveal direction is left-to-right, which works well here
        },
        duration: 1, // Duration for the name part animation (adjust as needed)
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
    <main className="min-h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-4 pt-32 pb-16">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-2">
          Hi, I&apos;m {/* Container span to keep styling */}
          <span className="text-[var(--primary)]">
            {/* Span for the name part - initially "xditya" */}
            <span ref={nameRef}>xditya</span>
            {/* Span for the punctuation part - initially "?" */}
            <span ref={punctRef}>?</span>
          </span>
        </h1>
        <p className="text-base sm:text-lg text-gray-400 font-medium mb-5 font-sans">
          Open-Source Developer & Freelancer.
        </p>
        <a
          href="/projects"
          className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--background)] font-semibold rounded-full px-8 py-2 text-lg shadow hover:bg-[var(--accent)] transition-colors mb-10"
        >
          <LuFolderOpen className="text-xl" /> View Projects
        </a>
        {/* <a
          href="#"
          className="flex items-center justify-center gap-2 bg-[var(--secondary)] text-[var(--background)] font-semibold rounded-full px-8 py-2 text-lg shadow hover:bg-[var(--accent)] transition-colors mb-10"
        >
          <LuFolderOpen className="text-xl" /> Download Resume
        </a> */}

        <div className="flex gap-4 mt-2">
          <a
            href="https://github.com/xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)] rounded-full p-3 transition-colors shadow text-2xl"
          >
            <FaGithub />
          </a>
          <a
            href="https://x.com/its_xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)] rounded-full p-3 transition-colors shadow text-2xl"
          >
            <FaXTwitter />
          </a>
          <a
            href="https://linkedin.com/in/xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)] rounded-full p-3 transition-colors shadow text-2xl"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://t.me/xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)] rounded-full p-3 transition-colors shadow text-2xl"
          >
            <FaTelegram />
          </a>
          <a
            href="https://youtube.com/@xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--foreground)] rounded-full p-3 transition-colors shadow text-2xl"
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </main>
  );
}
