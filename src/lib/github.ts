// Server only so GITHUB_TOKEN never reaches the browser. Any failure returns
// fallbackStats; this never throws and never yields NaN.

import { fallbackStats, profile, type GithubStats } from "@/content";

const API = "https://api.github.com";
const REVALIDATE_SECONDS = 3600;
/** Pages of 100 repos to walk at most when summing stars. */
const MAX_PAGES = 10;

type User = { public_repos?: unknown; followers?: unknown };
type Repo = { stargazers_count?: unknown };

function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function getJson<T>(
  url: string,
): Promise<{ data: T; link: string | null }> {
  const res = await fetch(url, {
    headers: requestHeaders(),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status !== 200) {
    throw new Error(`GitHub responded ${res.status} for ${url}`);
  }
  return { data: (await res.json()) as T, link: res.headers.get("link") };
}

/** The url of the rel="next" entry in a Link header, if there is one. */
function nextPageUrl(link: string | null): string | null {
  if (!link) return null;
  for (const part of link.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (match && match[1].startsWith(API)) return match[1];
  }
  return null;
}

/** A finite number floored to an integer, or null for anything else. */
function whole(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.floor(value)
    : null;
}

export async function getGithubStats(): Promise<GithubStats> {
  const user = encodeURIComponent(profile.handle);
  try {
    const [profileRes, reposRes] = await Promise.all([
      getJson<User>(`${API}/users/${user}`),
      getJson<Repo[]>(`${API}/users/${user}/repos?per_page=100&type=owner`),
    ]);

    const repos = whole(profileRes.data?.public_repos);
    const followers = whole(profileRes.data?.followers);
    if (repos === null || followers === null || !Array.isArray(reposRes.data)) {
      return fallbackStats;
    }

    let list: Repo[] = reposRes.data;
    let next = nextPageUrl(reposRes.link);
    let pages = 1;
    while (next && pages < MAX_PAGES) {
      const more = await getJson<Repo[]>(next);
      if (!Array.isArray(more.data)) return fallbackStats;
      list = list.concat(more.data);
      next = nextPageUrl(more.link);
      pages += 1;
    }

    let stars = 0;
    for (const repo of list) {
      const count = whole(repo?.stargazers_count);
      if (count === null) return fallbackStats;
      stars += count;
    }

    return { repos, stars, followers };
  } catch {
    return fallbackStats;
  }
}
