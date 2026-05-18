import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Archivo, Space_Grotesk, JetBrains_Mono } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const jetmono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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
      <head />
      <body
        className={`${archivo.variable} ${space.variable} ${jetmono.variable} grid-bg`}
      >
        <GoogleAnalytics />
        <SmoothScroll />
        <Navbar />
        <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
