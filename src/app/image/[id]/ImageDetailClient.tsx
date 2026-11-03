"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Heart, ArrowLeft, Sparkles, Calendar, Tag } from "lucide-react";
import toast from "react-hot-toast";

export interface ImageDetail {
  _id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  model: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
}

export default function ImageDetailClient({ initialImage }: { initialImage: ImageDetail | null }) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [image, setImage] = useState<ImageDetail | null>(initialImage);
  const [loading, setLoading] = useState(!initialImage);
  const [notFound, setNotFound] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || initialImage) return;
    fetch(`/api/images/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setImage(data.image))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, initialImage]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const favs = JSON.parse(localStorage.getItem("favImages") || "[]") as string[];
      setIsFav(favs.includes(id));
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("favImages") || "[]") as string[];
    const updated = isFav ? favs.filter((f) => f !== id) : [...favs, id];
    localStorage.setItem("favImages", JSON.stringify(updated));
    setIsFav(!isFav);
    toast.success(isFav ? "Removed from favourites" : "Added to favourites");
  };

  const copyPrompt = () => {
    if (!image) return;
    navigator.clipboard.writeText(image.prompt).then(() => {
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--fg)] border-t-transparent" />
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Loading image…</p>
        </div>
      </div>
    );
  }

  if (notFound || !image) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <h1 className="text-2xl font-bold">Image Not Found</h1>
        <p style={{ color: "var(--fg-muted)" }}>This prompt may have been removed.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 rounded-full px-6 py-2 text-sm transition-colors"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Back nav */}
      <div className="px-4 md:px-8 pt-6 pb-2">
        <button
          id="back-button"
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm transition-colors"
          style={{ color: "var(--fg-muted)" }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left — Image */}
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-2xl border shadow-xl" style={{ borderColor: "var(--border)", background: "var(--bg-card)", boxShadow: "var(--shadow-card)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.imageUrl}
              alt={image.title}
              className="w-full h-auto object-cover"
            />
            {/* Floating action buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                id="fav-button"
                onClick={toggleFav}
                aria-label="Toggle favourite"
                className="rounded-full border p-2.5 transition-all"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--fg)" }}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFav ? "fill-[var(--fg)] text-[var(--fg)]" : "text-[var(--fg)]"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Model + Category chips */}
          <div className="flex flex-wrap gap-2">
            {image.model && (
              <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium" style={{ background: "var(--bg-glass)", borderColor: "var(--border)", color: "var(--fg)" }}>
                <Sparkles className="w-3 h-3" />
                {image.model}
              </span>
            )}
            {image.category && (
              <span className="rounded-full border px-3 py-1 text-xs font-medium" style={{ background: "var(--bg-glass)", borderColor: "var(--border)", color: "var(--fg)" }}>
                {image.category}
              </span>
            )}
            {image.createdAt && (
              <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs" style={{ background: "var(--bg-glass)", borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                <Calendar className="w-3 h-3" />
                {new Date(image.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Tags */}
          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs"
                  style={{ background: "var(--bg-glass)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right — Prompt details */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="mb-1 text-2xl font-extrabold leading-tight md:text-3xl">
              {image.title}
            </h1>
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>AI-generated image prompt</p>
          </div>

          {/* Prompt Box */}
          <div className="group relative rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>
                Prompt
              </span>
              <button
                id="copy-prompt-btn"
                onClick={copyPrompt}
                className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: copied ? "var(--fg)" : "var(--bg)",
                  borderColor: "var(--border)",
                  color: copied ? "var(--bg)" : "var(--fg)",
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy Prompt"}
              </button>
            </div>
            <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed" style={{ color: "var(--fg)" }}>
              {image.prompt}
            </p>
          </div>

          {/* How to use */}
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
            <h2 className="mb-3 text-sm font-semibold">How to use this prompt</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              <li>Click <strong style={{ color: "var(--fg)" }}>Copy Prompt</strong> above.</li>
              <li>Open <strong style={{ color: "var(--fg)" }}>{image.model}</strong> or your AI image tool.</li>
              <li>Paste the prompt and generate!</li>
            </ol>
          </div>

          {/* CTA */}
          <button
            onClick={copyPrompt}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[.98]"
            style={{ background: "var(--fg)", color: "var(--bg)", boxShadow: "var(--shadow-card)" }}
          >
            {copied ? "✓ Prompt Copied!" : "Copy Full Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
