import type { Metadata } from "next";
import mongoose from "mongoose";
import { cache } from "react";
import ImageDetailClient, { type ImageDetail } from "./ImageDetailClient";
import { siteKeywords } from "@/lib/seo";
import { connectDB } from "@/lib/db";
import ImageModel from "@/models/Image";

interface PageProps {
  params: Promise<{ id: string }>;
}

const getImage = cache(async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const db = await connectDB();
  if (!db) return null;

  try {
    return await ImageModel.findById(id)
      .select("title imageUrl prompt model category tags createdAt updatedAt")
      .lean()
      .exec();
  } catch (error) {
    console.error("[SEO] Failed to load image metadata:", error);
    return null;
  }
});

function getDescription(prompt: string) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).trimEnd()}...`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const image = await getImage(id);

  if (!image) {
    return {
      title: "AI Image Prompt",
      description: "Explore AI image prompts and creative inspiration on Pixnora.",
      robots: { index: false, follow: true },
    };
  }

  const title = `${image.title} AI Image Prompt`;
  const description = getDescription(image.prompt) ||
    `Explore this ${image.category || image.model} AI image prompt on Pixnora.`;
  const canonical = `/image/${id}`;

  return {
    title,
    description,
    keywords: [
      ...siteKeywords,
      image.category,
      image.model,
      ...(image.tags || []),
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: `${title} | Pixnora`,
      description,
      siteName: "Pixnora",
      images: [{ url: image.imageUrl, alt: image.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Pixnora`,
      description,
      images: [image.imageUrl],
    },
  };
}

export default async function ImagePage({ params }: PageProps) {
  const { id } = await params;
  const image = await getImage(id);
  const initialImage: ImageDetail | null = image
    ? {
        _id: image._id.toString(),
        title: image.title,
        imageUrl: image.imageUrl,
        prompt: image.prompt,
        model: image.model,
        category: image.category,
        tags: image.tags,
        createdAt: image.createdAt instanceof Date ? image.createdAt.toISOString() : undefined,
      }
    : null;
  const structuredData = image
    ? {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        name: image.title,
        contentUrl: image.imageUrl,
        description: getDescription(image.prompt),
        representativeOfPage: true,
        creator: { "@type": "Organization", name: "Pixnora" },
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ImageDetailClient initialImage={initialImage} />
    </>
  );
}
