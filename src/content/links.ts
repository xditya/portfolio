export type ToolLink = {
  name: string;
  description: string;
  href: string;
  external: boolean;
};

export const links: ToolLink[] = [
  { name: "Website Status", description: "Check the uptime of my services", href: "/status", external: false },
  { name: "Link Shortener", description: "Shorten your links easily", href: "https://short.xditya.me", external: true },
  { name: "PasteBin", description: "Paste and share code snippets", href: "https://paste.xditya.me", external: true },
  { name: "REST APIs", description: "A collection of REST APIs for various purposes", href: "https://apis.xditya.me", external: true },
  { name: "Terms & Conditions", description: "Legal terms for freelance clients", href: "/terms", external: false },
];
