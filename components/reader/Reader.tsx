"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useReader } from "@/hooks/useReader";
import { useAudio } from "@/hooks/useAudio";
import { KaraokeText } from "@/components/reader/KaraokeText";
import { StartGate } from "@/components/reader/StartGate";
import { CompletionScreen } from "@/components/reader/CompletionScreen";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { LiveWpm } from "@/components/reader/LiveWpm";
import { KeySoundToggle } from "@/components/reader/KeySoundToggle";
import { parseVocabTags } from "@/lib/utils";
import { getTranslation, isRTL } from "@/lib/languages";
import { cn } from "@/lib/cn";
import type { Line, VocabTag } from "@/types";

interface ReaderProps {
  storyId: string;
  storyTitle: string;
  lines: Line[];
  startPosition?: number;
  initialStreak?: number;
  isPro: boolean;
  nativeLanguage: string;
}

export function Reader({ storyId, storyTitle, lines, startPosition, initialStreak, isPro, nativeLanguage }: ReaderProps) {
  const reader = useReader({ storyId, lines, startPosition, initialStreak });
  const { currentLine, lineIndex, totalLines, readerState, typedIndex, flashIndex, showTranslation } = reader;
  const [activeVocab, setActiveVocab] = useState<VocabTag | null>(null);
  const translationDir = isRTL(nativeLanguage) ? "rtl" : "ltr";
  const translationFont = nativeLanguage === "ar" ? "font-arabic" : "font-sans";
  const [grammarNote, setGrammarNote] = useState<string | null>(null);
  const [grammarLoading, setGrammarLoading] = useState(false);
  // Stable reference across re-renders of the same line — parseVocabTags would otherwise
  // return a new array every render, defeating KaraokeText's memo() on every WPM tick.
  const vocabTags = useMemo(() => parseVocabTags(currentLine?.vocabTags), [currentLine]);

  function handleWordTap(tag: VocabTag) {
    setGrammarNote(null);
    setActiveVocab(tag);
  }

  async function handleExplainGrammar() {
    if (!currentLine) return;
    setActiveVocab(null);
    if (grammarNote) {
      setGrammarNote(null);
      return;
    }
    setGrammarLoading(true);
    try {
      const res = await fetch(`/api/ai/explain-grammar/${currentLine.id}`, { method: "POST" });
      const data = res.ok ? await res.json() : null;
      setGrammarNote(data?.explanation || "تعذر تحميل الشرح الآن.");
    } finally {
      setGrammarLoading(false);
    }
  }

  const audio = useAudio({ lineId: currentLine?.id ?? "", text: currentLine?.text ?? "" });
  const { play } = audio;

  // Autoplay each new line's audio. Line 1 is played by the Start button's own
  // click (a real user gesture, required to unlock autoplay); this effect only
  // needs to fire for line 2+, which it does naturally since it depends on lineIndex.
  useEffect(() => {
    if (readerState !== "typing") return;
    void play();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a line change should retrigger playback
  }, [lineIndex]);

  useEffect(() => {
    setActiveVocab(null);
    setGrammarNote(null);
  }, [lineIndex]);

  return (
    <div className="grain fixed inset-0 z-50 bg-gradient-to-b from-ink via-ink to-ink-raised overflow-y-auto">
      <div
        aria-hidden
        className="fixed w-[700px] h-[500px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(14,207,183,0.07)_0%,transparent_70%)] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none -bottom-56 -right-40 bg-[radial-gradient(circle,rgba(14,207,183,0.05)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]"
      />

      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-brand-500 transition-all duration-500"
          style={{ width: `${(lineIndex / totalLines) * 100}%` }}
        />
      </div>

      <Link
        href="/library"
        className="absolute top-5 left-5 text-cream/30 hover:text-cream/70 text-sm transition-colors"
      >
        ✕
      </Link>

      {readerState !== "idle" && (
        <div className="absolute top-5 right-5 flex items-center gap-3">
          <KeySoundToggle muted={reader.muted} onToggle={reader.toggleMuted} />
          <span className="text-cream/30 text-sm font-medium tracking-wide">
            Line {lineIndex + 1} of {totalLines}
          </span>
        </div>
      )}

      <div className="h-screen">
        {readerState === "idle" && <StartGate storyTitle={storyTitle} onStart={() => { reader.start(); void play(); }} />}

        {readerState === "typing" && currentLine && (
          <div className="relative flex flex-col items-center justify-center h-full gap-10 px-6">
            <div key={lineIndex} className="max-w-3xl space-y-5 animate-line-in">
              <KaraokeText
                text={currentLine.text}
                typedIndex={typedIndex}
                flashIndex={flashIndex}
                vocabTags={vocabTags}
                vocabEnabled={isPro}
                onWordTap={handleWordTap}
              />
              {showTranslation && (
                <p
                  className={cn("text-lg sm:text-xl text-cream/40 text-center leading-relaxed", translationFont)}
                  dir={translationDir}
                >
                  {getTranslation(currentLine.translations as Record<string, string>, nativeLanguage)}
                </p>
              )}
            </div>

            {(activeVocab || grammarNote) && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/5 border border-brand-500/30 rounded-xl px-5 py-4 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  {activeVocab ? (
                    <div>
                      <p className="text-brand-500 font-semibold">{activeVocab.word}</p>
                      <p className={cn("text-cream text-lg", translationFont)} dir={translationDir}>
                        {getTranslation(activeVocab.translations, nativeLanguage)}
                      </p>
                      <p className="text-cream/50 text-sm mt-2 italic">{activeVocab.example}</p>
                    </div>
                  ) : (
                    <p className="font-arabic text-cream text-base leading-relaxed" dir="rtl">
                      {grammarNote}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => { setActiveVocab(null); setGrammarNote(null); }}
                    className="text-cream/30 hover:text-cream/70 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <AudioPlayer
                isPlaying={audio.isPlaying}
                isLoading={audio.isLoading}
                speed={audio.speed}
                isPro={isPro}
                onReplay={() => void play()}
                onSpeedChange={audio.setSpeed}
              />
              <button
                type="button"
                onClick={() => void handleExplainGrammar()}
                disabled={grammarLoading}
                className="text-xs text-cream/40 hover:text-brand-500 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {grammarLoading ? (
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <span aria-hidden>💡</span>
                )}
                {grammarNote ? "Hide grammar note" : "Why this line?"}
              </button>
            </div>
          </div>
        )}

        {readerState === "completed" && (
          <CompletionScreen
            storyTitle={storyTitle}
            results={reader.results}
            totalXP={reader.totalXP}
            wpm={reader.wpm}
            accuracy={reader.accuracy}
            onRetrace={reader.restart}
          />
        )}
      </div>

      {readerState === "typing" && (
        <LiveWpm correctKeystrokes={reader.correctKeystrokes} sessionStart={reader.sessionStart} accuracy={reader.accuracy} />
      )}
    </div>
  );
}
