import type { PointerEvent } from "react";

/**
 * Sets `--o`, the side a button's fill grows from, to the half the pointer
 * entered (or left) through. Wired to pointerenter and pointerleave so the
 * fill retracts toward the exit side too.
 */
export function setFillOrigin(e: PointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty(
    "--o",
    e.clientX - rect.left < rect.width / 2 ? "left" : "right",
  );
}
