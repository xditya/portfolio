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
  const nameRef = useRef(null);

  useEffect(() => {
    // Ensure the ref is connected to the DOM element before animating
    if (nameRef.current) {
      gsap.to(nameRef.current, {
        scrambleText: {
          text: "Aditya.",
          chars: "abcdefghijklmnopqrstuvwxyz!@#$%^&*+",
          speed: 0.25,
          rightToLeft: true,
          revealDelay: 0.9,
        },
        duration: 1,
        ease: "power1.inOut",
      });
    } else {
      console.error(
        "nameRef.current is null - element not found for GSAP animation."
      );
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-4 pt-32 pb-16">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-2">
          Hi, I&apos;m{" "}
          {/* Initial text is "xditya.", will scramble to "Aditya." */}
          <span ref={nameRef} className="text-[var(--primary)]">
            xditya?
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
