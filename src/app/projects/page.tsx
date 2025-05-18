"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LuArrowDown } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

// Register GSAP plugins
gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

interface ExtendedHTMLDivElement extends HTMLDivElement {
  _scrollTriggerInstance?: ScrollTrigger;
}

// Define an interface for your project data structure
interface Project {
  name: string;
  tagline?: string;
  description: string;
  githubUrl?: string;
  projectUrl?: string;
  imagePlaceholder?: string;
  tags?: string[];
}

export default function ProjectsPage() {
  const router = useRouter();
  const dummyProjects: Project[] = [
    {
      name: "Ultroid",
      tagline: "Pluggable telegram userbot.",
      description:
        "Advanced, multi-featured Telegram UserBot with plugin support.",
      githubUrl: "https://github.com/TeamUltroid/Ultroid",
      projectUrl: "https://t.me/TeamUltroid",
      imagePlaceholder: "./images/ultroid.png",
      tags: ["Telegram", "Python", "MongoDB", "SQLite", "Redis"],
    },
    {
      name: "ChannelActionsBot",
      tagline: "Telegram bot to auto approve chat join requests.",
      description:
        "A bot built to automatically handle join requests for Telegram chats, currenly with over 1M users.",
      githubUrl: "https://github.com/xditya/ChannelActionsBot",
      projectUrl: "https://channelactions.xditya.me",
      imagePlaceholder: "./images/channelactions.png",
      tags: ["Deno", "Typrscript", "MongoDB", "Fluent"],
    },
    {
      name: "VehicleDetection",
      tagline: "Real-time Traffic Management System.",
      description:
        "Detects vehicles from video feeds and dynamically manages traffic lights using YOLO and PyQt5.",
      githubUrl: "https://github.com/xditya/VehicleDetection",
      projectUrl: "",
      tags: ["Python", "YOLO", "OpenCV", "PyQt5", "Computer Vision", "AI"],
      imagePlaceholder: "./images/vehicledetection.png",
    },
    {
      name: "AyuVritt",
      tagline: "Bridging gap between ancient wisdom and modern healing via AI.",
      description:
        "AI driven bridging gap between ancient wisdom and modern healing.",
      githubUrl: "https://github.com/xditya/AyuVritt",
      projectUrl: "https://camel-case.vercel.app/",
      tags: ["Hackathon Winner", "Python", "Flask", "NextJS"],
      imagePlaceholder: "./images/ayuvritt.png",
    },
    {
      name: "ChannelAutoPost",
      tagline: "Telegram bot to auto post messages.",
      description:
        "Automatically posts messages from one channel to another without the forwarded tag.",
      githubUrl: "https://github.com/xditya/ChannelAutoPost",
      projectUrl: "",
      tags: ["Python", "Telethon"],
      imagePlaceholder: "./images/channelautopost.png",
    },
    {
      name: "TelethonBot",
      tagline: "Telegram bot boilerplate.",
      description:
        "Telegram Bot/UserBot boilerplate built with the Telethon library.",
      githubUrl: "https://github.com/xditya/TelethonBot",
      projectUrl: "",
      tags: ["Python", "Telethon"],
      imagePlaceholder: "./images/telethonbot.png",
    },
    {
      name: "TGdetailsBot",
      tagline: "Telegram Bot to fetch message details.",
      description:
        "Gets message details (as JSON) and chat IDs (forwarded channel/user ID). A live instance is available on Telegram.",
      githubUrl: "https://github.com/xditya/TGdetailsBot",
      projectUrl: "https://t.me/TGdetailsBot",
      tags: ["TypeScript", "Telegram"],
      imagePlaceholder: "./images/tgdetails.png",
    },
    {
      name: "WhatsAppUtilitiesBot",
      tagline: "WhatsApp Bot.",
      description:
        "A WhatsApp Bot using whatsapp-web.js to convert images into stickers.",
      githubUrl: "https://github.com/xditya/WhatsAppUtilitiesBot",
      projectUrl: "",
      tags: ["JavaScript", "Node.js", "WhatsApp", "Bot"],
      imagePlaceholder: "./images/whatsapputilities.png",
    },
  ];

  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const setProjectRef = (element: HTMLDivElement | null, index: number) => {
    projectRefs.current[index] = element;
  };

  useEffect(() => {
    const currentScrollIndicator = scrollIndicatorRef.current;
    const currentProjectItems = projectRefs.current;

    // --- Title Animation ---
    if (titleRef.current) {
      gsap.set(titleRef.current, { visibility: "hidden" });

      gsap.to(titleRef.current, {
        duration: 1.5,
        scrambleText: {
          text: "Projects",
          chars: "lowerCase",
          revealDelay: 0.5,
          speed: 0.75,
        },
        visibility: "visible",
        ease: "power1.inOut",
        delay: 0.5,
      });
    }

    // --- Project Item Animations using ScrollTrigger and Hover ---
    currentProjectItems.forEach((item) => {
      if (item) {
        gsap.fromTo(
          item,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    // --- Scroll Indicator Animation ---
    if (currentScrollIndicator && dummyProjects.length > 0) {
      gsap.to(currentScrollIndicator, {
        y: -10,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: "power1.inOut",
      });

      const scrollTriggerInstance = ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        onUpdate: (self) => {
          if (self.progress > 0.005) {
            gsap.to(currentScrollIndicator, {
              opacity: 0,
              duration: 0.4,
            });
          } else {
            gsap.to(currentScrollIndicator, {
              opacity: 1,
              duration: 0.4,
            });
          }
        },
      });
      if (currentScrollIndicator) {
        (
          currentScrollIndicator as ExtendedHTMLDivElement
        )._scrollTriggerInstance = scrollTriggerInstance;
      }
    }

    // --- Cleanup function ---
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      const scrollTrigger = (currentScrollIndicator as ExtendedHTMLDivElement)
        ?._scrollTriggerInstance;
      if (scrollTrigger) {
        scrollTrigger.kill();
        delete (currentScrollIndicator as ExtendedHTMLDivElement)
          ._scrollTriggerInstance;
      }

      projectRefs.current = [];
    };
  }, [dummyProjects.length]);

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
        <div className="max-w-6xl mx-auto relative">
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
              Projects
            </h1>
          </div>

          {/* Scroll Indicator */}
          {dummyProjects.length > 0 && (
            <div
              ref={scrollIndicatorRef}
              className="fixed bottom-10 left-1/2 transform -translate-x-1/2 text-[var(--primary)] text-3xl opacity-100 transition-opacity duration-300"
              style={{ zIndex: 9999 }}
            >
              <LuArrowDown />
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyProjects.map((project, index) => (
              <div
                key={index}
                ref={(el) => setProjectRef(el, index)}
                // Make the card a flex container in a column direction
                className="flex flex-col rounded-lg overflow-hidden shadow-md text-[var(--foreground)] transition-shadow duration-300 ease-in-out transform scale-100 border border-[var(--foreground)]"
                style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }}
              >
                {/* Project Visual (Image or Fallback Pattern) */}
                {/* This block will take its natural height */}
                {project.imagePlaceholder ? (
                  <div
                    className="w-full h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${project.imagePlaceholder})`,
                    }}
                    aria-label={`Preview image for ${project.name}`}
                    role="img"
                  >
                    {/* Optional: Add an overlay div here */}
                  </div>
                ) : (
                  // Fallback if no image - Pattern Background
                  <div
                    className="w-full h-48 flex items-center justify-center text-center p-4 relative"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                      45deg,
                      rgba(var(--primary-rgb), 0.1),
                      rgba(var(--primary-rgb), 0.1) 10px,
                      transparent 10px,
                      transparent 20px
                    )`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gray-600 opacity-70 z-10"></div>
                    <span className="text-xl font-semibold text-[var(--primary)] z-20 relative">
                      {project.name}
                    </span>
                  </div>
                )}

                {/* Project Content */}
                {/* This div will contain the text and links */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  {" "}
                  {/* Added flex flex-col justify-between and flex-grow */}
                  <div>
                    {" "}
                    {/* Wrapper for text content */}
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary)] mb-2">
                      {project.name}
                    </h2>
                    {project.tagline && (
                      <p className="text-sm mb-3">{project.tagline}</p>
                    )}
                    <p className="text-sm text-[var(--foreground)] mb-4">
                      {project.description}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-semibold inline-block py-1 px-2 rounded-full bg-[var(--accent)] text-[var(--background)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Project Links - ADDED mt-auto for bottom alignment */}
                  {/* mt-auto pushes this div to the bottom of its flex-col parent (the .p-6 div) */}
                  <div className="flex gap-3 items-center mt-auto">
                    {" "}
                    {/* Left-aligned by default */}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 border border-[var(--primary)] rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200 text-sm"
                        aria-label={`GitHub repository for ${project.name}`}
                      >
                        <FaGithub className="text-base" />
                        GitHub
                      </a>
                    )}
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 border border-[var(--primary)] rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200 text-sm"
                        aria-label={`Live demo of ${project.name}`}
                      >
                        <FiExternalLink className="text-base" />
                        Live Project
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
