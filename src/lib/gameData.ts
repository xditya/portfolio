// Consolidated portfolio data used by the 3D game world (/game).
// Mirrors content from the home, about, projects, links, and contact pages.

export type GameProject = {
  name: string;
  tagline: string;
  description: string;
  github: string;
  url?: string;
  tech: string[];
  year: number;
  stars?: number;
  users?: string;
  featured?: boolean;
};

export const GAME_PROJECTS: GameProject[] = [
  // 2024
  { name: "Campus Services", tagline: "College services management app", description: "A comprehensive mobile app to streamline campus services — digital wallet, print services, vehicle pass, ID cards, lab access, and smart vending.", github: "https://github.com/xditya/CampusServicesManagementSystem", tech: ["Kotlin", "Android", "MongoDB"], year: 2024 },
  { name: "GeminiBot", tagline: "AI-powered Telegram Bot", description: "A Telegram bot powered by Google's Gemini AI for intelligent conversations and assistance.", github: "https://github.com/xditya/GeminiBot", tech: ["TypeScript", "Deno"], year: 2024 },
  { name: "TGdetailsBot", tagline: "Telegram Bot to fetch message details", description: "Gets message details (as JSON) and chat IDs. A live instance is available on Telegram.", github: "https://github.com/xditya/TGdetailsBot", url: "https://t.me/TGdetailsBot", tech: ["TypeScript"], year: 2024 },
  { name: "WhatsApp Utilities", tagline: "WhatsApp Bot", description: "A WhatsApp Bot using whatsapp-web.js to convert images into stickers.", github: "https://github.com/xditya/WhatsAppUtilitiesBot", tech: ["JavaScript"], year: 2024 },
  // 2023
  { name: "GetRestrictedMessages", tagline: "Copy messages from restricted chats", description: "A tool to copy messages from Telegram chats with forward restrictions enabled.", github: "https://github.com/xditya/GetRestrictedMessages", tech: ["Python"], year: 2023, stars: 83 },
  { name: "VehicleDetection", tagline: "Real-time Traffic Management System", description: "Detects vehicles from video feeds and dynamically manages traffic lights using YOLO and PyQt5.", github: "https://github.com/xditya/VehicleDetection", tech: ["Python", "OpenCV", "PyQt5"], year: 2023 },
  { name: "AyuVritt", tagline: "Bridging ancient wisdom and modern healing via AI", description: "AI-driven platform bridging ancient wisdom and modern healing.", github: "https://github.com/xditya/AyuVritt", url: "https://camel-case.vercel.app/", tech: ["Python", "Flask", "Next.js"], year: 2023 },
  { name: "WebShortener", tagline: "Lightweight Link Shortener", description: "A lightweight and fast link shortener web application with a clean interface.", github: "https://github.com/xditya/WebShortener", tech: ["JavaScript"], year: 2023 },
  { name: "Lyrics Searcher", tagline: "Song lyrics searching app", description: "Android application that allows users to search for lyrics based on song titles.", github: "https://github.com/xditya/LyricsSearcher/", url: "https://github.com/xditya/LyricsSearcher/releases/tag/v0.1", tech: ["Kotlin", "Jetpack Compose"], year: 2023 },
  // 2022
  { name: "ChannelActionsBot", tagline: "Telegram bot to auto approve chat join requests", description: "A bot built to automatically handle join requests for Telegram chats, with over 1M users.", github: "https://github.com/xditya/ChannelActionsBot", url: "https://channelactions.xditya.me", tech: ["Deno", "TypeScript", "MongoDB"], year: 2022, stars: 122, users: "1M+", featured: true },
  { name: "ChannelAutoPost", tagline: "Telegram bot to auto post messages", description: "Automatically posts messages from one channel to another without the forwarded tag.", github: "https://github.com/xditya/ChannelAutoPost", tech: ["Python"], year: 2022, stars: 224 },
  { name: "captchaBot", tagline: "Telegram Captcha Bot", description: "A Telegram bot that provides captcha verification for group chats to prevent spam.", github: "https://github.com/xditya/captchaBot", tech: ["Python"], year: 2022 },
  // 2021
  { name: "YouTubeFeeds", tagline: "YouTube video notifications on Telegram", description: "Get new YouTube video notifications from multiple channels on multiple Telegram chats.", github: "https://github.com/xditya/YouTubeFeeds", tech: ["TypeScript"], year: 2021, stars: 60 },
  { name: "Ultroid", tagline: "Pluggable Telegram userbot", description: "Advanced, multi-featured Telegram UserBot with plugin support. 3k+ stars on GitHub.", github: "https://github.com/TeamUltroid/Ultroid", url: "https://t.me/TeamUltroid", tech: ["Python", "MongoDB", "Redis"], year: 2021, stars: 3000, featured: true },
  { name: "ForceSub", tagline: "Force Subscribe Bot", description: "A Telegram bot that forces users to subscribe to a channel before they can interact.", github: "https://github.com/xditya/ForceSub", tech: ["Python"], year: 2021, stars: 63 },
  { name: "Telethon Bot", tagline: "Telegram bot boilerplate", description: "Telegram Bot/UserBot boilerplate built with the Telethon library.", github: "https://github.com/xditya/TelethonBot", tech: ["Python"], year: 2021, stars: 54 },
  { name: "BotStatus", tagline: "Bot status updater for Telegram", description: "Update your Telegram Bot's status on your channel periodically.", github: "https://github.com/xditya/BotStatus", tech: ["Python"], year: 2021, stars: 53 },
  { name: "VCBot", tagline: "Voice chat music bot", description: "Minimal Telegram voice chat music bot built with Pyrogram.", github: "https://github.com/xditya/VCBot", tech: ["Python"], year: 2021, stars: 38 },
  // 2020
  { name: "GroupManager", tagline: "Python based group managing bot", description: "A comprehensive Telegram group management bot with moderation features.", github: "https://github.com/xditya/GroupManager", tech: ["Python", "MongoDB"], year: 2020, stars: 256, featured: true },
];

export const GAME_YEARS = [2024, 2023, 2022, 2021, 2020];

export const GAME_STATEMENT =
  "Full-stack developer interested in Python, TypeScript, and automation. I build Telegram bots, web apps, and open-source tools.";

export const GAME_STATS = [
  { label: "Repos", value: 20, suffix: "+" },
  { label: "GitHub Stars", value: 1770, suffix: "+" },
  { label: "Followers", value: 576, suffix: "+" },
  { label: "Years Coding", value: new Date().getFullYear() - 2020, suffix: "+" },
];

export const GAME_EXPERIENCE = [
  { title: "Product Engineer", company: "UST", period: "2025 – Present", description: "Working on product development and engineering solutions.", current: true },
  { title: "Lead Developer", company: "TeamUltroid", period: "2021 – Present", description: "Built the core architecture and key modules of the project. Handle GitHub repos, code reviews, and work with contributors from around the world.", current: false },
  { title: "Tech Intern", company: "BreadcrumbsAI", period: "2024", description: "Developed web scraping scripts in Python using Playwright and BeautifulSoup. Implemented error handling and logging for reliable data collection.", current: false },
  { title: "Project Lead & Backend Developer", company: "GDSC MBCET", period: "2022 – 2024", description: "Coordinated club activities. Developed automation scripts for events and the backend of the GDSC MBCET website.", current: false },
  { title: "Campus Lead", company: "GTECH μLearn, MBCET", period: "2023 – 2024", description: "Managed campus-wide learning and skill development initiatives. Achieved 1 Million karma points in the campus.", current: false },
];

export const GAME_TECH_STACK = [
  { name: "Python", color: "#3776AB" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Next.js", color: "#F0F6FC" },
  { name: "Deno", color: "#70FFAF" },
  { name: "MongoDB", color: "#47A248" },
  { name: "Kotlin", color: "#7F52FF" },
];

export const GAME_SOCIALS = [
  { label: "GitHub", href: "https://github.com/xditya", color: "#F4F4EF" },
  { label: "X / Twitter", href: "https://twitter.com/xditya", color: "#9CA3AF" },
  { label: "LinkedIn", href: "https://linkedin.com/in/xditya", color: "#0A66C2" },
  { label: "Telegram", href: "https://t.me/xditya", color: "#2AABEE" },
  { label: "YouTube", href: "https://youtube.com/@xditya", color: "#FF0000" },
];

export const GAME_LINKS = [
  { name: "Website Status", description: "Check the uptime of my services", href: "/status", external: false },
  { name: "Link Shortener", description: "Shorten your links easily", href: "https://short.xditya.me", external: true },
  { name: "PasteBin", description: "Paste and share code snippets", href: "https://paste.xditya.me", external: true },
  { name: "REST APIs", description: "A collection of REST APIs", href: "https://apis.xditya.me", external: true },
  { name: "Terms & Conditions", description: "Legal terms for freelance clients", href: "/terms", external: false },
];

export const GAME_ABOUT = {
  name: "Aditya",
  handle: "xditya",
  role: "Full-stack Developer",
  location: "Kerala, India",
  available: "Available for work",
  email: "contact@xditya.me",
  age: new Date().getFullYear() - 2003,
  whatIDo: "Build Telegram bots, web applications, and automation tools using Python and TypeScript.",
  howIWork: "Simple and automated. I focus on solving real problems efficiently and building scalable solutions.",
  resume: "/resume.pdf",
};
