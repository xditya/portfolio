"use client";

import React, { useEffect, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Register the plugin
gsap.registerPlugin(ScrambleTextPlugin);

const TermsPage = () => {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Title animation
    if (titleRef.current) {
      gsap.set(titleRef.current, { visibility: "hidden" });
      gsap.to(titleRef.current, {
        duration: 1.5,
        scrambleText: {
          text: "Terms & Conditions",
          chars: "lowerCase",
          revealDelay: 0.5,
          speed: 0.75,
        },
        visibility: "visible",
        ease: "power1.inOut",
        delay: 0.5,
      });
    }

    // Content fade in
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.8,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-center mb-12">
          <button
            onClick={() => router.back()}
            className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors duration-200 absolute left-0"
            aria-label="Go back"
          >
            <IoArrowBack className="text-3xl" />
          </button>
          <h1
            ref={titleRef}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary)] text-center w-full"
          >
            Terms & Conditions
          </h1>
        </div>

        <div ref={contentRef} className="space-y-8 text-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
              Refund Policy and Subscription Terms*
            </h2>
            <p className="text-[var(--foreground)]/70">
              <a
                href="https://t.me/BuyYourBots"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--primary)] transition-colors duration-200"
              >
                @BuyYourBots
              </a>{" "}
              /{" "}
              <a
                href="https://t.me/Bots4Sale"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--primary)] transition-colors duration-200"
              >
                @Bots4Sale
              </a>
            </p>
          </div>

          <div className="space-y-6">
            <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
                Non-Refundable Source Codes
              </h3>
              <p className="text-[var(--foreground)]/80">
                Purchased source codes are non-refundable.
              </p>
            </div>

            <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
                Subscription Cancellation Policy
              </h3>
              <p className="text-[var(--foreground)]/80">
                Refunds will not be issued for subscription cancellations made
                after two days from the start of the subscription period.
              </p>
            </div>

            <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
                Automatic Subscription Cancellation
              </h3>
              <p className="text-[var(--foreground)]/80">
                Subscriptions will be automatically canceled if the user fails
                to respond within 24 hours of the subscription expiry.
              </p>
            </div>

            <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
                Server and Usage Issues
              </h3>
              <p className="text-[var(--foreground)]/80">
                We are not responsible for issues arising from Telegram servers
                or improper usage of scripts/bots. Please refrain from disputing
                these matters.
              </p>
            </div>

            <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
                Initial Payment Refunds
              </h3>
              <p className="text-[var(--foreground)]/80">
                Refunds for initial payments cannot be issued once work has
                commenced and proof of work has been provided.
              </p>
            </div>

            <div className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
                Source Code Deployment
              </h3>
              <p className="text-[var(--foreground)]/80">
                Deployment services for the source codes created are offered,
                with renewals on a monthly basis.
              </p>
            </div>
          </div>

          <div className="text-center mt-12 space-y-4">
            <p className="text-[var(--foreground)]/80">
              By purchasing, you agree to the terms and conditions outlined
              above.
            </p>
            <p className="text-[var(--foreground)]/60 text-sm">
              * Terms are subject to change.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
