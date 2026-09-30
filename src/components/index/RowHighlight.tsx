"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { INSTANT, MARKER_SPRING } from "@/components/nav/shared";
import s from "./Row.module.css";

// A row the pointer held for less than this before moving on was flicked past.
const FLICK_MS = 80;

// Damping ratio 0.7 (28 / 40): the bar overshoots by a few percent. Used for
// the one move that follows a flick; every other move is critically damped.
const FLICK_SPRING = { type: "spring", stiffness: 400, damping: 28 } as const;

const FADE_IN = { duration: 0.15 } as const;

type Active = {
  id: string;
  /** Hovered with a mouse or pen, as opposed to reached with the keyboard. */
  pointer: boolean;
  /** When the row became active (event time, ms). */
  at: number;
  /** The pointer crossed the previous row fast enough to earn a bounce. */
  flick: boolean;
  /** No row was active before this one, so the bar fades in instead of travelling. */
  fresh: boolean;
};

type Group = { active: Active | null; layoutId: string; reduce: boolean };

const GroupContext = createContext<Group | null>(null);

function rowOf(target: EventTarget): string | null {
  return (
    (target as Element).closest<HTMLElement>("[data-row]")?.dataset.row ?? null
  );
}

function next(
  prev: Active | null,
  id: string | null,
  pointer: boolean,
  at: number,
): Active | null {
  if (id === null) return null;
  if (prev?.id === id) {
    return pointer && !prev.pointer ? { ...prev, pointer: true } : prev;
  }
  return {
    id,
    pointer,
    at,
    fresh: prev === null,
    flick: pointer && prev !== null && at - prev.at < FLICK_MS,
  };
}

/**
 * Wraps every row that shares one highlight bar. It remembers which row is
 * active: the one under a mouse or pen, or the one holding keyboard focus.
 * Rows are found by their data-row attribute, so they need no handlers of
 * their own. Touch never activates a row.
 */
export function RowGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState<Active | null>(null);
  const layoutId = `row-highlight-${useId()}`;
  const reduce = useReducedMotion() === true;

  const onPointerOver = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const id = rowOf(e.target);
    const at = e.timeStamp;
    setActive((prev) => next(prev, id, true, at));
  };

  // A click focuses a link too; only focus that shows a ring moves the bar.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.target.matches(":focus-visible")) return;
    const id = rowOf(e.target);
    const at = e.timeStamp;
    setActive((prev) => next(prev, id, false, at));
  };

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setActive(null);
  };

  return (
    <GroupContext.Provider value={{ active, layoutId, reduce }}>
      <div
        className={className}
        onPointerOver={onPointerOver}
        onPointerLeave={() => setActive(null)}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

/** The active row of the surrounding RowGroup, or null. */
export function useActiveRow(): { id: string; pointer: boolean } | null {
  return useContext(GroupContext)?.active ?? null;
}

/**
 * The bar itself. Every row renders one and only the active row's exists;
 * the shared layoutId lets Motion carry it from the last row to this one.
 */
export function RowHighlight({ id }: { id: string }) {
  const group = useContext(GroupContext);
  const active = group?.active;
  if (!group || !active || active.id !== id) return null;

  return (
    <motion.span
      layoutId={group.layoutId}
      className={s.highlight}
      aria-hidden="true"
      initial={active.fresh && !group.reduce ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={
        group.reduce
          ? INSTANT
          : {
              layout: active.flick ? FLICK_SPRING : MARKER_SPRING,
              opacity: FADE_IN,
            }
      }
    />
  );
}
