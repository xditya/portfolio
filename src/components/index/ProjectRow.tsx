"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { formatStat, type Project } from "@/content";
import { markerTransition } from "@/components/nav/shared";
import IndexRow, { RowTag } from "./IndexRow";
import s from "./Row.module.css";

type Props = {
  project: Project;
  /** Running number across the whole page, starting at 1. */
  index: number;
  /** Phones: whether the details are open. */
  open: boolean;
  onToggle: () => void;
};

// Both the desktop link and the phone toggle are rendered and CSS shows one,
// so server and client markup agree.
export default function ProjectRow({ project, index, open, onToggle }: Props) {
  const panelId = `project-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduce = useReducedMotion() === true;
  const stat = formatStat(project);
  // Mount the screenshot on first open so a closed panel does not fetch it.
  const [opened, setOpened] = useState(open);
  const toggle = () => {
    setOpened(true);
    onToggle();
  };

  const end =
    stat || project.url ? (
      <>
        {stat && <span className={`mono-sm ${s.stat}`}>{stat}</span>}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`chip ${s.live}`}
            aria-label={`Live, ${project.name}`}
          >
            Live ↗
          </a>
        )}
      </>
    ) : undefined;

  return (
    <IndexRow
      id={project.name}
      index={index}
      title={project.name}
      href={project.github}
      external
      linkLabel={`${project.name} on GitHub`}
      tag={project.featured ? <RowTag accent>Featured</RowTag> : undefined}
      subtitle={project.tagline}
      middle={project.tech.join(", ")}
      end={end}
      disclosure={{ open, onToggle: toggle, panelId }}
    >
      <motion.div
        id={panelId}
        className={s.panel}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={markerTransition(reduce)}
      >
        <div className={s.panelInner} inert={!open}>
          {project.image && opened && (
            <div className={s.shot}>
              <Image
                src={project.image}
                alt={`${project.name} screenshot`}
                fill
                sizes="(max-width: 760px) 92vw, 320px"
                className={s.shotImg}
              />
            </div>
          )}
          <p className={s.desc}>{project.description}</p>
          <p className={`mono-sm ${s.tech}`}>{project.tech.join(", ")}</p>
          <div className={s.actions}>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-up"
            >
              GitHub{" "}
              <span className="arr" aria-hidden="true">
                ↗
              </span>
            </a>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-up"
              >
                Live{" "}
                <span className="arr" aria-hidden="true">
                  ↗
                </span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </IndexRow>
  );
}
