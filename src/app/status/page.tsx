import type { Metadata } from "next";
import StatusBoard from "@/components/status/StatusBoard";
import s from "./page.module.css";

export const metadata: Metadata = { title: "Status" };

export default function StatusPage() {
  return (
    <div className={`container-x ${s.page}`}>
      <StatusBoard />
    </div>
  );
}
