import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CommandPalette from "@/components/CommandPalette";
import PageAssist from "@/components/PageAssist";
import { profile } from "@/content";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

// Display: variable weight plus the width and optical-size axes, so the
// hero can run condensed (wdth 78) and labels can use the small optical cut.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

// Body
const geist = Geist({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-geist",
  display: "swap",
});

// Data: years, stars, uptime, keyboard hints
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: profile.meta.title,
    template: profile.meta.titleTemplate,
  },
  description: profile.meta.description,
  keywords: profile.meta.keywords,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: profile.siteUrl,
    siteName: profile.meta.siteName,
    title: profile.meta.title,
    description: profile.meta.ogDescription,
  },
  twitter: {
    card: "summary_large_image",
    creator: profile.meta.twitterCreator,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// viewport-fit: cover is what makes env(safe-area-inset-bottom) non-zero on
// iOS, so the phone dock can sit above the home indicator.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#070A12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${bricolage.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head />
      <body className="grid-bg">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <GoogleAnalytics />
        <SmoothScroll />
        <Navbar />
        <main id="main" style={{ position: "relative", zIndex: 1 }}>
          {children}
        </main>
        <Footer />
        <CommandPalette />
        <PageAssist />
      </body>
    </html>
  );
}
