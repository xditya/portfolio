import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/content";

export const alt = `${profile.name} · ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori reads no stylesheet, so these repeat the globals.css tokens.
const GROUND = "#070A12";
const TEXT = "#EEEDE6";
const TEXT_2 = "#A6ABB8";
const ACCENT = "#4D62FF";

const INK =
  "radial-gradient(ellipse 14% 20% at 66% 52%, rgba(185, 196, 255, 0.28) 0%, rgba(185, 196, 255, 0) 70%), " +
  "radial-gradient(ellipse 40% 64% at 66% 52%, rgba(77, 98, 255, 0.62) 0%, rgba(77, 98, 255, 0.26) 40%, rgba(77, 98, 255, 0) 72%), " +
  "radial-gradient(ellipse 30% 50% at 90% 14%, rgba(53, 211, 255, 0.36) 0%, rgba(53, 211, 255, 0.12) 42%, rgba(53, 211, 255, 0) 72%), " +
  GROUND;

// Static cut because satori cannot drive variable font axes; read via cwd so
// the file is traced into the build output.
const FONT = join(process.cwd(), "src", "app", "BricolageGrotesque-ExtraBold.ttf");

export default async function Image() {
  const font = await readFile(FONT);
  const { lead, emphasis, trail } = profile.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: INK,
          fontFamily: "Bricolage Grotesque",
          color: TEXT,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 232,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
          }}
        >
          <span>{profile.name}</span>
          <span style={{ color: ACCENT }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 28,
            paddingLeft: 12,
            fontSize: 38,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: TEXT_2,
          }}
        >
          <span style={{ marginRight: 14 }}>{lead}</span>
          <span style={{ marginRight: 14, color: TEXT }}>{emphasis}</span>
          <span>{trail}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage Grotesque", data: font, weight: 800, style: "normal" },
      ],
    },
  );
}
