"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { MASTERY_META, type MasteryLevel } from "@/lib/srs";
import { getTranslation, isRTL } from "@/lib/languages";
import type { Translations } from "@/types";

export interface TopicStat {
  key: string;
  label: string;
  translations: Translations;
  emoji: string;
  count: number;
  mastery: MasteryLevel | null; // null = locked (no words yet)
  pct: number; // 0-100, share of words at good/mastered
}

type View = "grid" | "list" | "flashcard";

const VIEWS: { key: View; label: string }[] = [
  { key: "grid", label: "Grid" },
  { key: "list", label: "List" },
  { key: "flashcard", label: "Flashcard" },
];

export function TopicExplorer({ topics, nativeLanguage = "ar" }: { topics: TopicStat[]; nativeLanguage?: string }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) => t.label.toLowerCase().includes(q) || getTranslation(t.translations, nativeLanguage).includes(q)
    );
  }, [topics, query, nativeLanguage]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics…"
            className="w-full text-sm bg-white/5 border border-white/15 rounded-lg pl-9 pr-3 py-2.5 text-cream placeholder:text-cream/25 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">⌕</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
                view === v.key ? "bg-brand-500 text-ink" : "text-cream/50 hover:text-cream"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-cream/40 py-12 text-center">No topics match &quot;{query}&quot;.</p>
      ) : view === "list" ? (
        <div className="space-y-2">
          {filtered.map((t) => <TopicRow key={t.key} topic={t} nativeLanguage={nativeLanguage} />)}
        </div>
      ) : (
        <div className={cn("grid gap-4", view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
          {filtered.map((t) => <TopicCard key={t.key} topic={t} large={view === "flashcard"} nativeLanguage={nativeLanguage} />)}
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, large, nativeLanguage }: { topic: TopicStat; large?: boolean; nativeLanguage: string }) {
  const locked = topic.count === 0;
  const meta = topic.mastery ? MASTERY_META[topic.mastery] : null;
  const translatedLabel = getTranslation(topic.translations, nativeLanguage);
  const isArabicScript = nativeLanguage === "ar";

  const inner = (
    <div
      className={cn(
        "relative bg-ink-surface border rounded-xl overflow-hidden transition-all duration-200",
        locked ? "border-white/[0.06] opacity-60" : "border-white/[0.08] border-l-2 border-l-brand-500 hover:border-brand-500/30 hover:-translate-y-0.5",
        large ? "p-8" : "p-5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={large ? "text-4xl" : "text-2xl"}>{topic.emoji}</span>
        {locked ? (
          <span className="text-cream/30 text-sm" title="Locked">🔒</span>
        ) : (
          meta && <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5", meta.text)}>{meta.label}</span>
        )}
      </div>
      <p className={cn("font-serif font-bold text-cream mb-0.5", large ? "text-2xl" : "text-lg")}>{topic.label}</p>
      <p className={cn("text-cream/40 text-sm mb-3", isArabicScript && "font-arabic")} dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}>
        {translatedLabel}
      </p>
      {locked ? (
        <p className="text-xs text-cream/30">Read more stories to unlock.</p>
      ) : (
        <p className="text-xs text-cream/40">{topic.count} word{topic.count === 1 ? "" : "s"}</p>
      )}
      {!locked && (
        <div className="h-[3px] bg-white/[0.07] rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${topic.pct}%` }} />
        </div>
      )}
    </div>
  );

  return locked ? inner : <Link href={`/wordbank/topic/${topic.key}`}>{inner}</Link>;
}

function TopicRow({ topic, nativeLanguage }: { topic: TopicStat; nativeLanguage: string }) {
  const locked = topic.count === 0;
  const meta = topic.mastery ? MASTERY_META[topic.mastery] : null;
  const translatedLabel = getTranslation(topic.translations, nativeLanguage);
  const isArabicScript = nativeLanguage === "ar";

  const inner = (
    <div
      className={cn(
        "flex items-center gap-4 bg-ink-surface border rounded-xl px-5 py-3.5 transition-all duration-200",
        locked ? "border-white/[0.06] opacity-60" : "border-white/[0.08] border-l-2 border-l-brand-500 hover:border-brand-500/30"
      )}
    >
      <span className="text-xl shrink-0">{topic.emoji}</span>
      <div className="flex-1 min-w-0">
        <span className="text-cream font-medium">{topic.label}</span>
        <span
          className={cn("text-cream/40 text-sm ml-2", isArabicScript && "font-arabic")}
          dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}
        >
          {translatedLabel}
        </span>
      </div>
      {locked ? (
        <span className="text-cream/30 text-sm shrink-0" title="Locked">🔒 Locked</span>
      ) : (
        <>
          <span className="text-xs text-cream/40 shrink-0">{topic.count} words</span>
          {meta && <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 shrink-0", meta.text)}>{meta.label}</span>}
        </>
      )}
    </div>
  );

  return locked ? inner : <Link href={`/wordbank/topic/${topic.key}`}>{inner}</Link>;
}
