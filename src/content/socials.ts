// Social profiles in display order. Home, footer, contact, the palette and
// the game's portals all read this list.

export type SocialLabel = "GitHub" | "X / Twitter" | "LinkedIn" | "Telegram" | "YouTube";

export type Social = {
  label: SocialLabel;
  href: string;
  /** Brand colour, used by the game's portals. */
  color: string;
};

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/xditya", color: "#F4F4EF" },
  { label: "X / Twitter", href: "https://x.com/its_xditya", color: "#9CA3AF" },
  { label: "LinkedIn", href: "https://linkedin.com/in/xditya", color: "#0A66C2" },
  { label: "Telegram", href: "https://t.me/xditya", color: "#2AABEE" },
  { label: "YouTube", href: "https://youtube.com/@xditya", color: "#FF0000" },
];

export function social(label: SocialLabel): Social {
  const found = socials.find((s) => s.label === label);
  if (!found) throw new Error(`Unknown social: ${label}`);
  return found;
}

/** "https://t.me/xditya" becomes "t.me/xditya", for display. */
export function bareUrl(href: string): string {
  return href.replace(/^https?:\/\//, "");
}
