"use client";

import React from "react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface ProjectCardProps {
  name: string;
  description: string;
  githubUrl?: string;
  projectUrl?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  githubUrl,
  projectUrl,
}) => {
  return (
    <div className="bg-[var(--secondary)] text-[var(--foreground)] rounded-lg shadow-lg p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-[var(--primary)] mr-1">
            {name}
          </h3>
        </div>
        <p className="text-sm text-[var(--foreground)]">{description}</p>
      </div>

      <div className="flex gap-4 mt-auto">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--background)] font-semibold rounded-full px-4 py-1 text-sm shadow hover:bg-[var(--accent)] transition-colors"
          >
            <FaGithub /> GitHub
          </a>
        )}
        {projectUrl && (
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-[var(--primary)] hover:underline font-medium text-sm"
          >
            <FaExternalLinkAlt /> Open Project
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
