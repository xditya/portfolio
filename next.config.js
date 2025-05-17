/** @type {import('next').NextConfig} */

const redirectLinks = {
  yt: "https://www.youtube.com/@xditya",
  github: "https://github.com/xditya",
  tg: "https://t.me/xditya",
  x: "https://x.com/its_xditya",
  twitter: "https://twitter.com/its_xditya",
  linkedin: "https://www.linkedin.com/in/xditya",
  bots: "https://t.me/botzhub/76?embed=true&dark=1",
};

const nextConfig = {
  async redirects() {
    return Object.entries(redirectLinks).map(([key, value]) => ({
      source: `/${key}`,
      destination: value,
      permanent: true,
    }));
  },
};

module.exports = nextConfig;
