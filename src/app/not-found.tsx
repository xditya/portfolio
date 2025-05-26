"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { IoHomeOutline } from "react-icons/io5";

export default function NotFound() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    // Set initial state
    gsap.set(titleRef.current, { opacity: 0, y: 20 });

    // Animate in
    gsap.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold mb-8 flex justify-center"
        >
          404
        </h1>
        <p className="text-xl md:text-2xl mb-12 opacity-80">
          Oops! Looks like you&apos;ve ventured into the void!
        </p>
        <button
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 mx-auto px-6 py-3 rounded-lg border border-[var(--accent)] hover:bg-[var(--accent)] transition-colors duration-300"
        >
          <IoHomeOutline className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Return Home</span>
        </button>
      </div>
    </main>
  );
}
