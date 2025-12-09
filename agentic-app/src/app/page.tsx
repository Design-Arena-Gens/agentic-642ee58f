"use client";

import { useMemo, useState } from "react";
import type { AgentResponse } from "@/lib/types";

const DELIVERABLE_OPTIONS = [
  "News brief",
  "Long-form article",
  "Social thread",
  "Video script",
  "Newsletter segment",
  "Talking points",
];

function formatRelativeTime(iso?: string) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function Home() {
  const [topic, setTopic] = useState("AI-powered content marketing");
  const [audience, setAudience] = useState("B2B SaaS founders");
  const [tone, setTone] = useState("insightful and energetic");
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([
    DELIVERABLE_OPTIONS[0],
    DELIVERABLE_OPTIONS[2],
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResponse | null>(null);

  const canSubmit = useMemo(
    () => topic.trim().length > 2 && audience.trim().length > 2 && tone.trim().length > 2,
    [topic, audience, tone],
  );

  const toggleDeliverable = (deliverable: string) => {
    setSelectedDeliverables((prev) =>
      prev.includes(deliverable)
        ? prev.filter((item) => item !== deliverable)
        : [...prev, deliverable],
    );
  };

  const runGeneration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience: audience,
          tone,
          deliverables: selectedDeliverables.length
            ? selectedDeliverables
            : [DELIVERABLE_OPTIONS[0]],
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const payload = (await response.json()) as AgentResponse;
      setResult(payload);
    } catch (err) {
      console.error(err);
      setError("We couldn't generate insights. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 text-zinc-50">
      <header className="border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400/80">
              Signal Pulse
            </p>
            <h1 className="text-3xl font-semibold text-white">
              AI agent for real-time content intelligence
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Aggregate fresh conversations, surface emerging angles, and spin them
              into ready-to-use content formats aligned with your audience.
            </p>
          </div>
          <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase text-zinc-400">
            {result ? `Last run · ${result.usedModel}` : "Ready"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl shadow-emerald-500/5">
          <form className="space-y-6" onSubmit={runGeneration}>
            <div>
              <label className="text-sm font-medium text-zinc-300">Topic focus</label>
              <textarea
                rows={3}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="What should we monitor?"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">
                Target audience
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="Who are you creating for?"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Tone</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="Describe the voice, e.g. analytical and optimistic"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300">Deliverables</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DELIVERABLE_OPTIONS.map((option) => {
                  const active = selectedDeliverables.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDeliverable(option)}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                        active
                          ? "bg-emerald-500 text-emerald-950 shadow shadow-emerald-500/30"
                          : "border border-white/10 bg-zinc-950 text-zinc-300 hover:border-emerald-400/60 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-900 disabled:text-emerald-400"
            >
              {loading ? "Synthesizing signals..." : "Generate content intelligence"}
            </button>
          </form>

          <div className="rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-xs text-zinc-400">
            Live sources: Google News, Reddit, Hacker News, Wikipedia.
          </div>
        </section>

        <section className="space-y-6">
          {result ? (
            <>
              <article className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-lg shadow-emerald-500/10">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
                    Executive summary
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {result.overview}
                  </h2>
                </header>

                <div className="space-y-2 text-sm text-zinc-300">
                  <p className="font-semibold uppercase tracking-[0.27em] text-emerald-400/80">
                    Key insights
                  </p>
                  <ul className="space-y-2">
                    {result.keyInsights.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="rounded-lg border border-white/5 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-lg shadow-emerald-500/10">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
                      Strategic angles
                    </p>
                    <h2 className="text-xl font-semibold text-white">
                      Positioning ideas tailored to your deliverables
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-zinc-400">
                    {selectedDeliverables.length
                      ? selectedDeliverables.join(" · ")
                      : DELIVERABLE_OPTIONS[0]}
                  </span>
                </header>
                <ul className="space-y-3">
                  {result.suggestedAngles.map((angle, index) => (
                    <li
                      key={`${angle}-${index}`}
                      className="rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-200"
                    >
                      {angle}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-lg shadow-emerald-500/10">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
                    Narrative blueprint
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Outline to launch production immediately
                  </h2>
                </header>
                <ol className="space-y-3">
                  {result.outline.map((section, index) => (
                    <li
                      key={`${section.title}-${index}`}
                      className="rounded-xl border border-white/5 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200"
                    >
                      <p className="font-semibold text-white">
                        {index + 1}. {section.title}
                      </p>
                      <p className="mt-1 text-zinc-300">{section.description}</p>
                    </li>
                  ))}
                </ol>
              </article>

              <article className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-lg shadow-emerald-500/10">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
                    Hook library
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Cold open ideas for every channel
                  </h2>
                </header>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.contentHooks.map((hook, index) => (
                    <div
                      key={`${hook}-${index}`}
                      className="rounded-xl border border-white/5 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200"
                    >
                      {hook}
                    </div>
                  ))}
                </div>
              </article>

              <article className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-lg shadow-emerald-500/10">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
                      Source feed
                    </p>
                    <h2 className="text-xl font-semibold text-white">
                      Link out to validate every insight
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                    {result.sources.length} references
                  </span>
                </header>
                <div className="space-y-3">
                  {result.sources.map((item, index) => (
                    <a
                      key={`${item.url}-${index}`}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-white/5 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-100 transition hover:border-emerald-400/60 hover:bg-zinc-950/70"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-300/80">
                        <span className="rounded-full border border-emerald-400/50 px-2 py-0.5 uppercase tracking-[0.2em]">
                          {item.source}
                        </span>
                        {item.publishedAt ? (
                          <span>{formatRelativeTime(item.publishedAt)}</span>
                        ) : null}
                        {item.author ? <span>· {item.author}</span> : null}
                      </div>
                      <p className="mt-2 text-base font-semibold text-white">
                        {item.title}
                      </p>
                      {item.excerpt ? (
                        <p className="mt-1 text-sm text-zinc-300">{item.excerpt}</p>
                      ) : null}
                    </a>
                  ))}
                </div>
              </article>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 p-10 text-center text-zinc-400">
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-400/70">
                Ready to scan
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">
                Give the agent a topic to analyze
              </h2>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                We&apos;ll map the freshest articles, forum debates, and developer
                chatter, then return battle-ready talking points for your audience.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
