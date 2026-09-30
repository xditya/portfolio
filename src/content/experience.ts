// Work history, newest first. Shown on /about and as the game's towers.

export type Experience = {
  title: string;
  company: string;
  period: string;
  description: string;
  current: boolean;
};

export const experience: Experience[] = [
  {
    title: "Product Engineer",
    company: "UST",
    period: "2025 - Present",
    description: "Working on product development.",
    current: true,
  },
  {
    title: "Lead Developer",
    company: "TeamUltroid",
    period: "2021 - Present",
    description:
      "Built the core architecture and key modules of the project. Handle GitHub repos, code reviews, and work with contributors from around the world.",
    current: false,
  },
  {
    title: "Tech Intern",
    company: "BreadcrumbsAI",
    period: "2024",
    description:
      "Developed web scraping scripts in Python using Playwright and BeautifulSoup. Implemented error handling and logging for reliable data collection.",
    current: false,
  },
  {
    title: "Project Lead & Backend Developer",
    company: "GDSC MBCET",
    period: "2022 - 2024",
    description:
      "Coordinated club activities. Developed automation scripts for events and the backend of the GDSC MBCET website.",
    current: false,
  },
  {
    title: "Campus Lead",
    company: "GTECH μLearn, MBCET",
    period: "2023 - 2024",
    description:
      "Managed campus-wide learning and skill development initiatives. Achieved 1 Million karma points in the campus.",
    current: false,
  },
];
