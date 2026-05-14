import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Aditya — Full-stack Developer",
    template: "%s · Aditya",
  },
  description:
    "Full-stack developer building web apps, Telegram bots, and open-source tools. Based in Kerala, India.",
  keywords: [
    "Aditya",
    "xditya",
    "full-stack developer",
    "open source",
    "Telegram bot",
    "Python",
    "TypeScript",
    "Next.js",
    "portfolio",
  ],
  authors: [{ name: "Aditya", url: "https://xditya.me" }],
  creator: "Aditya",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xditya.me",
    siteName: "Aditya Portfolio",
    title: "Aditya — Full-stack Developer",
    description:
      "Full-stack developer building web apps, Telegram bots, and open-source tools.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@xditya",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grid-bg">
          <SmoothScroll />
          <Navbar />
          <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
          <Footer />
      </body>
    </html>
  );
}
