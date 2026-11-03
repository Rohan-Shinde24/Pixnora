import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Copy, Search, Shapes } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works",
  description: "Learn how to find and use AI image prompts on Pixnora.",
  alternates: { canonical: "/how-it-works" },
  keywords: ["how to use AI image prompts", "AI art prompt guide", "image generation prompts"],
  openGraph: {
    type: "website",
    url: "/how-it-works",
    title: "How Pixnora works",
    description: "Learn how to find and use AI image prompts on Pixnora.",
  },
  twitter: {
    card: "summary_large_image",
    title: "How Pixnora works",
    description: "Learn how to find and use AI image prompts on Pixnora.",
  },
};

const steps = [
  {
    number: "01",
    title: "Find an idea",
    description: "Search for a subject or browse categories to find images and prompts that match your direction.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choose a prompt",
    description: "Open an image to see its complete prompt, category, and the AI model it was made for.",
    icon: Shapes,
  },
  {
    number: "03",
    title: "Copy and make it yours",
    description: "Copy the prompt into your image-generation tool, then adjust the details to suit your own idea.",
    icon: Copy,
  },
];

export default function HowItWorksPage() {
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

        <p className="mt-12 text-xs font-medium uppercase tracking-[.16em]" style={{ color: "var(--fg-muted)" }}>How it works</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">From inspiration to your next image.</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: "var(--fg-muted)" }}>
          Pixnora helps you find a starting point for your next creation. Pick a prompt, copy it, and shape it into something that feels like yours.
        </p>

        <div className="mt-12 space-y-4">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <section
              key={number}
              className="flex gap-4 rounded-2xl border p-5 sm:gap-6 sm:p-7"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            >
              <span className="pt-1 text-sm font-medium tabular-nums" style={{ color: "var(--fg-muted)" }}>{number}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>{description}</p>
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
          Prompts are starting points, not strict recipes. Change the wording, combine ideas, and experiment with the settings available in your chosen tool.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-medium"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          Browse prompts
        </Link>
      </article>
    </main>
  );
}
