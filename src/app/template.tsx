import type { ReactNode } from "react";
import PageTransition from "@/components/PageTransition";
import PageBloom from "@/components/PageBloom";
import styles from "./template.module.css";

// Re-mounts on every route change. The new page is revealed through a
// circle that grows from where the pointer last went down (the ink bloom,
// see template.module.css; PageBloom places the origin). Phones get a short
// fade, reduced motion gets no animation at all.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <PageTransition />
      <PageBloom className={styles.page}>{children}</PageBloom>
    </>
  );
}
