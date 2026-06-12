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
        background: "var(--bg)",
      }}
    >
      <p className="mono-label" style={{ color: "var(--muted)", letterSpacing: "0.2em" }}>
        LOADING THE GRID…
      </p>
    </div>
  ),
});

export default function GameClient() {
  return <PortfolioGame />;
}
