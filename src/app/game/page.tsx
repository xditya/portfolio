import type { Metadata } from "next";
import GameClient from "./GameClient";

export const metadata: Metadata = {
  title: "Game",
  description:
    "Explore my portfolio as an interactive 3D game — discover projects, experience, stats, and links inside a neon grid world.",
};

export default function GamePage() {
  return <GameClient />;
}
