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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10">
        <h1
          ref={titleRef}
          className="text-8xl md:text-9xl font-black mb-6 flex justify-center text-transparent bg-clip-text bg-gradient-to-b from-[var(--primary)] to-[var(--foreground)]/10 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          style={{ textShadow: "0 0 30px var(--primary-alpha)" }}
        >
          404
        </h1>
        <div className="space-y-6">
            <p className="text-xl md:text-2xl font-medium text-[var(--primary)] opacity-80">
            Lost among the stars?
            </p>
            <p className="text-[var(--foreground)]/60 max-w-md mx-auto leading-relaxed">
            The page you're looking for seems to have drifted into a black hole. 
            Let's get you back to solid ground.
            </p>
        </div>
        
        <button
          onClick={() => router.push("/")}
          className="mt-12 group flex items-center gap-2 mx-auto px-8 py-3 rounded-full bg-[var(--primary)] text-[var(--background)] font-semibold hover:bg-[var(--accent)] hover:scale-105 transition-all duration-300 shadow-lg shadow-[var(--primary)]/20"
        >
          <IoHomeOutline className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Return to Base</span>
        </button>
      </div>
    </main>
  );
}
