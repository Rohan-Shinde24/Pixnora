"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Image as ImageIcon, RotateCw } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryBar from "@/components/CategoryBar";
import ImageCard from "@/components/ImageCard";

interface ImageItem {
  _id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  model: string;
  likes: number;
}

interface ImageResponse {
  images: ImageItem[];
  hasMore: boolean;
  total: number;
  error?: string;
}

export default function GalleryClient() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentPage = useRef(1);
  const activeRequest = useRef<AbortController | null>(null);
  const searchRef = useRef(search);
  const categoryRef = useRef(category);

  useEffect(() => {
    searchRef.current = search;
    categoryRef.current = category;
  }, [search, category]);

  const fetchImages = useCallback(async (page: number, query: string, selectedCategory: string) => {
    if (loadingRef.current && page > 1) return;

    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    loadingRef.current = true;
    setLoading(true);
    setError("");
    if (page === 1) {
      hasMoreRef.current = true;
      setHasMore(true);
      setImages([]);
      setTotal(0);
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        search: query,
        category: selectedCategory,
      });
      const response = await fetch(`/api/images?${params}`, { signal: controller.signal });
      const data = (await response.json()) as ImageResponse;
      if (!response.ok) {
        throw new Error(data.error || "Could not load the image gallery.");
      }

      setImages((existing) => page === 1 ? data.images : [...existing, ...data.images]);
      setHasMore(data.hasMore);
      hasMoreRef.current = data.hasMore;
      setTotal(data.total);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "Could not load the image gallery.");
      if (page > 1) currentPage.current = page - 1;
    } finally {
      if (activeRequest.current === controller) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    currentPage.current = 1;
    hasMoreRef.current = true;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) return fetchImages(1, search, category);
    });

    return () => {
      cancelled = true;
      activeRequest.current?.abort();
    };
  }, [search, category, fetchImages]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !hasMoreRef.current || loadingRef.current) return;
        const nextPage = currentPage.current + 1;
        currentPage.current = nextPage;
        fetchImages(nextPage, searchRef.current, categoryRef.current);
      },
      { rootMargin: "500px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchImages]);

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <section
        className="relative overflow-hidden px-5 pb-10 pt-12 sm:pb-12 sm:pt-16"
        style={{ background: "var(--grad-hero)" }}
      >
        <div className="relative mx-auto max-w-[1100px] text-center">
          <h1 className="whitespace-nowrap text-[clamp(1.125rem,5.6vw,3.5rem)] font-semibold leading-tight tracking-[-0.045em]">
            Prompts for your next image
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 sm:text-base" style={{ color: "var(--fg-muted)" }}>
            Explore a thoughtful collection of AI image prompts and creative references.
          </p>
          <div className="mx-auto mt-6 max-w-[620px]">
            <SearchBar onSearch={setSearch} />
          </div>

          <div className="mt-4 text-xs" style={{ color: "var(--fg-muted)" }}>
            {total > 0 ? `${total.toLocaleString()} prompts to explore` : "Discover prompts from the community"}
          </div>
        </div>
      </section>

      <div
        className="px-5 py-4 sm:sticky sm:top-[68px] sm:z-20 sm:px-10"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="mx-auto max-w-[1440px]">
          <CategoryBar
            selected={category}
            onSelect={(value) => setCategory(value === category ? "" : value)}
          />
        </div>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-10">
        <div className="mb-6 flex items-end justify-end">
          {total > 0 && (
            <span className="pb-0.5 text-sm" style={{ color: "var(--fg-muted)" }}>
              {total.toLocaleString()} results
            </span>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--fg)" }} />
              <div>
                <p className="text-sm font-medium">The gallery couldn&apos;t be loaded</p>
                <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchImages(1, search, category)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl px-4 py-2 text-sm font-medium sm:self-auto"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
            >
              <RotateCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {loading && images.length === 0 && (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="mb-4 break-inside-avoid animate-pulse rounded-2xl"
                style={{
                  height: `${200 + (index % 3) * 70}px`,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              />
            ))}
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl px-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--bg-glass)", color: "var(--fg)" }}>
              <ImageIcon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Nothing here just yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
              {search || category
                ? "Try another search or choose a different category."
                : "New inspiration will appear here as soon as prompts are published."}
            </p>
            {(search || category) && (
              <button
                type="button"
                onClick={() => { setSearch(""); setCategory(""); }}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: "var(--fg)" }}
              >
                Clear filters <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {images.length > 0 && (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
            {images.map((image) => (
              <ImageCard
                key={image._id}
                id={image._id}
                title={image.title}
                imageUrl={image.imageUrl}
                prompt={image.prompt}
                model={image.model}
                likes={image.likes}
              />
            ))}
          </div>
        )}

        {loading && images.length > 0 && (
          <p className="py-8 text-center text-sm" style={{ color: "var(--fg-muted)" }}>Loading more inspiration...</p>
        )}
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        {!hasMore && images.length > 0 && !loading && !error && (
          <p className="py-10 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
            You&apos;re all caught up.
          </p>
        )}
      </section>

    </main>
  );
}
