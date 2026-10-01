import type { ReactNode } from "react";
import PageTransition from "@/components/PageTransition";
import PageBloom from "@/components/PageBloom";
import styles from "./template.module.css";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <PageTransition />
      <PageBloom className={styles.page}>{children}</PageBloom>
    </>
  );
}
