// Every project on the site. The index, the home cards, the palette and the
// game all read this list; the home cards use the optional short fields.

export type Project = {
  name: string;
  /** Shorter name for tight layouts such as the home cards. */
  shortName?: string;
  tagline: string;
  /** Shorter description for the home cards. Falls back to description. */
  summary?: string;
  description: string;
  tech: string[];
  /** Tech list shown on the home cards. Falls back to tech. */
  featuredTech?: string[];
  year: number;
  github: string;
  url?: string;
  stars?: number;
  users?: string;
  image?: string;
  /** Gets the Featured mark in the index. */
  featured?: boolean;
  /** Stat label on the home cards, such as "Local-first" or "3K+ stars". */
  highlight?: string;
  /** Position in the home featured set. Unset means not on the home page. */
  featuredOrder?: number;
};

export const projects: Project[] = [
  // 2026
  {
    name: "pastr",
    tagline: "Paste text, get a link, decide when it disappears.",
    summary:
      "A pastebin with exact expiry, burn-after-read and end-to-end encryption where the server never sees the text. Syntax highlighting, markdown, a zero-dependency CLI.",
    description:
      "A pastebin that gets out of the way: paste text, get a link, decide when it disappears. Expiry is exact (Redis TTL), burn-after-read is atomic and cannot be triggered by link previews, and encrypted pastes keep the key in the URL fragment so the server never sees the text or the title. Syntax highlighting for 60+ languages, markdown, line links, edit tokens instead of accounts, a hastebin-compatible API and a zero-dependency CLI with an interactive paste browser.",
    tech: ["TypeScript", "Next.js", "React", "Redis"],
    featuredTech: ["TypeScript", "Next.js", "Redis"],
    year: 2026,
    github: "https://github.com/xditya/pastr",
    url: "https://pastr.xditya.me",
    image: "/images/pastr.png",
    featured: true,
    highlight: "Zero-knowledge",
    featuredOrder: 5,
  },
  {
    name: "engram",
    tagline: "Remember everything. Own everything.",
    summary:
      "A local-first library for links, reels, articles and notes. Share from any app, search the whole page, sync through your own Drive with end-to-end encryption.",
    description:
      "A local-first place for links, reels, articles, images and notes. Share from any app, tags land on their own, and search reads the whole page. Sync goes through your own Drive, iCloud or WebDAV, encrypted before it leaves the phone. Intelligence runs on your own key or a model on the device.",
    tech: ["TypeScript", "React Native", "Expo", "SQLite"],
    featuredTech: ["TypeScript", "React Native", "Expo"],
    year: 2026,
    github: "https://github.com/xditya/engram",
    url: "https://engram.xditya.me",
    image: "/images/engram.png",
    featured: true,
    highlight: "Local-first",
    featuredOrder: 1,
  },
  {
    name: "Splitty",
    tagline: "Scan a bill, tap who had what, settle over UPI",
    summary:
      "Splits restaurant bills with no backend state. Photograph the bill, tap to assign items, settle with a UPI QR per person.",
    description:
      "Splits restaurant bills with no backend state. Photograph the bill, tap to assign items, and settle with a UPI QR per person. Reads bills with Gemini or on-device tesseract.js.",
    tech: ["TypeScript", "React", "Vite"],
    year: 2026,
    github: "https://github.com/xditya/Splitty",
    url: "https://splitty.xditya.me",
    image: "/images/splitty.png",
    featured: true,
    highlight: "No backend",
    featuredOrder: 4,
  },
  {
    name: "Alamara",
    tagline: "Local-first document vault for your phone",
    description:
      "A phone vault for IDs, tickets, and certificates. Documents are scanned, encrypted, and searchable on-device, and never uploaded. Built with Expo and React Native.",
    tech: ["TypeScript", "React Native", "Expo"],
    year: 2026,
    github: "https://github.com/xditya/alamara",
  },
  // 2024
  {
    name: "Campus Services",
    tagline: "College services management app",
    description:
      "One Android app for campus services: digital wallet, printing, vehicle passes, ID cards, lab access, and vending.",
    tech: ["Kotlin", "Android", "MongoDB"],
    year: 2024,
    github: "https://github.com/xditya/CampusServicesManagementSystem",
  },
  {
    name: "GeminiBot",
    tagline: "AI-powered Telegram Bot",
    description: "A Telegram bot that chats using Google's Gemini API.",
    tech: ["TypeScript", "Deno"],
    year: 2024,
    github: "https://github.com/xditya/GeminiBot",
    image: "/images/geminibot.jpg",
  },
  {
    name: "TGdetailsBot",
    tagline: "Telegram Bot to fetch message details",
    description: "Gets message details (as JSON) and chat IDs. Runs live on Telegram.",
    tech: ["TypeScript"],
    year: 2024,
    github: "https://github.com/xditya/TGdetailsBot",
    url: "https://t.me/TGdetailsBot",
    image: "/images/tgdetails.png",
  },
  {
    name: "WhatsApp Utilities",
    tagline: "WhatsApp Bot",
    description: "A WhatsApp Bot using whatsapp-web.js to convert images into stickers.",
    tech: ["JavaScript"],
    year: 2024,
    github: "https://github.com/xditya/WhatsAppUtilitiesBot",
    image: "/images/whatsapputilities.png",
  },
  // 2023
  {
    name: "GetRestrictedMessages",
    tagline: "Copy messages from restricted chats",
    description: "A tool to copy messages from Telegram chats with forward restrictions enabled.",
    tech: ["Python"],
    year: 2023,
    github: "https://github.com/xditya/GetRestrictedMessages",
    stars: 83,
  },
  {
    name: "VehicleDetection",
    tagline: "Real-time Traffic Management System",
    description:
      "Detects vehicles in video feeds and adjusts traffic lights to match, built with YOLO and PyQt5.",
    tech: ["Python", "OpenCV", "PyQt5"],
    year: 2023,
    github: "https://github.com/xditya/VehicleDetection",
    image: "/images/vehicledetection.png",
  },
  {
    name: "AyuVritt",
    tagline: "Ayurveda, with an AI assist",
    description: "A web platform that applies AI to ayurvedic healing.",
    tech: ["Python", "Flask", "Next.js"],
    year: 2023,
    github: "https://github.com/xditya/AyuVritt",
    url: "https://camel-case.vercel.app/",
    image: "/images/ayuvritt.png",
  },
  {
    name: "WebShortener",
    tagline: "Lightweight Link Shortener",
    description: "A small link shortener web app.",
    tech: ["JavaScript"],
    year: 2023,
    github: "https://github.com/xditya/WebShortener",
  },
  {
    name: "Lyrics Searcher",
    tagline: "Song lyrics searching app",
    description: "Android app that finds song lyrics by title.",
    tech: ["Kotlin", "Jetpack Compose"],
    year: 2023,
    github: "https://github.com/xditya/LyricsSearcher/",
    url: "https://github.com/xditya/LyricsSearcher/releases/tag/v0.1",
  },
  // 2022
  {
    name: "ChannelActionsBot",
    shortName: "ChannelActions",
    tagline: "Telegram bot to auto approve chat join requests",
    description: "Approves or declines join requests for Telegram chats. Serves over 1M users.",
    tech: ["Deno", "TypeScript", "MongoDB"],
    year: 2022,
    github: "https://github.com/xditya/ChannelActionsBot",
    url: "https://channelactions.xditya.me",
    stars: 122,
    users: "1M+",
    image: "/images/channelactions.png",
    featured: true,
    highlight: "1M+ users",
    featuredOrder: 3,
  },
  {
    name: "ChannelAutoPost",
    tagline: "Telegram bot to auto post messages",
    description:
      "Automatically posts messages from one channel to another without the forwarded tag.",
    tech: ["Python"],
    year: 2022,
    github: "https://github.com/xditya/ChannelAutoPost",
    stars: 224,
    image: "/images/channelautopost.png",
  },
  {
    name: "captchaBot",
    tagline: "Telegram Captcha Bot",
    description: "A Telegram bot that runs captcha checks on new group members to stop spam.",
    tech: ["Python"],
    year: 2022,
    github: "https://github.com/xditya/captchaBot",
  },
  // 2021
  {
    name: "YouTubeFeeds",
    tagline: "YouTube video notifications on Telegram",
    description:
      "Get new YouTube video notifications from multiple channels on multiple Telegram chats.",
    tech: ["TypeScript"],
    year: 2021,
    github: "https://github.com/xditya/YouTubeFeeds",
    stars: 60,
  },
  {
    name: "Ultroid",
    tagline: "Pluggable Telegram userbot",
    description: "A Telegram userbot you extend with plugins. 3k+ stars on GitHub.",
    tech: ["Python", "MongoDB", "Redis"],
    year: 2021,
    github: "https://github.com/TeamUltroid/Ultroid",
    url: "https://t.me/TeamUltroid",
    stars: 3000,
    image: "/images/ultroid.png",
    featured: true,
    highlight: "3K+ stars",
    featuredOrder: 2,
  },
  {
    name: "ForceSub",
    tagline: "Force Subscribe Bot",
    description:
      "A Telegram bot that forces users to subscribe to a channel before they can interact.",
    tech: ["Python"],
    year: 2021,
    github: "https://github.com/xditya/ForceSub",
    stars: 63,
  },
  {
    name: "Telethon Bot",
    tagline: "Telegram bot boilerplate",
    description: "Telegram Bot/UserBot boilerplate built with the Telethon library.",
    tech: ["Python"],
    year: 2021,
    github: "https://github.com/xditya/TelethonBot",
    stars: 54,
    image: "/images/telethonbot.png",
  },
  {
    name: "BotStatus",
    tagline: "Bot status updater for Telegram",
    description: "Update your Telegram Bot's status on your channel periodically.",
    tech: ["Python"],
    year: 2021,
    github: "https://github.com/xditya/BotStatus",
    stars: 53,
  },
  {
    name: "VCBot",
    tagline: "Voice chat music bot",
    description: "Minimal Telegram voice chat music bot built with Pyrogram.",
    tech: ["Python"],
    year: 2021,
    github: "https://github.com/xditya/VCBot",
    stars: 38,
  },
  // 2020
  {
    name: "GroupManager",
    tagline: "Python based group managing bot",
    description: "A Telegram bot for moderating and managing groups.",
    tech: ["Python", "MongoDB"],
    year: 2020,
    github: "https://github.com/xditya/GroupManager",
    stars: 256,
    featured: true,
  },
];

export type FeaturedProject = Project & { featuredOrder: number; highlight: string };

/** The home page set, in display order. */
export function featuredProjects(): FeaturedProject[] {
  return projects
    .filter(
      (p): p is FeaturedProject =>
        p.featuredOrder !== undefined && p.highlight !== undefined,
    )
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}

/** Every year with at least one project, newest first. */
export function projectYears(): number[] {
  return [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a);
}

/** Tech names with how many projects use each, most used first. Ties keep first appearance. */
export function techCounts(): [string, number][] {
  const counts = new Map<string, number>();
  projects.forEach((p) =>
    p.tech.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
  );
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** "1M+ users", "★ 3K+" or "★ 256+"; null when there is nothing to show. */
export function formatStat(p: Project): string | null {
  if (p.users) return `${p.users} users`;
  if (p.stars) {
    return p.stars >= 1000
      ? `★ ${(p.stars / 1000).toFixed(0)}K+`
      : `★ ${p.stars}+`;
  }
  return null;
}
