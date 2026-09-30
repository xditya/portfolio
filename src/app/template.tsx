import type { ReactNode } from "react";
import PageTransition from "@/components/PageTransition";
import styles from "./template.module.css";

// Re-mounts on every route change. The new page is revealed through a
// circle that grows from where the pointer last went down (the ink bloom,
// see template.module.css). Phones get a short fade, reduced motion gets
// no animation at all.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <PageTransition />
      <div className={styles.page}>{children}</div>
    </>
  );
}
