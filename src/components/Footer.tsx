"use client";

import React from "react";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa6";
// No need for Link from next/link if there are no internal navigation links in the footer itself

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--background)] text-[var(--foreground)] py-6 px-4 border-t border-[var(--primary-darker)]">
      {" "}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        {" "}
        <div className="text-center md:text-left">
          {" "}
          <p className="text-[var(--foreground)]">
            &copy; {currentYear} Aditya S. All Rights Reserved.{" "}
          </p>
          <p className="text-[var(--foreground-lighter)] mt-1">
            Built with ❤️ •{" "}
            <a
              href="https://i.xditya.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground-lighter)] hover:text-[var(--accent)] transition-colors text-xs"
            >
              Legacy Site
            </a>
          </p>
        </div>
        <div className="flex items-center gap-4 text-[var(--foreground-lighter)]">
          <a
            href="mailto:contact@xditya.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)] transition-colors"
          >
            <FaEnvelope className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com/in/xditya/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)] transition-colors"
          >
            <FaLinkedin className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/xditya"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)] transition-colors"
          >
            <FaGithub className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
