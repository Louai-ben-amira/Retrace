"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lineXP } from "@/lib/scoring";
import { PASS_THRESHOLD } from "@/lib/fuzzy";
import { parseVocabTags } from "@/lib/utils";
import { useKeySound } from "@/hooks/useKeySound";
import type { Line, LineResult, ReaderState } from "@/types";

interface UseReaderOptions {
  storyId: string;
  lines: Line[];
  startPosition?: number;
  initialStreak?: number;
}

interface SyncResponse {
  ok: boolean;
  streak?: { current: number; longest: number };
}

export function useReader({ storyId, lines, startPosition = 1, initialStreak = 0 }: UseReaderOptions) {
  const sorted = useMemo(() => [...lines].sort((a, b) => a.position - b.position), [lines]);
  const startIndex = Math.min(Math.max(startPosition - 1, 0), sorted.length - 1);

  const [readerState, setReaderState] = useState<ReaderState>("idle");
  const [lineIndex, setLineIndex] = useState(startIndex);
  const [typedIndex, setTypedIndex] = useState(0);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [results, setResults] = useState<LineResult[]>([]);
  const [currentStreak, setCurrentStreak] = useState(initialStreak);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);

  const sessionStartRef = useRef<number | null>(null);
  const lineStartRef = useRef(Date.now());
  const [finalWpm, setFinalWpm] = useState(0);
  const { muted, toggleMuted, playKey } = useKeySound();

  const currentLine = sorted[lineIndex];
  const totalLines = sorted.length;
  const isLastLine = lineIndex === totalLines - 1;
  const totalXP = useMemo(() => results.reduce((sum, r) => sum + r.xp, 0), [results]);

  const totalKeystrokes = correctKeystrokes + errorKeystrokes;
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

  const toggleTranslation = useCallback(() => setShowTranslation((v) => !v), []);

  const syncAttempt = useCallback(
    async (lineId: string, attempt: string, score: number, timeMs: number) => {
      try {
        const res = await fetch("/api/progress/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId, lineId, attempt, score, passed: true, timeMs }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as SyncResponse;
        if (data.streak) setCurrentStreak(data.streak.current);
      } catch {
        // Best-effort sync — local reader state already reflects the line as complete.
      }
    },
    [storyId]
  );

  // Silent, best-effort auto-collection into the /vocabulary word bank — fires alongside
  // syncAttempt (which drives the separate, pre-existing /wordbank collection) whenever a
  // line is passed. The user never sees this happen.
  const collectVocabulary = useCallback(
    async (line: Line, score: number) => {
      if (score < PASS_THRESHOLD) return;
      const tags = parseVocabTags(line.vocabTags);
      if (tags.length === 0) return;
      try {
        await fetch("/api/vocabulary/collect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lineId: line.id,
            storyId,
            words: tags.map((t) => ({ word: t.word, translations: t.translations })),
          }),
        });
      } catch {
        // Best-effort — local reader state doesn't depend on this succeeding.
      }
    },
    [storyId]
  );

  const advanceLine = useCallback(
    (score: number, timeMs: number) => {
      if (!currentLine) return;
      const xp = lineXP(score, timeMs, currentStreak);
      setResults((r) => [...r, { lineId: currentLine.id, position: currentLine.position, score, passed: true, xp }]);
      void syncAttempt(currentLine.id, currentLine.text, score, timeMs);
      void collectVocabulary(currentLine, score);

      if (isLastLine) {
        const minutesElapsed = sessionStartRef.current ? (Date.now() - sessionStartRef.current) / 60000 : 0;
        setFinalWpm(minutesElapsed > 0 ? Math.round((correctKeystrokes + 1) / 5 / minutesElapsed) : 0);
        setReaderState("completed");
        return;
      }
      setLineIndex((i) => i + 1);
      setTypedIndex(0);
      setFlashIndex(null);
      setShowTranslation(true);
      lineStartRef.current = Date.now();
    },
    [currentLine, isLastLine, currentStreak, syncAttempt, collectVocabulary, correctKeystrokes]
  );

  // Strict per-keystroke gate: only a correct next character advances the cursor.
  // "T" only toggles the translation when it isn't the character actually due next,
  // so typing a line that contains a literal "t" is never hijacked by the hotkey.
  const handleKey = useCallback(
    (key: string) => {
      if (!currentLine) return;
      const target = currentLine.text;
      const expected = target[typedIndex];
      const isCorrect = expected !== undefined && key.toLowerCase() === expected.toLowerCase();

      if (!isCorrect && (key === "t" || key === "T")) {
        toggleTranslation();
        return;
      }
      if (expected === undefined) return;

      if (isCorrect) {
        playKey(true);
        setCorrectKeystrokes((n) => n + 1);
        setFlashIndex(null);
        const nextIndex = typedIndex + 1;
        setTypedIndex(nextIndex);

        if (nextIndex >= target.length) {
          const timeMs = Date.now() - lineStartRef.current;
          // Strict gating means every accepted character matched exactly — the line is a perfect match.
          advanceLine(1, timeMs);
        }
      } else {
        playKey(false);
        setErrorKeystrokes((n) => n + 1);
        setFlashIndex(typedIndex);
      }
    },
    [currentLine, typedIndex, toggleTranslation, advanceLine, playKey]
  );

  // Clear a red flash shortly after it fires so it reads as a blip, not a stuck state.
  useEffect(() => {
    if (flashIndex === null) return;
    const id = setTimeout(() => setFlashIndex(null), 300);
    return () => clearTimeout(id);
  }, [flashIndex]);

  useEffect(() => {
    if (readerState !== "typing") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      e.preventDefault();
      handleKey(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [readerState, handleKey]);

  const start = useCallback(() => {
    sessionStartRef.current = Date.now();
    lineStartRef.current = Date.now();
    setReaderState("typing");
  }, []);

  const restart = useCallback(() => {
    setLineIndex(0);
    setTypedIndex(0);
    setFlashIndex(null);
    setShowTranslation(true);
    setResults([]);
    setCorrectKeystrokes(0);
    setErrorKeystrokes(0);
    sessionStartRef.current = null;
    setReaderState("idle");
  }, []);

  return {
    currentLine,
    lineIndex,
    totalLines,
    readerState,
    typedIndex,
    flashIndex,
    showTranslation,
    results,
    totalXP,
    currentStreak,
    correctKeystrokes,
    sessionStart: sessionStartRef.current,
    wpm: finalWpm,
    accuracy,
    muted,
    toggleMuted,
    start,
    restart,
  };
}
