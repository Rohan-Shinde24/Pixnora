import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Providers from "./Providers";
import { getSiteBaseUrl, siteKeywords } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteBaseUrl(),
  title: {
    default: "AI Image Prompts & Inspiration | Pixnora",
    template: "%s | Pixnora",
  },
  description:
    "Discover creative AI image prompts for Midjourney, DALL·E, Stable Diffusion, and more.",
  keywords: siteKeywords,
  applicationName: "Pixnora",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Pixnora",
    title: "AI Image Prompts & Inspiration | Pixnora",
    description:
      "Discover creative AI image prompts for Midjourney, DALL·E, Stable Diffusion, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Prompts & Inspiration | Pixnora",
    description:
      "Discover creative AI image prompts for Midjourney, DALL·E, Stable Diffusion, and more.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
