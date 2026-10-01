import type { PointerEvent } from "react";

/** Sets `--o` to the side the pointer entered or left through, so a button's fill grows from and retracts toward it. */
export function setFillOrigin(e: PointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty(
    "--o",
    e.clientX - rect.left < rect.width / 2 ? "left" : "right",
  );
}
