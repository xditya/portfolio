"use client";

import React, { useEffect, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Footer from "@/components/Footer";

const TermsPage = () => {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

    // Content fade in
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.3,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
        <div className="max-w-3xl mx-auto relative">
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
              Terms & Conditions
            </h1>
          </div>

          <div ref={contentRef} className="space-y-8 text-lg">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
                Refund Policy and Subscription Terms*
              </h2>
              <p className="text-[var(--foreground)]/70">
                <a
                  href="https://t.me/BuyYourBots"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--accent)] hover:text-[var(--primary)] transition-colors duration-200"
                >
                  @BuyYourBots
                </a>{" "}
                /{" "}
                <a
                  href="https://t.me/Bots4Sale"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--accent)] hover:text-[var(--primary)] transition-colors duration-200"
                >
                  @Bots4Sale
                </a>
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Non-Refundable Source Codes",
                  description: "Purchased source codes are non-refundable."
                },
                {
                  title: "Subscription Cancellation Policy",
                  description: "Refunds will not be issued for subscription cancellations made after two days from the start of the subscription period."
                },
                {
                  title: "Automatic Subscription Cancellation",
                  description: "Subscriptions will be automatically canceled if the user fails to respond within 24 hours of the subscription expiry."
                },
                {
                  title: "Server and Usage Issues",
                  description: "We are not responsible for issues arising from Telegram servers or improper usage of scripts/bots. Please refrain from disputing these matters."
                },
                {
                  title: "Initial Payment Refunds",
                  description: "Refunds for initial payments cannot be issued once work has commenced and proof of work has been provided."
                },
                {
                  title: "Source Code Deployment",
                  description: "Deployment services for the source codes created are offered, with renewals on a monthly basis."
                }
              ].map((term, index) => (
                <div 
                  key={index}
                  className="bg-[var(--foreground)]/5 border border-[var(--primary)]/10 rounded-2xl p-6 transition-all duration-300 hover:border-[var(--primary)]/30 hover:bg-[var(--foreground)]/8 hover:shadow-lg hover:shadow-[var(--primary)]/5"
                >
                  <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
                    {term.title}
                  </h3>
                  <p className="text-[var(--foreground)]/80 leading-relaxed">
                    {term.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 space-y-4 pt-8 border-t border-[var(--primary)]/10">
              <p className="text-[var(--foreground)]/80 font-medium">
                By purchasing, you agree to the terms and conditions outlined
                above.
              </p>
              <p className="text-[var(--foreground)]/50 text-sm">
                * Terms are subject to change.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsPage;
