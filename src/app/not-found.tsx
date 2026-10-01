import type { Metadata } from "next";
import NotFoundStage from "./not-found-stage";

// Server wrapper so the 404 can export metadata.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <NotFoundStage />;
}
