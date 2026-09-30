// Who the site is about. Pages, the palette and the game read these values;
// nothing else should type the name, role, email or bio again.

export const currentYear = new Date().getFullYear();

const name = "Aditya";
const role = "Full-stack Developer";
const location = "Kerala, India";
const available = "Available for freelance";
const birthYear = 2003;

export const profile = {
  name,
  handle: "xditya",
  role,
  location,
  birthYear,
  codingSince: 2020,
  age: currentYear - birthYear,
  email: "contact@xditya.me",
  resume: "/resume.pdf",
  siteUrl: "https://xditya.me",
  available,
  /** Hero tagline; the middle part is set in bold ink. */
  tagline: {
    lead: "Full-stack dev.",
    emphasis: "Open-source contributor.",
    trail: "Bot builder.",
  },
  statement:
    "Full-stack developer interested in Python, TypeScript, and automation. I build Telegram bots, web apps, and open-source tools.",
  whatIDo: {
    title: "What I Do",
    text: "Build Telegram bots, web applications, and automation tools using Python and TypeScript.",
    chips: ["Python", "TypeScript", "Telegram"],
  },
  howIWork: {
    title: "How I Work",
    text: "Simple and automated. Solve the real problem, keep the code small, automate the boring parts.",
    chips: ["Efficiency", "Automation", "Open Source"],
  },
  meta: {
    title: `${name} · ${role}`,
    titleTemplate: `%s · ${name}`,
    siteName: "Aditya Portfolio",
    description:
      "Full-stack developer building web apps, Telegram bots, and open-source tools. Based in Kerala, India.",
    ogDescription:
      "Full-stack developer building web apps, Telegram bots, and open-source tools.",
    keywords: [
      "Aditya",
      "xditya",
      "full-stack developer",
      "open source",
      "Telegram bot",
      "Python",
      "TypeScript",
      "Next.js",
      "portfolio",
    ],
    twitterCreator: "@its_xditya",
  },
};
