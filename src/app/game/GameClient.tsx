"use client";

import dynamic from "next/dynamic";

const PortfolioGame = dynamic(() => import("@/components/PortfolioGame"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-0)",
      }}
    >
      <p className="mono-label" style={{ letterSpacing: "0.2em" }}>
        LOADING THE GRID…
      </p>
    </div>
  ),
});

export default function GameClient() {
  return <PortfolioGame />;
}
