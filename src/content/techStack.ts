// The tech stack chips on /about. The first six are also the orbs in the
// game's tech garden (src/lib/gameData.ts).
// `logo` is the Simple Icons slug, served from /logos/<slug>.svg. `color` is
// the tool's brand colour where it reads on a dark chip; brands that are
// black or a deep blue get a lighter tint so every logo keeps at least 3:1
// against the chip.

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
  { name: "JavaScript", color: "#F7DF1E", logo: "javascript" },
  { name: "Java", color: "#F0F6FC", logo: "openjdk" },
  { name: "Dart", color: "#0175C2", logo: "dart" },
  { name: "C++", color: "#659AD2", logo: "cplusplus" },
  { name: "Angular", color: "#F0344F", logo: "angular" },
  { name: "React", color: "#61DAFB", logo: "react" },
  { name: "Vite", color: "#9D4EFF", logo: "vite" },
  { name: "React Native", color: "#61DAFB", logo: "react" },
  { name: "Expo", color: "#F0F6FC", logo: "expo" },
  { name: "Flutter", color: "#54C5F8", logo: "flutter" },
  { name: "Jetpack Compose", color: "#4285F4", logo: "jetpackcompose" },
  { name: "Swift", color: "#F05138", logo: "swift" },
  { name: "Android", color: "#3DDC84", logo: "android" },
  { name: "Spring Boot", color: "#6DB33F", logo: "springboot" },
  { name: "FastAPI", color: "#009688", logo: "fastapi" },
  { name: "Node.js", color: "#5FA04E", logo: "nodedotjs" },
  { name: "Flask", color: "#3BABC3", logo: "flask" },
  { name: "SQLite", color: "#4FA3D8", logo: "sqlite" },
  { name: "Redis", color: "#FF4438", logo: "redis" },
  { name: "AWS", color: "#FF9900", logo: "amazonwebservices" },
  { name: "Claude", color: "#D97757", logo: "claude" },
  { name: "Gemini", color: "#8E75B2", logo: "googlegemini" },
  { name: "Git", color: "#F03C2E", logo: "git" },
  { name: "GitLab", color: "#FC6D26", logo: "gitlab" },
  { name: "GitHub Actions", color: "#2088FF", logo: "githubactions" },
  { name: "Docker", color: "#2496ED", logo: "docker" },
  { name: "Vercel", color: "#F0F6FC", logo: "vercel" },
  { name: "FFmpeg", color: "#2FA83A", logo: "ffmpeg" },
  { name: "LaTeX", color: "#008080", logo: "latex" },
  { name: "Telegram", color: "#26A5E4", logo: "telegram" },
  { name: "OpenCV", color: "#8B73F2", logo: "opencv" },
  { name: "Qt", color: "#41CD52", logo: "qt" },
];
