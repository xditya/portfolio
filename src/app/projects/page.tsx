"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  SiMongodb,
  SiRedis,
  SiDeno,
  SiTypescript,
  SiOpencv,
  SiQt,
  SiFlask,
  SiNextdotjs,
  SiKotlin,
  SiJetpackcompose,
  SiPython,
  SiNodedotjs,
  SiAndroid,
  SiGithub,
} from "react-icons/si";
import { FiExternalLink } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface TechStack {
  name: string;
  icon: React.ReactNode;
}

const techStacks: Record<string, TechStack> = {
  python: {
    name: "Python",
    icon: <SiPython className="text-xl" />,
  },
  mongodb: {
    name: "MongoDB",
    icon: <SiMongodb className="text-xl" />,
  },
  redis: {
    name: "Redis",
    icon: <SiRedis className="text-xl" />,
  },
  deno: {
    name: "Deno",
    icon: <SiDeno className="text-xl" />,
  },
  typescript: {
    name: "TypeScript",
    icon: <SiTypescript className="text-xl" />,
  },
  opencv: {
    name: "OpenCV",
    icon: <SiOpencv className="text-xl" />,
  },
  pyqt: {
    name: "PyQt5",
    icon: <SiQt className="text-xl" />,
  },
  flask: {
    name: "Flask",
    icon: <SiFlask className="text-xl" />,
  },
  nextjs: {
    name: "NextJS",
    icon: <SiNextdotjs className="text-xl" />,
  },
  javascript: {
    name: "JavaScript",
    icon: <SiNodedotjs className="text-xl" />,
  },
  kotlin: {
    name: "Kotlin",
    icon: <SiKotlin className="text-xl" />,
  },
  android: {
    name: "Android",
    icon: <SiAndroid className="text-xl" />,
  },
  jetpack_compose: {
    name: "Jetpack Compose",
    icon: <SiJetpackcompose className="text-xl" />,
  },
};

interface Project {
  name: string;
  tagline?: string;
  description: string;
  githubUrl?: string;
  projectUrl?: string;
  imagePlaceholder?: string;
  techStack?: string[];
  year: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const projectsList: Project[] = [
    {
      name: "Campus Services",
      tagline: "College services management app - BTech. Final Project.",
      description:
        "A comprehensive mobile app to streamline and digitize campus services - digital wallet, print services, vehicle pass, ID cards, lab access, and smart vending.",
      githubUrl: "https://github.com/xditya/CampusServicesManagementSystem",
      techStack: ["kotlin", "android", "mongodb"],
      year: 2024,
      imagePlaceholder: "",
    },
    {
      name: "GeminiBot",
      tagline: "AI-powered Telegram Bot.",
      description:
        "A Telegram bot powered by Google's Gemini AI for intelligent conversations and assistance.",
      githubUrl: "https://github.com/xditya/GeminiBot",
      projectUrl: "",
      techStack: ["typescript", "deno"],
      year: 2024,
      imagePlaceholder: "/images/geminibot.jpg",
    },
    {
      name: "TGdetailsBot",
      tagline: "Telegram Bot to fetch message details.",
      description:
        "Gets message details (as JSON) and chat IDs (forwarded channel/user ID). A live instance is available on Telegram.",
      githubUrl: "https://github.com/xditya/TGdetailsBot",
      projectUrl: "https://t.me/TGdetailsBot",
      techStack: ["typescript"],
      year: 2024,
      imagePlaceholder: "/images/tgdetails.png",
    },
    {
      name: "WhatsApp Utilities",
      tagline: "WhatsApp Bot.",
      description:
        "A WhatsApp Bot using whatsapp-web.js to convert images into stickers.",
      githubUrl: "https://github.com/xditya/WhatsAppUtilitiesBot",
      projectUrl: "",
      techStack: ["javascript"],
      year: 2024,
      imagePlaceholder: "/images/whatsapputilities.png",
    },
    {
      name: "GetRestrictedMessages",
      tagline: "Copy messages from restricted chats.",
      description:
        "A tool to copy messages from Telegram chats with forward restrictions enabled. Popular utility with 83+ stars.",
      githubUrl: "https://github.com/xditya/GetRestrictedMessages",
      projectUrl: "",
      techStack: ["python"],
      year: 2023,
      imagePlaceholder: "",
    },
    {
      name: "VehicleDetection",
      tagline: "Real-time Traffic Management System.",
      description:
        "Detects vehicles from video feeds and dynamically manages traffic lights using YOLO and PyQt5.",
      githubUrl: "https://github.com/xditya/VehicleDetection",
      projectUrl: "",
      techStack: ["python", "opencv", "pyqt"],
      year: 2023,
      imagePlaceholder: "/images/vehicledetection.png",
    },
    {
      name: "AyuVritt",
      tagline: "Bridging gap between ancient wisdom and modern healing via AI.",
      description:
        "AI driven bridging gap between ancient wisdom and modern healing.",
      githubUrl: "https://github.com/xditya/AyuVritt",
      projectUrl: "https://camel-case.vercel.app/",
      techStack: ["python", "flask", "nextjs"],
      year: 2023,
      imagePlaceholder: "/images/ayuvritt.png",
    },
    {
      name: "WebShortener",
      tagline: "Lightweight Link Shortener.",
      description:
        "A lightweight and fast link shortener web application with a clean interface.",
      githubUrl: "https://github.com/xditya/WebShortener",
      projectUrl: "",
      techStack: ["javascript"],
      year: 2023,
      imagePlaceholder: "",
    },
    {
      name: "Lyrics Searcher",
      tagline: "Song lyrics searching app.",
      description:
        "Android application that allows users to search for lyrics based on song titles.",
      githubUrl: "https://github.com/xditya/LyricsSearcher/",
      projectUrl: "https://github.com/xditya/LyricsSearcher/releases/tag/v0.1",
      techStack: ["kotlin", "jetpack_compose", "android"],
      year: 2023,
      imagePlaceholder: "",
    },
    {
      name: "ChannelActionsBot",
      tagline: "Telegram bot to auto approve chat join requests.",
      description:
        "A bot built to automatically handle join requests for Telegram chats, currently with over 1M users. 122+ stars on GitHub.",
      githubUrl: "https://github.com/xditya/ChannelActionsBot",
      projectUrl: "https://channelactions.xditya.me",
      imagePlaceholder: "/images/channelactions.png",
      techStack: ["deno", "typescript", "mongodb"],
      year: 2022,
    },
    {
      name: "ChannelAutoPost",
      tagline: "Telegram bot to auto post messages.",
      description:
        "Automatically posts messages from one channel to another without the forwarded tag. 224+ stars on GitHub.",
      githubUrl: "https://github.com/xditya/ChannelAutoPost",
      projectUrl: "",
      techStack: ["python"],
      year: 2022,
      imagePlaceholder: "/images/channelautopost.png",
    },
    {
      name: "captchaBot",
      tagline: "Telegram Captcha Bot.",
      description:
        "A Telegram bot that provides captcha verification for group chats to prevent spam and bots.",
      githubUrl: "https://github.com/xditya/captchaBot",
      projectUrl: "",
      techStack: ["python"],
      year: 2022,
      imagePlaceholder: "",
    },
    {
      name: "YouTubeFeeds",
      tagline: "YouTube video notifications on Telegram.",
      description:
        "Get new YouTube video notifications from multiple YouTube channels on multiple Telegram chats. 60+ stars.",
      githubUrl: "https://github.com/xditya/YouTubeFeeds",
      projectUrl: "",
      techStack: ["typescript"],
      year: 2021,
      imagePlaceholder: "",
    },
    {
      name: "Ultroid",
      tagline: "Pluggable telegram userbot.",
      description:
        "Advanced, multi-featured Telegram UserBot with plugin support.",
      githubUrl: "https://github.com/TeamUltroid/Ultroid",
      projectUrl: "https://t.me/TeamUltroid",
      imagePlaceholder: "/images/ultroid.png",
      techStack: ["python", "mongodb", "redis"],
      year: 2021,
    },
    {
      name: "ForceSub",
      tagline: "Force Subscribe Bot.",
      description:
        "A Telegram bot that forces users to subscribe to a channel before they can interact. 63+ stars on GitHub.",
      githubUrl: "https://github.com/xditya/ForceSub",
      projectUrl: "",
      techStack: ["python"],
      year: 2021,
      imagePlaceholder: "",
    },
    {
      name: "Telethon Bot",
      tagline: "Telegram bot boilerplate.",
      description:
        "Telegram Bot/UserBot boilerplate built with the Telethon library. 54+ stars on GitHub.",
      githubUrl: "https://github.com/xditya/TelethonBot",
      projectUrl: "",
      techStack: ["python"],
      year: 2021,
      imagePlaceholder: "/images/telethonbot.png",
    },
    {
      name: "BotStatus",
      tagline: "Bot status updater for Telegram.",
      description:
        "Update your Telegram Bot's status on your channel periodically. 53+ stars on GitHub.",
      githubUrl: "https://github.com/xditya/BotStatus",
      projectUrl: "",
      techStack: ["python"],
      year: 2021,
      imagePlaceholder: "",
    },
    {
      name: "VCBot",
      tagline: "Voice chat music bot.",
      description:
        "Minimal Telegram voice chat music bot built with Pyrogram. 38+ stars on GitHub.",
      githubUrl: "https://github.com/xditya/VCBot",
      projectUrl: "",
      techStack: ["python"],
      year: 2021,
      imagePlaceholder: "",
    },
    {
      name: "GroupManager",
      tagline: "Python based Group managing bot.",
      description:
        "A comprehensive Telegram group management bot with moderation features. Most popular project with 256+ stars.",
      githubUrl: "https://github.com/xditya/GroupManager",
      projectUrl: "",
      techStack: ["python", "mongodb"],
      year: 2020,
      imagePlaceholder: "",
    },
  ].sort((a, b) => b.year - a.year);

  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const allTechStacks = Array.from(
    new Set(projectsList.flatMap((project) => project.techStack || []))
  ).sort((a, b) => techStacks[a].name.localeCompare(techStacks[b].name));

  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  const techStackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    const container = projectsContainerRef.current;
    if (container) {
      const projectSections = gsap.utils.toArray(".project-section", container);

      projectSections.forEach((sectionElement, index) => {
        ScrollTrigger.create({
          trigger: sectionElement as HTMLElement,
          start: "top center",
          end: "bottom center",
          onEnter: () => {
            setCurrentProjectIndex(index);
            setCurrentYear(projectsList[index].year);
          },
          onEnterBack: () => {
            setCurrentProjectIndex(index);
            setCurrentYear(projectsList[index].year);
          },
        });

        gsap.fromTo(
          sectionElement as HTMLElement,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionElement as HTMLElement,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [projectsList.length]);

  const currentProject = projectsList[currentProjectIndex];

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Group projects by year
  const projectsByYear = projectsList.reduce((acc, project) => {
    if (!acc[project.year]) {
      acc[project.year] = [];
    }
    acc[project.year].push(project);
    return acc;
  }, {} as Record<number, Project[]>);

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
        <div className="max-w-6xl mx-auto relative">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--primary)]/10 mb-4 flex items-center gap-2 relative z-20"
              aria-label="Go back"
            >
              <IoArrowBack className="text-xl" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary)] text-center"
            >
              Projects
            </h1>
          </div>
          
          {/* Subtitle */}
          <p className="text-center text-[var(--foreground)]/60 text-lg mb-12 max-w-2xl mx-auto">
            A collection of open-source projects, bots, and applications I&apos;ve built over the years.
          </p>

          <div className="flex flex-col lg:flex-row gap-12 mt-12">
            <div className="hidden lg:block lg:w-1/6">
              <div className="lg:sticky lg:top-20">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-6">
                  Timeline
                </h3>
                <div className="relative ml-3">
                  <div className="absolute left-0 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-[var(--accent)] via-[var(--primary)]/40 to-[var(--primary)]/10 h-full top-0"></div>

                  <ul className="list-none p-0 m-0 space-y-6">
                    {Object.keys(projectsByYear)
                      .sort((a, b) => Number(b) - Number(a))
                      .map((year) => {
                        const projectCount = projectsByYear[Number(year)].length;
                        return (
                          <li
                            key={`timeline-${year}`}
                            className="relative flex items-center cursor-pointer group"
                            onClick={() => {
                              const firstProjectOfYear = projectsList.findIndex(
                                (p) => p.year === Number(year)
                              );
                              if (firstProjectOfYear !== -1) {
                                const element = document.getElementById(
                                  `project-${firstProjectOfYear}`
                                );
                                if (element) {
                                  gsap.to(window, {
                                    duration: 1,
                                    scrollTo: {
                                      y: element,
                                      offsetY: 100,
                                    },
                                    ease: "power2.inOut",
                                  });
                                }
                              }
                            }}
                            aria-label={`Scroll to projects from ${year}`}
                          >
                            <div
                              className={`absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 z-10 ${
                                currentYear === Number(year)
                                  ? "w-4 h-4 bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/50"
                                  : "w-3 h-3 bg-[var(--primary)]/30 group-hover:bg-[var(--primary)]/60 group-hover:w-4 group-hover:h-4"
                              }`}
                            />
                            <div className="ml-6 flex items-center gap-2">
                              <span
                                className={`text-lg font-semibold transition-all duration-300 ${
                                  currentYear === Number(year)
                                    ? "text-[var(--accent)]"
                                    : "text-[var(--foreground)]/50 group-hover:text-[var(--foreground)]"
                                }`}
                              >
                                {year}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${
                                  currentYear === Number(year)
                                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                                    : "bg-[var(--foreground)]/10 text-[var(--foreground)]/40 group-hover:bg-[var(--foreground)]/15"
                                }`}
                              >
                                {projectCount}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:w-5/6 flex flex-col lg:flex-row gap-12">
              <div className="lg:w-2/3 space-y-16" ref={projectsContainerRef}>
                {Object.entries(projectsByYear)
                  .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                  .map(([year, projects]) => (
                    <div key={year} className="space-y-12">
                      {/* Year Header */}
                      <div className="flex items-center gap-4 lg:hidden">
                        <span className="text-2xl font-bold text-[var(--accent)]">
                          {year}
                        </span>
                        <div className="flex-1 h-px bg-[var(--primary)]/20"></div>
                      </div>
                      {projects.map((project, index) => (
                        <section
                          key={index}
                          id={`project-${projectsList.findIndex(
                            (p) => p === project
                          )}`}
                          className="project-section group"
                        >
                          {/* Project Card */}
                          <div className="bg-[var(--foreground)]/5 rounded-2xl overflow-hidden border border-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/5">
                            {/* Image Section */}
                            {project.imagePlaceholder ? (
                              <div className="w-full h-56 sm:h-64 overflow-hidden relative">
                                <Image
                                  src={project.imagePlaceholder}
                                  alt={`Preview image for ${project.name}`}
                                  fill={true}
                                  sizes="(max-width: 1024px) 100vw, 66vw"
                                  style={{ objectFit: "cover" }}
                                  className="group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 via-transparent to-transparent"></div>
                              </div>
                            ) : (
                              <div className="w-full h-56 sm:h-64 flex items-center justify-center text-center p-4 relative bg-gradient-to-br from-[var(--primary)]/10 via-[var(--secondary)]/10 to-[var(--accent)]/10">
                                <div className="absolute inset-0 opacity-30">
                                  <div className="absolute inset-0" style={{
                                    backgroundImage: `radial-gradient(circle at 25% 25%, var(--primary) 1px, transparent 1px),
                                                      radial-gradient(circle at 75% 75%, var(--accent) 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                  }}></div>
                                </div>
                                <div className="z-10 flex flex-col items-center gap-2">
                                  <div className="w-16 h-16 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                    <SiGithub className="text-3xl text-[var(--primary)]" />
                                  </div>
                                  <span className="text-xl font-semibold text-[var(--primary)]">
                                    {project.name}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Content Section */}
                            <div className="p-6 space-y-4">
                              {/* Header with Year Badge */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--primary)] mb-1 group-hover:text-[var(--accent)] transition-colors duration-300">
                                    {project.name}
                                  </h2>
                                  {project.tagline && (
                                    <p className="text-base text-[var(--foreground)]/70 font-medium">
                                      {project.tagline}
                                    </p>
                                  )}
                                </div>
                                <span className="hidden sm:inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-[var(--primary)]/10 text-[var(--primary)] whitespace-nowrap">
                                  {project.year}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-sm sm:text-base text-[var(--foreground)]/80 leading-relaxed">
                                {project.description}
                              </p>

                              {/* Tech Stack Tags */}
                              {project.techStack && project.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {project.techStack.map((stack) => (
                                    <span
                                      key={stack}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--secondary)]/20 text-[var(--foreground)]/80"
                                    >
                                      {techStacks[stack]?.icon && (
                                        <span className="text-sm">{techStacks[stack].icon}</span>
                                      )}
                                      {techStacks[stack]?.name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--primary)]/10">
                                {project.githubUrl && (
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-200 text-sm font-medium"
                                    aria-label={`GitHub repository for ${project.name}`}
                                  >
                                    <SiGithub className="text-lg" />
                                    View Code
                                  </a>
                                )}
                                {project.projectUrl && (
                                  <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all duration-200 text-sm font-medium"
                                    aria-label={`Live demo of ${project.name}`}
                                  >
                                    <FiExternalLink className="text-lg" />
                                    Live Demo
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </section>
                      ))}
                    </div>
                  ))}
              </div>

              <div
                className="hidden lg:block lg:w-1/3 lg:sticky lg:top-20 h-fit"
                ref={techStackRef}
              >
                {/* Current Project */}
                <div className="bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--primary)]/10 mb-6 overflow-hidden relative">
                  {/* Progress Bar */}
                  <div className="absolute top-0 left-0 h-1 bg-[var(--accent)] transition-all duration-500" 
                       style={{ width: `${((currentProjectIndex + 1) / projectsList.length) * 100}%` }}></div>
                  
                  <p className="text-xs font-medium text-[var(--foreground)]/40 uppercase tracking-wider mb-3 mt-1">
                    Currently Viewing
                  </p>
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-1">
                    {currentProject.name}
                  </h3>
                  <p className="text-sm text-[var(--foreground)]/60">
                    {currentProject.tagline}
                  </p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--primary)]/10">
                    <span className="text-xs text-[var(--foreground)]/40">{currentProject.year}</span>
                    {currentProject.githubUrl && (
                      <a
                        href={currentProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        <SiGithub className="text-lg" />
                      </a>
                    )}
                  </div>
                  
                  {/* Remaining Count */}
                  <p className="text-xs text-center text-[var(--foreground)]/40 mt-4 pt-3 border-t border-[var(--primary)]/10">
                    {projectsList.length - currentProjectIndex - 1 > 0 
                      ? `${projectsList.length - currentProjectIndex - 1} more to explore`
                      : "✓ All projects explored"
                    }
                  </p>
                </div>

                {/* Tech Stacks */}
                <div className="bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--primary)]/10">
                  <h3 className="text-lg font-bold text-[var(--primary)] mb-4">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTechStacks.map((stack) => (
                      <span
                        key={stack}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                        ${
                          currentProject.techStack &&
                          currentProject.techStack.includes(stack)
                            ? "bg-[var(--accent)] text-[var(--background)] scale-105 shadow-md"
                            : "bg-[var(--foreground)]/10 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/15"
                        }
                      `}
                      >
                        {techStacks[stack]?.icon}
                        {techStacks[stack]?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 lg:hidden">
            <div className="bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--primary)]/10">
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTechStacks.map((stack) => (
                  <span
                    key={stack}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--foreground)]/10 text-[var(--foreground)]/80 flex items-center gap-2"
                  >
                    {techStacks[stack]?.icon}
                    {techStacks[stack]?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
