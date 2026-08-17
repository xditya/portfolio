import type { Metadata } from "next";
import GameClient from "./GameClient";

export const metadata: Metadata = {
  title: "Game",
  description:
    "My portfolio as a playable 3D game. Fly around a neon grid world and discover projects, experience, stats, and links.",
};

export default function GamePage() {
  return <GameClient />;
}
