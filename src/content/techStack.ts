// The tech stack chips on /about and the orbs in the game's tech garden.
// `logo` is the Simple Icons slug for the tool, for when a phase renders logos.

export type TechStackItem = {
  name: string;
  color: string;
  logo: string;
};

export const techStack: TechStackItem[] = [
  { name: "Python", color: "#3776AB", logo: "python" },
  { name: "TypeScript", color: "#3178C6", logo: "typescript" },
  { name: "Next.js", color: "#F0F6FC", logo: "nextdotjs" },
  { name: "Deno", color: "#70FFAF", logo: "deno" },
  { name: "MongoDB", color: "#47A248", logo: "mongodb" },
  { name: "Kotlin", color: "#7F52FF", logo: "kotlin" },
];
