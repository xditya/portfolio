import { featuredProjects, projects } from "@/content";
import { getGithubStats } from "@/lib/github";
import Hero from "@/components/home/Hero";
import Ticker from "@/components/home/Ticker";
import Statement from "@/components/home/Statement";
import FeaturedStack from "@/components/home/FeaturedStack";

export const revalidate = 3600;

export default async function HomePage() {
  const github = await getGithubStats();

  return (
    <>
      <Hero />
      <Ticker />
      <Statement github={github} />
      <FeaturedStack projects={featuredProjects()} count={projects.length} />
    </>
  );
}
