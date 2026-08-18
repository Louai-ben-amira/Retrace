"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { getTranslation, isRTL } from "@/lib/languages";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import { useAudio } from "@/hooks/useAudio";
import type { VocabGroupWord, Translations } from "@/types";

interface StudyWord extends VocabGroupWord {
  learned: boolean;
}

interface VocabularyGroupStudyProps {
  groupId: string;
  words: StudyWord[];
  nativeLanguage?: string;
}

export function VocabularyGroupStudy({ groupId, words: initialWords, nativeLanguage = "ar" }: VocabularyGroupStudyProps) {
  const { t } = useTranslation();
  const [words, setWords] = useState(initialWords);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());

  const learnedCount = words.filter((w) => w.learned).length;
  const pct = words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0;

  function toggleFlip(id: string) {
    setFlipped((f) => {
      const next = new Set(f);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function toggleLearned(word: StudyWord) {
    if (pending.has(word.id)) return;
    const nextLearned = !word.learned;
    setWords((ws) => ws.map((w) => (w.id === word.id ? { ...w, learned: nextLearned } : w)));
    setPending((p) => new Set(p).add(word.id));
    try {
      await fetch(`/api/vocab-groups/${groupId}/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word.id, learned: nextLearned }),
      });
    } catch {
      setWords((ws) => ws.map((w) => (w.id === word.id ? { ...w, learned: word.learned } : w)));
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(word.id);
        return next;
      });
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="h-2 w-full rounded-full overflow-hidden bg-white/[0.06] mb-2">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-cream/50">{t.vocabulary.learnedProgress(learnedCount, words.length)}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word) => {
          const isFlipped = flipped.has(word.id);
          return (
            <div
              key={word.id}
              className={cn(
                "relative bg-ink-surface border rounded-xl overflow-hidden transition-colors duration-200",
                word.learned ? "border-brand-500/30" : "border-white/[0.08]"
              )}
            >
              <WordAudioButton wordId={word.id} text={word.word} />
              <button
                type="button"
                onClick={() => toggleFlip(word.id)}
                className="w-full min-h-[140px] p-5 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors"
              >
                {!isFlipped ? (
                  <p className="font-serif text-2xl font-bold text-cream">{word.word}</p>
                ) : (
                  <>
                    <p
                      className={cn("text-xl text-cream mb-2", (nativeLanguage === "ar") && "font-arabic")}
                      dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}
                    >
                      {getTranslation(word.translations as Translations, nativeLanguage)}
                    </p>
                    <p className="text-xs text-cream/40 italic">{word.example}</p>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => void toggleLearned(word)}
                className={cn(
                  "w-full text-xs font-medium py-2.5 border-t transition-colors",
                  word.learned
                    ? "border-brand-500/20 bg-brand-500/10 text-brand-400"
                    : "border-white/[0.07] text-cream/40 hover:text-cream hover:bg-white/[0.04]"
                )}
              >
                {word.learned ? t.vocabulary.learned : t.vocabulary.markAsLearned}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WordAudioButton({ wordId, text }: { wordId: string; text: string }) {
  const { t } = useTranslation();
  const { play, isPlaying, isLoading } = useAudio({ id: wordId, text, endpointBase: "/api/audio/word" });

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void play();
      }}
      disabled={isLoading}
      aria-label={t.vocabulary.playPronunciation}
      className={cn(
        "absolute top-2.5 right-2.5 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-ink-surface/80 text-cream/50 hover:text-brand-500 hover:border-brand-500/50 transition-colors disabled:opacity-40",
        isPlaying && "text-brand-500 border-brand-500/50"
      )}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <SpeakerIcon />
      )}
    </button>
  );
}

function SpeakerIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5 6 9H3v6h3l5 4V5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 8.5a5 5 0 010 7M18 6a9 9 0 010 12" />
    </svg>
  );
}
