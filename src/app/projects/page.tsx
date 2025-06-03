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
      name: "ChannelActionsBot",
      tagline: "Telegram bot to auto approve chat join requests.",
      description:
        "A bot built to automatically handle join requests for Telegram chats, currenly with over 1M users.",
      githubUrl: "https://github.com/xditya/ChannelActionsBot",
      projectUrl: "https://channelactions.xditya.me",
      imagePlaceholder: "/images/channelactions.png",
      techStack: ["deno", "typescript", "mongodb"],
      year: 2022,
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
      name: "ChannelAutoPost",
      tagline: "Telegram bot to auto post messages.",
      description:
        "Automatically posts messages from one channel to another without the forwarded tag.",
      githubUrl: "https://github.com/xditya/ChannelAutoPost",
      projectUrl: "",
      techStack: ["python"],
      year: 2022,
      imagePlaceholder: "/images/channelautopost.png",
    },
    {
      name: "Telethon Bot",
      tagline: "Telegram bot boilerplate.",
      description:
        "Telegram Bot/UserBot boilerplate built with the Telethon library.",
      githubUrl: "https://github.com/xditya/TelethonBot",
      projectUrl: "",
      techStack: ["python"],
      year: 2021,
      imagePlaceholder: "/images/telethonbot.png",
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
          <div className="flex items-center mb-12 relative z-20">
            <button
              onClick={() => router.back()}
              className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors duration-200 absolute left-0 top-1/2 transform -translate-y-1/2"
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

          <div className="flex flex-col lg:flex-row gap-12 mt-12">
            <div className="hidden lg:block lg:w-1/6">
              <div className="lg:sticky lg:top-20 h-[calc(100vh-5rem)]">
                <h3 className="text-2xl font-bold text-[var(--primary)] mb-8">
                  Timeline
                </h3>
                <div className="relative ml-3 h-full">
                  <div className="absolute left-0 transform -translate-x-1/2 w-0.5 bg-[var(--primary)]/20 h-full top-0"></div>

                  <ul className="list-none p-0 m-0 space-y-24 h-full flex flex-col justify-between">
                    {Object.keys(projectsByYear)
                      .sort((a, b) => Number(b) - Number(a))
                      .map((year) => (
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
                            className={`absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                              currentYear === Number(year)
                                ? "bg-[var(--accent)]"
                                : "bg-[var(--primary)]/20 group-hover:bg-[var(--primary)]/40"
                            } transition-all duration-300 z-10`}
                          />
                          <div className="ml-6">
                            <span
                              className={`text-xl font-medium ${
                                currentYear === Number(year)
                                  ? "text-[var(--accent)]"
                                  : "text-[var(--foreground)]/60 group-hover:text-[var(--foreground)]"
                              } transition-colors duration-300`}
                            >
                              {year}
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:w-5/6 flex flex-col lg:flex-row gap-12">
              <div className="lg:w-2/3 space-y-24" ref={projectsContainerRef}>
                {Object.entries(projectsByYear)
                  .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                  .map(([year, projects]) => (
                    <div key={year} className="space-y-24">
                      {projects.map((project, index) => (
                        <section
                          key={index}
                          id={`project-${projectsList.findIndex(
                            (p) => p === project
                          )}`}
                          className="project-section space-y-8 pt-12"
                        >
                          {project.imagePlaceholder ? (
                            <div className="w-full h-64 rounded-lg overflow-hidden relative">
                              <Image
                                src={project.imagePlaceholder}
                                alt={`Preview image for ${project.name}`}
                                fill={true}
                                sizes="(max-width: 1024px) 100vw, 66vw"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          ) : (
                            <div
                              className="w-full h-64 rounded-lg flex items-center justify-center text-center p-4 relative"
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
                              <span className="text-2xl font-semibold text-[var(--primary)] z-20 relative">
                                {project.name}
                              </span>
                            </div>
                          )}

                          <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--primary)] mb-3">
                              {project.name}
                            </h2>
                            {project.tagline && (
                              <p className="text-xl text-[var(--foreground)]/80 mb-4">
                                {project.tagline}
                              </p>
                            )}
                            <p className="text-base text-[var(--foreground)] mb-6">
                              {project.description}
                            </p>
                          </div>

                          <div className="flex gap-4 items-center">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2 border border-[var(--primary)] rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200 text-lg font-medium"
                                aria-label={`GitHub repository for ${project.name}`}
                              >
                                <SiGithub className="text-xl" />
                                GitHub
                              </a>
                            )}
                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2 border border-[var(--primary)] rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200 text-lg font-medium"
                                aria-label={`Live demo of ${project.name}`}
                              >
                                <FiExternalLink className="text-xl" />
                                Live Project
                              </a>
                            )}
                          </div>
                        </section>
                      ))}
                    </div>
                  ))}
              </div>

              <div
                className="hidden lg:block lg:w-1/3 lg:sticky lg:top-20 h-fit pt-12"
                ref={techStackRef}
              >
                <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">
                  Tech Stacks
                </h3>
                <div className="flex flex-wrap gap-3">
                  {allTechStacks.map((stack) => (
                    <span
                      key={stack}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center gap-2
                      ${
                        currentProject.techStack &&
                        currentProject.techStack.includes(stack)
                          ? "bg-[var(--accent)] text-[var(--background)]"
                          : "bg-[var(--foreground)]/10 text-[var(--foreground)]/80"
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

          <div className="mt-24 lg:hidden">
            <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">
              Tech Stacks
            </h3>
            <div className="flex flex-wrap gap-3">
              {allTechStacks.map((stack) => (
                <span
                  key={stack}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-[var(--foreground)]/10 text-[var(--foreground)]/80 flex items-center gap-2"
                >
                  {techStacks[stack]?.icon}
                  {techStacks[stack]?.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
