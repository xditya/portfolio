import React from "react";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsPage() {
  const dummyProjects = [
    {
      name: "Project One",
      description: "A brief description of project one.",
      githubUrl: "https://github.com/your-username/project-one",
      projectUrl: "https://project-one.example.com",
    },
    {
      name: "Project Two",
      description: "A brief description of project two.",
      githubUrl: "",
      projectUrl: "https://project-two.example.com",
    },
    {
      name: "Project Three",
      description: "A brief description of project three.",
      githubUrl: "https://github.com/your-username/project-three",
      projectUrl: "",
    },
    {
      name: "Project Four",
      description: "A brief description of project four.",
      githubUrl: "https://github.com/your-username/project-four",
      projectUrl: "https://project-four.example.com",
    },
    {
      name: "Project Five",
      description: "A brief description of project five.",
      githubUrl: "",
      projectUrl: "",
    },
    {
      name: "Project Six",
      description: "A brief description of project six.",
      githubUrl: "https://github.com/your-username/project-six",
      projectUrl: "https://project-six.example.com",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--primary)] mb-8 text-center">
          Projects
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyProjects.map((project, index) => (
            <ProjectCard
              key={index}
              name={project.name}
              description={project.description}
              githubUrl={project.githubUrl}
              projectUrl={project.projectUrl}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
