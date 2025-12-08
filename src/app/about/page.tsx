"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoDownload, IoLocationSharp, IoSchool } from "react-icons/io5";
import { SiGithub, SiTelegram, SiPython, SiTypescript, SiNextdotjs, SiMongodb, SiDeno } from "react-icons/si";
import { FiMail, FiCode, FiUsers, FiStar } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

const experiences: Experience[] = [
  {
    title: "Product Engineer",
    company: "UST",
    period: "2025 - Present",
    description:
      "Working on product development and engineering solutions.",
  },
  {
    title: "Lead Developer",
    company: "TeamUltroid",
    period: "2021 - Present",
    description:
      "Built the core architecture and key modules of the project. Handle GitHub repos, code reviews, and work with contributors from around the world.",
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
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const [stats, setStats] = useState({
    projects: 0,
    stars: 0,
    followers: 0,
    yearsCode: 0,
  });

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

    // Calculate years of coding (started in 2020)
    const codingStartYear = 2020;
    const yearsOfCoding = today.getFullYear() - codingStartYear;

    // Fetch GitHub stats with pagination
    const fetchGitHubStats = async () => {
      try {
        // Fetch user info for followers
        const userResponse = await fetch("https://api.github.com/users/xditya");
        const userData = await userResponse.json();
        const followers = userData.followers || 0;

        let allRepos: { fork: boolean; archived: boolean; stargazers_count: number }[] = [];
        let page = 1;
        let hasMore = true;

        // Paginate through all repos
        while (hasMore) {
          const response = await fetch(
            `https://api.github.com/users/xditya/repos?per_page=100&page=${page}`
          );
          const repos = await response.json();

          if (Array.isArray(repos) && repos.length > 0) {
            allRepos = [...allRepos, ...repos];
            hasMore = repos.length === 100;
            page++;
          } else {
            hasMore = false;
          }
        }

        if (allRepos.length > 0) {
          const ownRepos = allRepos.filter((repo) => !repo.fork && !repo.archived);
          const totalStars = allRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0);

          setStats({
            projects: ownRepos.length,
            stars: totalStars,
            followers,
            yearsCode: yearsOfCoding,
          });
        } else {
          // Fallback if API fails
          setStats({
            projects: 20,
            stars: 1770,
            followers: 576,
            yearsCode: yearsOfCoding,
          });
        }
      } catch {
        // Fallback values
        setStats({
          projects: 20,
          stars: 1770,
          followers: 576,
          yearsCode: yearsOfCoding,
        });
      }
    };

    fetchGitHubStats();

    const ctx = gsap.context(() => {
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

      // Content glow effect
      if (contentRef.current) {
        gsap.set(contentRef.current.children, { opacity: 0.7 }); // Apply to children (paragraphs and divs)
        gsap.to(contentRef.current.children, {
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
          delay: 0.3,
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
        <div className="max-w-5xl mx-auto relative">
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
              About Me
            </h1>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-12">
            {/* Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--primary)]/10 sticky top-20">
                {/* Avatar */}
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-2 border-[var(--primary)]/20">
                  <Image
                    src="/logo.png"
                    alt="Aditya"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h2 className="text-2xl font-bold text-center text-[var(--primary)] mb-1">Aditya</h2>
                <p className="text-center text-[var(--foreground)]/60 mb-4">Full Stack Developer</p>
                
                {/* Quick Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-[var(--foreground)]/70">
                    <IoLocationSharp className="text-[var(--accent)]" />
                    <span>Kerala, India</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--foreground)]/70">
                    <IoSchool className="text-[var(--accent)]" />
                    <span>{age !== null ? `${age} years old` : "Student"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--foreground)]/70">
                    <FiCode className="text-[var(--accent)]" />
                    <span>Open Source Enthusiast</span>
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="flex justify-center gap-3 pt-4 border-t border-[var(--primary)]/10">
                  <a
                    href="https://github.com/xditya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-200"
                  >
                    <SiGithub className="text-lg" />
                  </a>
                  <a
                    href="https://t.me/xditya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-200"
                  >
                    <SiTelegram className="text-lg" />
                  </a>
                  <a
                    href="mailto:me@xditya.me"
                    className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-200"
                  >
                    <FiMail className="text-lg" />
                  </a>
                </div>
                
                {/* Download Resume */}
                <a
                  href="/resume.pdf"
                  download
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-[var(--background)] rounded-lg font-semibold hover:bg-[var(--accent)] transition-colors duration-200"
                >
                  <IoDownload className="text-lg" />
                  Download Resume
                </a>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3 space-y-8" ref={contentRef}>
              {/* Introduction */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--primary)]">Hey there! 👋</h2>
                <p className="text-lg text-[var(--foreground)]/80 leading-relaxed">
                  I&apos;m Aditya — I build stuff for the web and Telegram. Most of my work is open-source, 
                  and I spend a lot of time tinkering with bots, automation, and whatever catches my interest.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--foreground)]/5 rounded-xl p-4 text-center border border-[var(--primary)]/10">
                  <FiCode className="text-2xl text-[var(--accent)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.projects}+</p>
                  <p className="text-xs text-[var(--foreground)]/60">Projects</p>
                </div>
                <div className="bg-[var(--foreground)]/5 rounded-xl p-4 text-center border border-[var(--primary)]/10">
                  <FiStar className="text-2xl text-[var(--accent)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.stars}+</p>
                  <p className="text-xs text-[var(--foreground)]/60">GitHub Stars</p>
                </div>
                <div className="bg-[var(--foreground)]/5 rounded-xl p-4 text-center border border-[var(--primary)]/10">
                  <FiUsers className="text-2xl text-[var(--accent)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.followers}</p>
                  <p className="text-xs text-[var(--foreground)]/60">Followers</p>
                </div>
                <div className="bg-[var(--foreground)]/5 rounded-xl p-4 text-center border border-[var(--primary)]/10">
                  <IoSchool className="text-2xl text-[var(--accent)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.yearsCode}+</p>
                  <p className="text-xs text-[var(--foreground)]/60">Years Coding</p>
                </div>
              </div>

              {/* What I Do & Approach */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--primary)]/10">
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-3">What I Do</h3>
                  <p className="text-[var(--foreground)]/80 leading-relaxed">
                    Mostly Python and TypeScript. I maintain Ultroid (a Telegram userbot with 3k+ stars), 
                    build Telegram bots that people actually use, and occasionally do freelance web dev work.
                  </p>
                </div>
                <div className="bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--primary)]/10">
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-3">How I Work</h3>
                  <p className="text-[var(--foreground)]/80 leading-relaxed">
                    I like keeping things simple. If something can be automated, I&apos;ll automate it. 
                    I prefer writing code that just works over over-engineering solutions.
                  </p>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--primary)]/10">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: <SiPython />, name: "Python" },
                    { icon: <SiTypescript />, name: "TypeScript" },
                    { icon: <SiNextdotjs />, name: "Next.js" },
                    { icon: <SiDeno />, name: "Deno" },
                    { icon: <SiMongodb />, name: "MongoDB" },
                  ].map((tech) => (
                    <span
                      key={tech.name}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium"
                    >
                      {tech.icon}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why I Do It */}
              <div className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-2xl p-6 border border-[var(--primary)]/20">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">Why?</h3>
                <p className="text-[var(--foreground)]/80 leading-relaxed">
                  Honestly? I just like building things. Started with Telegram bots in 2020, 
                  got hooked on open-source, and haven&apos;t stopped since. It&apos;s fun seeing people 
                  actually use what I make.
                </p>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div ref={timelineRef} className="mt-20">
            <h2 className="text-3xl font-bold text-[var(--primary)] mb-4 text-center">
              Where I&apos;ve Been
            </h2>
            <p className="text-center text-[var(--foreground)]/60 mb-12">
              Scroll through my journey →
            </p>
            
            {/* Horizontal scroll container */}
            <div className="relative -mx-4 px-4">
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {experiences.map((exp, index) => (
                  <div 
                    key={index} 
                    className="timeline-item flex-shrink-0 w-[320px] md:w-[380px] snap-center"
                  >
                    <div className={`h-full rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
                      index === 0 
                        ? "bg-[var(--foreground)]/5 border-[var(--accent)]/30 hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent)]/5" 
                        : "bg-[var(--foreground)]/5 border-[var(--primary)]/10 hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5"
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`text-4xl font-black ${index === 0 ? "text-[var(--accent)]/30" : "text-[var(--primary)]/15"}`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                            index === 0 
                              ? "bg-[var(--accent)]/10 text-[var(--accent)]" 
                              : "bg-[var(--primary)]/10 text-[var(--primary)]/70"
                          }`}>
                            {exp.period}
                          </span>
                          {index === 0 && (
                            <span className="text-[10px] px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md font-medium">
                              NOW
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <h3 className={`text-xl font-bold mb-1 ${index === 0 ? "text-[var(--accent)]" : "text-[var(--primary)]"}`}>
                        {exp.title}
                      </h3>
                      <p className="text-sm font-medium text-[var(--foreground)]/50 mb-4">
                        @ {exp.company}
                      </p>
                      
                      {/* Divider */}
                      <div className={`h-px mb-4 ${index === 0 ? "bg-[var(--accent)]/20" : "bg-[var(--primary)]/10"}`} />
                      
                      {/* Description */}
                      <p className="text-sm text-[var(--foreground)]/60 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Future card */}
                <div className="flex-shrink-0 w-[320px] md:w-[380px] snap-center">
                  <div className="h-full rounded-2xl p-6 border-2 border-dashed border-[var(--primary)]/15 flex flex-col items-center justify-center text-center bg-[var(--foreground)]/[0.02]">
                    <div className="text-4xl mb-4">🚀</div>
                    <p className="text-[var(--primary)]/50 font-medium">What&apos;s next?</p>
                    <p className="text-sm text-[var(--foreground)]/30 mt-2">Building the future...</p>
                  </div>
                </div>
              </div>
              
              {/* Scroll indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {experiences.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === 0 ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-[var(--primary)]/20"
                    }`}
                  />
                ))}
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/20" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
