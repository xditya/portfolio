// Game-facing view of src/content. The exported names stay so that
// PortfolioGame.tsx compiles unchanged; the data itself lives in src/content.

import { profile } from "@/content/profile";
import { projects, projectYears, type Project } from "@/content/projects";
import { stats } from "@/content/stats";
import { experience } from "@/content/experience";
import { techStack } from "@/content/techStack";
import { socials } from "@/content/socials";
import { links } from "@/content/links";

export type GameProject = Project;

export const GAME_PROJECTS: GameProject[] = projects;

export const GAME_YEARS = projectYears();

export const GAME_STATEMENT = profile.statement;

export const GAME_STATS = stats;

export const GAME_EXPERIENCE = experience;

// The tech garden is a ring laid out for six orbs; /about shows the full list.
export const GAME_TECH_STACK = techStack.slice(0, 6);

export const GAME_SOCIALS = socials;

export const GAME_LINKS = links;

export const GAME_ABOUT = {
  name: profile.name,
  handle: profile.handle,
  role: profile.role,
  location: profile.location,
  available: profile.available,
  email: profile.email,
  age: profile.age,
  whatIDo: profile.whatIDo.text,
  howIWork: profile.howIWork.text,
  resume: profile.resume,
};
