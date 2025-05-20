"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoDownload } from "react-icons/io5";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger, SplitText);

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

const experiences: Experience[] = [
  {
    title: "Lead Developer",
    company: "TeamUltroid",
    period: "2021 - Present",
    description:
      "Architected the fundamental structure and key modules driving the project&apos;s functionality. Managed GitHub repositories, code reviews, and collaborative development processes. Interacted with a global community to improve functionality and usability.",
  },
  {
    title: "Tech Intern",
    company: "BreadcrumbsAI",
    period: "2024",
    description:
      "Developed web scraping scripts in Python, using Playwright to extract web data and BeautifulSoup for parsing. Implemented error handling and logging mechanisms to ensure reliable data collection.",
  },
  {
    title: "Project Lead and Backend Developer",
    company:
      "Google Developer Student Clubs, Mar Baselios College of Engineering and Technology",
    period: "2022 - 2024",
    description:
      "Coordinated club activities. Developed automation scripts for various events and the backend of GDSC MBCET website.",
  },
  {
    title: "Campus Lead",
    company: "GTECH μLearn, Mar Baselios College of Engineering and Technology",
    period: "2023 - 2024",
    description:
      "Managed campus-wide learning and skill development initiatives. Achieved 1 Million karma points in the campus.",
  },
];

export default function AboutPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    // Calculate age programmatically
    const birthDate = new Date(2003, 8, 18); // Month is 0-indexed (8 for September)
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }
    setAge(calculatedAge);

    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.set(titleRef.current, { visibility: "hidden" });
        gsap.to(titleRef.current, {
          duration: 1.5,
          scrambleText: {
            text: "About Me",
            chars: "lowerCase",
            revealDelay: 0.5,
            speed: 0.75,
          },
          visibility: "visible",
          ease: "power1.inOut",
          delay: 0.5,
        });
      }

      // Content glow effect
      if (contentRef.current) {
        gsap.set(contentRef.current.children, { opacity: 0.7 }); // Apply to children (paragraphs and divs)
        gsap.to(contentRef.current.children, {
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
          delay: 1,
          onComplete: () => {
            // Start timeline animations after text is done
            if (timelineRef.current) {
              const timelineItems =
                timelineRef.current.querySelectorAll(".timeline-item");

              timelineItems.forEach((item, index) => {
                gsap.set(item, { opacity: 0.7 });
                gsap.to(item, {
                  opacity: 1,
                  duration: 1.2,
                  ease: "power2.inOut",
                  scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none none",
                  },
                  delay: index * 0.2,
                });
              });
            }
          },
        });
      }
    });

    // Cleanup
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
        <div className="max-w-4xl mx-auto relative">
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
              About Me
            </h1>
          </div>

          <div className="space-y-8">
            <div ref={contentRef} className="space-y-6">
              <p className="text-lg text-[var(--foreground)]/80 leading-relaxed">
                Hi, I&apos;m Aditya. I&apos;m a
                {age !== null ? ` ${age}-year-old` : ""} student, passionate
                open-source developer, and freelancer based in Kerala, India,
                crafting solutions that make a real impact.
              </p>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold text-[var(--primary)]">
                    What I Do
                  </h3>
                  <p className="text-base md:text-lg text-[var(--foreground)]/80">
                    I build scalable and efficient solutions with expertise in
                    web development, automation, and system architecture.
                    I&apos;m actively contributing to open-source projects like
                    Ultroid and have developed various bots and tools that have
                    been used by many.
                  </p>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold text-[var(--primary)]">
                    My Approach
                  </h3>
                  <p className="text-base md:text-lg text-[var(--foreground)]/80">
                    Combining technical excellence with practical
                    problem-solving is at the core of my work. I focus on
                    creating solutions that are both powerful and user-friendly,
                    always aiming to deliver real value.
                  </p>
                </div>
              </div>

              <div className="bg-[var(--primary)]/5 rounded-xl p-4 md:p-6 border border-[var(--primary)]/10">
                <h3 className="text-lg md:text-xl font-bold text-[var(--primary)] mb-2 md:mb-3">
                  Why I Do It
                </h3>
                <p className="text-base md:text-lg text-[var(--foreground)]/80">
                  I&apos;m driven by the belief in the power of technology to
                  solve real-world problems. Every project, whether it&apos;s
                  through open-source contributions or freelance work, is an
                  opportunity to learn, grow, and make a positive difference.
                </p>
              </div>
            </div>

            <div ref={timelineRef} className="mt-10">
              <h2 className="text-3xl font-bold text-[var(--primary)] mb-12 text-center">
                Professional Journey
              </h2>
              <div className="space-y-6 md:space-y-8">
                {experiences.map((exp, index) => (
                  <div key={index} className="timeline-item relative">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                      {/* Timeline line and dot - visible on mobile with different style */}
                      <div className="flex md:hidden items-center gap-4 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                        <div className="h-0.5 flex-1 bg-[var(--primary)]/20" />
                      </div>

                      {/* Desktop Timeline */}
                      <div className="hidden md:flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-[var(--primary)]" />
                        </div>
                        {index !== experiences.length - 1 && (
                          <div className="w-0.5 h-full bg-[var(--primary)]/20 my-2" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-[var(--background)] rounded-xl p-4 md:p-6 shadow-lg border border-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all duration-300">
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h3 className="text-xl md:text-2xl font-bold text-[var(--primary)]">
                              {exp.title}
                            </h3>
                            <span className="text-sm font-medium px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full w-fit">
                              {exp.period}
                            </span>
                          </div>
                          <p className="text-base md:text-lg font-medium text-[var(--foreground)]/90">
                            {exp.company}
                          </p>
                          <p className="text-sm md:text-base text-[var(--foreground)]/80 leading-relaxed">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--background)] rounded-lg font-semibold hover:bg-[var(--accent)] transition-colors duration-200"
              >
                <IoDownload className="text-xl" />
                Download Resume
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
