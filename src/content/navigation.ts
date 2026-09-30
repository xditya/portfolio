// Site navigation: the navbar, the footer's page links and the palette's
// Pages group.

export type NavItem = {
  href: string;
  label: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/links", label: "Links" },
  { href: "/game", label: "Game" },
];

export const footerLinks: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/links", label: "Links" },
  { href: "/game", label: "Game" },
  { href: "/terms", label: "Terms" },
];

export type PalettePage = NavItem & {
  /** Analytics id, reported as `p-{id}`. */
  id: string;
  keywords: string;
};

export const palettePages: PalettePage[] = [
  { id: "home", href: "/", label: "Home", keywords: "home index start" },
  { id: "about", href: "/about", label: "About", keywords: "about me bio experience stats" },
  { id: "projects", href: "/projects", label: "Projects", keywords: "projects work index repos" },
  { id: "contact", href: "/contact", label: "Contact", keywords: "contact hire form email message" },
  { id: "links", href: "/links", label: "Links", keywords: "links tools services" },
  { id: "game", href: "/game", label: "Play the Game", keywords: "game 3d play grid explore fun three" },
];
