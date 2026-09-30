// Pieces the top bar, the phone dock and the More sheet share.

import { footerLinks, links, navItems, type NavItem } from "@/content";

/** The four pages that get a dock cell; the fifth cell is More. */
const DOCK_HREFS = ["/", "/about", "/projects", "/contact"];

export const dockItems: NavItem[] = navItems.filter((item) =>
  DOCK_HREFS.includes(item.href),
);

const statusLink = links.find((link) => link.href === "/status");
const termsLink = footerLinks.find((link) => link.href === "/terms");

/** Everything the dock does not show: Links, Game, Website Status, Terms. */
export const moreItems: NavItem[] = [
  ...navItems.filter((item) => !DOCK_HREFS.includes(item.href)),
  ...(statusLink ? [{ href: statusLink.href, label: statusLink.name }] : []),
  ...(termsLink ? [termsLink] : []),
];

/** Home matches exactly; every other section matches its subtree. */
export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export const MARKER_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 32,
} as const;

export const INSTANT = { duration: 0 } as const;

/** The site's --ease-out curve, as Motion cannot read a CSS variable. */
export const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

export function markerTransition(reduce: boolean) {
  return reduce ? INSTANT : MARKER_SPRING;
}

/** The command palette listens for this and reports cmdk_open itself. */
export function openPalette(): void {
  window.dispatchEvent(new CustomEvent("cmdk:open"));
}
