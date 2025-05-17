"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LuArrowDown } from "react-icons/lu";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

export default function ProjectsPage() {
  const dummyProjects = [
    {
      name: "Project One",
      description: "A brief description of project one.",
      githubUrl: "https://github.com/your-username/project-one",
      projectUrl: "https://project-one.example.com",
    },
    {
      name: "Project Two",
      description: "A brief description of project two.",
      githubUrl: "",
      projectUrl: "https://project-two.example.com",
    },
    {
      name: "Project Three",
      description: "A brief description of project three.",
      githubUrl: "https://github.com/your-username/project-three",
      projectUrl: "",
    },
    {
      name: "Project Four",
      description: "A brief description of project four.",
      githubUrl: "https://github.com/your-username/project-four",
      projectUrl: "https://project-four.example.com",
    },
    {
      name: "Project Five",
      description: "A brief description of project five.",
      githubUrl: "",
      projectUrl: "",
    },
    {
      name: "Project Six",
      description: "A brief description of project six.",
      githubUrl: "https://github.com/your-username/project-six",
      projectUrl: "https://project-six.example.com",
    },
    {
      name: "Project One",
      description: "A brief description of project one.",
      githubUrl: "https://github.com/your-username/project-one",
      projectUrl: "https://project-one.example.com",
    },
    {
      name: "Project Two",
      description: "A brief description of project two.",
      githubUrl: "",
      projectUrl: "https://project-two.example.com",
    },
    {
      name: "Project Three",
      description: "A brief description of project three.",
      githubUrl: "https://github.com/your-username/project-three",
      projectUrl: "",
    },
    {
      name: "Project Four",
      description: "A brief description of project four.",
      githubUrl: "https://github.com/your-username/project-four",
      projectUrl: "https://project-four.example.com",
    },
    {
      name: "Project Five",
      description: "A brief description of project five.",
      githubUrl: "",
      projectUrl: "",
    },
    {
      name: "Project Six",
      description: "A brief description of project six.",
      githubUrl: "https://github.com/your-username/project-six",
      projectUrl: "https://project-six.example.com",
    },
    {
      name: "Project One",
      description: "A brief description of project one.",
      githubUrl: "https://github.com/your-username/project-one",
      projectUrl: "https://project-one.example.com",
    },
    {
      name: "Project Two",
      description: "A brief description of project two.",
      githubUrl: "",
      projectUrl: "https://project-two.example.com",
    },
    {
      name: "Project Three",
      description: "A brief description of project three.",
      githubUrl: "https://github.com/your-username/project-three",
      projectUrl: "",
    },
    {
      name: "Project Four",
      description: "A brief description of project four.",
      githubUrl: "https://github.com/your-username/project-four",
      projectUrl: "https://project-four.example.com",
    },
    {
      name: "Project Five",
      description: "A brief description of project five.",
      githubUrl: "",
      projectUrl: "",
    },
    {
      name: "Project Six",
      description: "A brief description of project six.",
      githubUrl: "https://github.com/your-username/project-six",
      projectUrl: "https://project-six.example.com",
    },
  ];

  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Title animation
    if (titleRef.current) {
      gsap.set(titleRef.current, { visibility: "hidden" });

      gsap.to(titleRef.current, {
        duration: 1.5,
        scrambleText: {
          text: "Projects",
          chars: "#@$",
          revealDelay: 0.5,
          speed: 0.75,
        },
        visibility: "visible",
        ease: "power1.inOut",
        delay: 1,
      });
    }

    // Project item animations using ScrollTrigger
    projectRefs.current.forEach((item) => {
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

    // Scroll indicator animation
    if (scrollIndicatorRef.current && projectRefs.current.length > 0) {
      // Set initial state
      gsap.set(scrollIndicatorRef.current, {
        opacity: 1,
        y: 0,
      });

      // Bounce animation
      gsap.to(scrollIndicatorRef.current, {
        y: -10,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: "power1.inOut",
      });

      // Hide on scroll
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (self.progress > 0.05) {
            // Reduced threshold to 5% for earlier hiding
            gsap.to(scrollIndicatorRef.current, {
              opacity: 0,
              duration: 0.5,
            });
          } else {
            gsap.to(scrollIndicatorRef.current, {
              opacity: 1,
              duration: 0.5,
            });
          }
        },
      });
    }

    // Cleanup ScrollTriggers on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      projectRefs.current = [];
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
      <div className="max-w-6xl mx-auto relative">
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary)] mb-8 text-center"
        >
          Projects
        </h1>

        <div
          ref={scrollIndicatorRef}
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 text-[var(--primary)] text-3xl"
          style={{ zIndex: 9999 }}
        >
          <LuArrowDown />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dummyProjects.map((project, index) => (
            <div
              key={index}
              ref={(el) => {
                projectRefs.current[index] = el;
              }}
              className="block p-4 border border-[var(--foreground)] rounded-lg transition-colors duration-200"
            >
              <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
                {project.name}
              </h2>
              <p className="text-[var(--foreground)] mb-4">
                {project.description}
              </p>
              <div className="flex gap-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 border border-[var(--primary)] rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38C13.71 14.53 16 11.53 16 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 border border-[var(--primary)] rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
                      />
                      <path
                        fillRule="evenodd"
                        d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.146L6.354 9.146a.5.5 0 1 0 .708.708L15 1.707V4.5a.5.5 0 0 0 1 0v-5z"
                      />
                    </svg>
                    Live Project
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
