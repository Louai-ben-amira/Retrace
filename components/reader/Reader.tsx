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
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import { cn } from "@/lib/cn";
import type { Line, VocabTag } from "@/types";

interface ReaderProps {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  lines: Line[];
  startPosition?: number;
  initialStreak?: number;
  isPro: boolean;
  nativeLanguage: string;
}

export function Reader({ storyId, storySlug, storyTitle, lines, startPosition, initialStreak, isPro, nativeLanguage }: ReaderProps) {
  const { t } = useTranslation();
  const reader = useReader({ storyId, lines, startPosition, initialStreak });
  const { currentLine, lineIndex, totalLines, readerState, input, flashIndex, showTranslation, feedback } = reader;
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
      setGrammarNote(data?.explanation || t.reader.grammarNoteError);
    } finally {
      setGrammarLoading(false);
    }
  }

  const audio = useAudio({ id: currentLine?.id ?? "", text: currentLine?.text ?? "" });
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
    <div className="grain fixed inset-0 z-50 bg-gradient-to-b from-ink via-ink to-ink-raised overflow-y-auto overflow-x-hidden">
      {/* Hidden but focusable — this is what raises the soft keyboard on phones and
          tablets. Kept on-screen (not display:none / -9999px) because iOS refuses to
          focus, or scrolls the page to, genuinely off-screen inputs. */}
      <input
        ref={reader.hiddenInputRef}
        type="text"
        value={input}
        onChange={(e) => reader.handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            reader.handleEnter();
          }
        }}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        inputMode="text"
        enterKeyHint="done"
        aria-label={t.reader.typeTheLine}
        // Never in the tab order: on desktop, tabbing into this would route keystrokes
        // through the input path and silently disable the "T" translation hotkey.
        // Programmatic .focus() still works with tabIndex -1, which is all mobile needs.
        tabIndex={-1}
        // Fixed and centred, not absolute at the top: on focus iOS scrolls the nearest
        // scroll container to reveal the focused element, which with a top-anchored
        // input yanked the reader to the top of the page on every line.
        className="fixed top-1/2 left-1/2 w-px h-px opacity-0 border-0 p-0 bg-transparent text-transparent caret-transparent focus:outline-none"
      />
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
        aria-label={t.common.close}
        className="fixed top-2 left-2 sm:top-3 sm:left-3 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full text-cream/30 hover:text-cream/70 hover:bg-white/5 text-sm transition-colors"
      >
        ✕
      </Link>

      {readerState !== "idle" && (
        <div className="fixed top-2 right-2 sm:top-5 sm:right-5 z-10 flex items-center gap-2 sm:gap-3">
          <KeySoundToggle muted={reader.muted} onToggle={reader.toggleMuted} />
          <span className="text-cream/30 text-xs sm:text-sm font-medium tracking-wide">
            {t.reader.lineOf(lineIndex + 1, totalLines)}
          </span>
        </div>
      )}

      {/* dvh (not vh) so the soft keyboard shrinking the viewport reflows the layout
          instead of pushing the controls off the bottom of the screen. */}
      <div className="min-h-[100dvh]">
        {readerState === "idle" && <StartGate storyTitle={storyTitle} onStart={() => { reader.start(); void play(); }} />}

        {readerState === "typing" && currentLine && (
          <div
            // Tapping anywhere in the typing area re-raises the soft keyboard after the
            // user dismisses it (or after tapping a vocab word steals focus).
            onClick={reader.focusInput}
            className="relative flex flex-col items-center justify-center min-h-[100dvh] gap-6 sm:gap-10 px-4 sm:px-6 py-20 sm:py-16"
          >
            <div key={lineIndex} className="max-w-3xl w-full space-y-4 sm:space-y-5 animate-line-in">
              <KaraokeText
                text={currentLine.text}
                typed={input}
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

              {feedback && (
                <div
                  key={feedback.id}
                  className={cn(
                    "mx-auto w-full max-w-lg rounded-xl border px-5 py-4 text-center animate-scale-in",
                    feedback.type === "retry"
                      ? "border-amber-400/30 bg-amber-400/10 animate-shake"
                      : "border-rose-400/30 bg-rose-400/10"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide mb-2",
                      feedback.type === "retry" ? "text-amber-300" : "text-rose-300"
                    )}
                  >
                    {feedback.type === "retry" ? t.reader.tryAgain : t.reader.hereIsTheAnswer}
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed" dir="ltr">
                    {feedback.diff.map((tok, i) => (
                      <span
                        key={i}
                        className={
                          tok.type === "equal"
                            ? "text-cream/70"
                            : tok.type === "delete"
                            ? "text-rose-400 line-through decoration-2"
                            : "text-amber-300 underline decoration-2 underline-offset-2"
                        }
                      >
                        {tok.text}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>

            {(activeVocab || grammarNote) && (
              <div
                // Without this the parent's tap-to-focus handler fires, and the soft
                // keyboard springs back up over the definition the user just opened.
                onClick={(e) => e.stopPropagation()}
                className="relative sm:absolute sm:bottom-24 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-[90%] max-w-sm bg-white/5 border border-brand-500/30 rounded-xl px-4 sm:px-5 py-4 backdrop-blur-sm"
              >
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
                    // Direction and font follow the reader's native language — this was
                    // pinned to Arabic even though the explanation is now generated in
                    // whichever language the user actually reads in.
                    <p
                      className={cn("text-cream text-base leading-relaxed", translationFont)}
                      dir={translationDir}
                    >
                      {grammarNote}
                    </p>
                  )}
                  <button
                    type="button"
                    aria-label={t.common.close}
                    onClick={() => { setActiveVocab(null); setGrammarNote(null); }}
                    className="text-cream/30 hover:text-cream/70 shrink-0 w-8 h-8 -mt-1 -mr-1 flex items-center justify-center"
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
              {/* Touch equivalent of the desktop "T" hotkey, which has no counterpart on
                  a soft keyboard (every literal "t" must reach the typing buffer). */}
              <button
                type="button"
                onClick={reader.toggleTranslation}
                className="sm:hidden text-xs text-cream/40 hover:text-brand-500 transition-colors flex items-center gap-1.5 min-h-[44px] px-3"
              >
                <span aria-hidden>🌐</span>
                {showTranslation ? t.reader.hideTranslation : t.reader.showTranslation}
              </button>
              <button
                type="button"
                onClick={() => void handleExplainGrammar()}
                disabled={grammarLoading}
                className="text-xs text-cream/40 hover:text-brand-500 transition-colors flex items-center gap-1.5 disabled:opacity-50 min-h-[44px] sm:min-h-0 px-3 sm:px-0"
              >
                {grammarLoading ? (
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <span aria-hidden>💡</span>
                )}
                {grammarNote ? t.reader.hideGrammarNote : t.reader.whyThisLine}
              </button>
            </div>
          </div>
        )}

        {readerState === "completed" && (
          <CompletionScreen
            storyId={storyId}
            storySlug={storySlug}
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
