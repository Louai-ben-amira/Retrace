"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { getTranslation, isRTL } from "@/lib/languages";
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
        <p className="text-sm text-cream/50">{learnedCount} / {words.length} learned</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word) => {
          const isFlipped = flipped.has(word.id);
          return (
            <div
              key={word.id}
              className={cn(
                "bg-ink-surface border rounded-xl overflow-hidden transition-colors duration-200",
                word.learned ? "border-brand-500/30" : "border-white/[0.08]"
              )}
            >
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
                {word.learned ? "✓ Learned" : "Mark as learned"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
