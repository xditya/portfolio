import React from "react";
import { LuFolderOpen } from "react-icons/lu";
import {
  FaGithub,
  FaXTwitter,
  FaLinkedin,
  FaTelegram,
  FaYoutube,
} from "react-icons/fa6";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-4 pt-32 pb-16">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-2">
          Hi, I&apos;m <span className="text-[var(--primary)]">Aditya.</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-400 font-medium mb-5 font-sans">
          Open-Source Developer &amp; Freelancer.
        </p>
        <a
          href="#"
          className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--background)] font-semibold rounded-full px-8 py-2 text-lg shadow hover:bg-[var(--accent)] transition-colors mb-10"
        >
          <LuFolderOpen className="text-xl" /> View Projects
        </a>
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
