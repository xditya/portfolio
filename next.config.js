/** @type {import('next').NextConfig} */

const redirectLinks = {
  yt: "https://www.youtube.com/@xditya",
  github: "https://github.com/xditya",
  tg: "https://t.me/xditya",
  x: "https://x.com/its_xditya",
  twitter: "https://twitter.com/its_xditya",
  linkedin: "https://www.linkedin.com/in/xditya",
  bots: "https://t.me/botzhub/76?embed=true&dark=1",
  digitalOcean: "https://www.digitalocean.com/?refcode=7b7d6a915392",
};

const nextConfig = {
  // Stop `next dev` from appending its agent-rules block to CLAUDE.md.
  agentRules: false,
  // Dev only: without this, phones on the ngrok tunnel lose the HMR socket and never hydrate.
  allowedDevOrigins: ["*.ngrok-free.app"],
  poweredByHeader: false,
  // Gyroscope and accelerometer stay allowed: the phone tilt uses them.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return Object.entries(redirectLinks).map(([key, value]) => ({
      source: `/${key}`,
      destination: value,
      permanent: true,
    }));
  },
};

module.exports = nextConfig;
