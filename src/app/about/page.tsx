import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About us",
  description: "Learn about Pixnora, a library of AI image prompts and creative inspiration.",
  alternates: { canonical: "/about" },
  keywords: ["about Pixnora", "AI image prompt library", "creative inspiration"],
  openGraph: {
    type: "website",
    url: "/about",
    title: "About Pixnora",
    description: "Learn about Pixnora, a library of AI image prompts and creative inspiration.",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Pixnora",
    description: "Learn about Pixnora, a library of AI image prompts and creative inspiration.",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen px-5 py-12 sm:px-10 sm:py-20" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--fg-muted)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to gallery
        </Link>

        <div className="mt-12 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--fg)", color: "var(--bg)" }}>
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="mt-8 text-xs font-medium uppercase tracking-[.16em]" style={{ color: "var(--fg-muted)" }}>About Pixnora</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">A space for visual inspiration.</h1>
        <p className="mt-6 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: "var(--fg-muted)" }}>
          Pixnora brings image prompts and creative references together in one simple library, helping creators discover new directions and spend more time making.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
            <h2 className="text-lg font-semibold">Discover</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
              Browse ideas by category or search for a subject, style, or image-generation model.
            </p>
          </section>
          <section className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
            <h2 className="text-lg font-semibold">Create</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
              Open a prompt, copy it, and adapt it to your own tools, taste, and creative process.
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-medium"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          Explore the gallery
        </Link>
      </article>
    </main>
  );
}
