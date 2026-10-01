import type { Metadata } from "next";
import NotFoundStage from "./not-found-stage";

// Server file so the 404 can name its own tab; the page itself is a client
// component in not-found-stage.tsx.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <NotFoundStage />;
}
