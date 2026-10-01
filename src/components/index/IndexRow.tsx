"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { RowHighlight, useActiveRow } from "./RowHighlight";
import s from "./Row.module.css";

export function RowList({ children }: { children: ReactNode }) {
  // Safari drops list semantics with list-style: none.
  return (
    <ul className={s.list} role="list">
      {children}
    </ul>
  );
}

export function RowTag({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <span className={s.tag} data-accent={accent ? "" : undefined}>
      {children}
    </span>
  );
}

type IndexRowProps = {
  /** Unique among the rows of one RowGroup. */
  id: string;
  /** Shown as two digits. */
  index: number;
  title: string;
  /** Where the title goes. The link is stretched over the whole row. */
  href: string;
  /** External links open in a new tab; internal ones use the router. */
  external?: boolean;
  /** Accessible name for the link when the title alone does not say enough. */
  linkLabel?: string;
  tag?: ReactNode;
  subtitle: string;
  /** Middle column on desktop; drops under the subtitle on phones. */
  middle?: ReactNode;
  /** Sits before the arrow. Links and buttons in here stay clickable. */
  end?: ReactNode;
  /** Phones only: the title becomes a button toggling `children` (panelId). */
  disclosure?: { open: boolean; onToggle: () => void; panelId: string };
  /** Rendered under the row, inside the same list item. */
  children?: ReactNode;
};

export default function IndexRow({
  id,
  index,
  title,
  href,
  external = false,
  linkLabel,
  tag,
  subtitle,
  middle,
  end,
  disclosure,
  children,
}: IndexRowProps) {
  const active = useActiveRow()?.id === id;
  const linkClass = `${s.title} ${s.link}`;

  return (
    <li
      className={s.row}
      data-row={id}
      data-active={active ? "" : undefined}
      data-disclosure={disclosure ? "" : undefined}
      data-open={disclosure?.open ? "" : undefined}
    >
      <div className={s.head}>
        <RowHighlight id={id} />

        <span className={`mono-sm ${s.index}`}>
          {String(index).padStart(2, "0")}
        </span>

        <div className={s.main}>
          <span className={s.titleLine}>
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                aria-label={linkLabel}
              >
                {title}
              </a>
            ) : (
              <Link href={href} className={linkClass} aria-label={linkLabel}>
                {title}
              </Link>
            )}
            {disclosure && (
              <button
                type="button"
                className={`${s.title} ${s.toggle}`}
                aria-expanded={disclosure.open}
                aria-controls={disclosure.panelId}
                onClick={disclosure.onToggle}
              >
                {title}
              </button>
            )}
            {tag}
          </span>
          <span className={s.sub}>{subtitle}</span>
        </div>

        {middle ? <div className={`mono-sm ${s.middle}`}>{middle}</div> : null}
        {end ? <div className={s.end}>{end}</div> : null}

        <span className={s.arrow} aria-hidden="true">
          ↗
        </span>
        {disclosure && <span className={s.plus} aria-hidden="true" />}
      </div>

      {children}
    </li>
  );
}
