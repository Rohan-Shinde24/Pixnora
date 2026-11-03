import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { getSiteBaseUrl, siteKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: getSiteBaseUrl(),
  title: "AI Image Prompts & Inspiration",
  description:
    "Discover AI image prompts for Midjourney, DALL·E, Stable Diffusion, and more. Browse creative styles, copy prompts, and find inspiration for your next image.",
  keywords: siteKeywords,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Pixnora",
    title: "AI Image Prompts & Inspiration | Pixnora",
    description:
      "Browse creative AI image prompts, discover new styles, and find inspiration for your next image.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Prompts & Inspiration | Pixnora",
    description:
      "Browse creative AI image prompts, discover new styles, and find inspiration for your next image.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Pixnora",
      ...(getSiteBaseUrl() ? { url: getSiteBaseUrl()?.toString() } : {}),
    },
    {
      "@type": "WebSite",
      name: "Pixnora",
      description:
        "A curated library of AI image prompts and creative inspiration.",
      ...(getSiteBaseUrl() ? { url: getSiteBaseUrl()?.toString() } : {}),
      inLanguage: "en",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <GalleryClient />
    </>
  );
}
