"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { VOCAB_MASTERY_META, type MasteryLevel } from "@/lib/vocabSrs";
import { getTranslation, isRTL } from "@/lib/languages";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import type { AppCopy } from "@/lib/i18n/app";
import type { Translations } from "@/types";

export interface VocabTopicStat {
  key: string;
  label: string;
  translations: Translations;
  emoji: string;
  count: number;
  mastery: MasteryLevel | null; // null = locked (no words yet)
  pct: number; // 0-100, share of words at GOOD/MASTERED
}

type View = "grid" | "list" | "flashcard";

const LOWER = { MASTERED: "mastered", GOOD: "good", LEARNING: "learning", NEW: "new" } as const;

export function VocabularyTopicExplorer({ topics, nativeLanguage = "ar" }: { topics: VocabTopicStat[]; nativeLanguage?: string }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("grid");
  const VIEWS: { key: View; label: string }[] = [
    { key: "grid", label: t.wordbank.viewGrid },
    { key: "list", label: t.wordbank.viewList },
    { key: "flashcard", label: t.wordbank.viewFlashcard },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (topic) => topic.label.toLowerCase().includes(q) || getTranslation(topic.translations, nativeLanguage).includes(q)
    );
  }, [topics, query, nativeLanguage]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.wordbank.searchTopics}
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
        <p className="text-sm text-cream/40 py-12 text-center">{t.wordbank.noTopicsMatch(query)}</p>
      ) : view === "list" ? (
        <div className="space-y-2">
          {filtered.map((topic) => <TopicRow key={topic.key} topic={topic} nativeLanguage={nativeLanguage} t={t} />)}
        </div>
      ) : (
        <div className={cn("grid gap-4", view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
          {filtered.map((topic) => <TopicCard key={topic.key} topic={topic} large={view === "flashcard"} nativeLanguage={nativeLanguage} t={t} />)}
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, large, nativeLanguage, t }: { topic: VocabTopicStat; large?: boolean; nativeLanguage: string; t: AppCopy }) {
  const locked = topic.count === 0;
  const meta = topic.mastery ? VOCAB_MASTERY_META[topic.mastery] : null;
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
          <span className="text-cream/30 text-sm" title={t.common.locked}>🔒</span>
        ) : (
          meta && <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5", meta.text)}>{t.common.mastery[LOWER[topic.mastery!]]}</span>
        )}
      </div>
      <p className={cn("font-serif font-bold text-cream mb-0.5", large ? "text-2xl" : "text-lg")}>{topic.label}</p>
      <p className={cn("text-cream/40 text-sm mb-3", isArabicScript && "font-arabic")} dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}>
        {translatedLabel}
      </p>
      {locked ? (
        <p className="text-xs text-cream/30">{t.wordbank.readMoreToUnlock}</p>
      ) : (
        <p className="text-xs text-cream/40">{t.common.words(topic.count)}</p>
      )}
      {!locked && (
        <div className="h-[3px] bg-white/[0.07] rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${topic.pct}%` }} />
        </div>
      )}
    </div>
  );

  return locked ? inner : <Link href={`/vocabulary/mine/topic/${topic.key}`}>{inner}</Link>;
}

function TopicRow({ topic, nativeLanguage, t }: { topic: VocabTopicStat; nativeLanguage: string; t: AppCopy }) {
  const locked = topic.count === 0;
  const meta = topic.mastery ? VOCAB_MASTERY_META[topic.mastery] : null;
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
        <span className="text-cream/30 text-sm shrink-0" title={t.common.locked}>🔒 {t.common.locked}</span>
      ) : (
        <>
          <span className="text-xs text-cream/40 shrink-0">{t.common.words(topic.count)}</span>
          {meta && <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 shrink-0", meta.text)}>{t.common.mastery[LOWER[topic.mastery!]]}</span>}
        </>
      )}
    </div>
  );

  return locked ? inner : <Link href={`/vocabulary/mine/topic/${topic.key}`}>{inner}</Link>;
}
