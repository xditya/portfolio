// The numbers on the home page, /about and the game's stat plaza.

import { currentYear, profile } from "./profile";

export type Stat = {
  label: string;
  value: number;
  suffix: string;
};

export type GithubStats = {
  repos: number;
  stars: number;
  followers: number;
};

/** Today's GitHub numbers, used until a live fetch replaces them. */
export const fallbackStats: GithubStats = { repos: 20, stars: 1770, followers: 576 };

export const yearsCoding = currentYear - profile.codingSince;

export function siteStats(github: GithubStats = fallbackStats): Stat[] {
  return [
    { label: "Repos", value: github.repos, suffix: "+" },
    { label: "GitHub Stars", value: github.stars, suffix: "+" },
    { label: "Followers", value: github.followers, suffix: "+" },
    { label: "Years Coding", value: yearsCoding, suffix: "+" },
  ];
}

export const stats: Stat[] = siteStats();
