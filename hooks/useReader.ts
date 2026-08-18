"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lineXP } from "@/lib/scoring";
import { PASS_THRESHOLD, fuzzyMatch, getMatchResult, diffChars } from "@/lib/fuzzy";
import type { DiffToken, MatchResult } from "@/lib/fuzzy";
import { parseVocabTags } from "@/lib/utils";
import { useKeySound } from "@/hooks/useKeySound";
import type { Line, LineResult, ReaderState } from "@/types";

// Only phones/tablets get the hidden input focused. On a desktop the window-level keydown
// listener is the better path: it keeps the "T toggles the translation" hotkey working,
// which a focused text input would otherwise swallow as a literal character.
function prefersSoftKeyboard(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

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

export interface LineFeedback {
  id: number;
  type: Exclude<MatchResult, "pass">;
  score: number;
  timeMs: number;
  attempt: string;
  diff: DiffToken[];
}

export function useReader({ storyId, lines, startPosition = 1, initialStreak = 0 }: UseReaderOptions) {
  const sorted = useMemo(() => [...lines].sort((a, b) => a.position - b.position), [lines]);
  const startIndex = Math.min(Math.max(startPosition - 1, 0), sorted.length - 1);

  const [readerState, setReaderState] = useState<ReaderState>("idle");
  const [lineIndex, setLineIndex] = useState(startIndex);
  const [input, setInput] = useState("");
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [results, setResults] = useState<LineResult[]>([]);
  const [currentStreak, setCurrentStreak] = useState(initialStreak);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);
  const [feedback, setFeedback] = useState<LineFeedback | null>(null);

  const sessionStartRef = useRef<number | null>(null);
  const lineStartRef = useRef(Date.now());
  const feedbackIdRef = useRef(0);
  // Touch devices have no physical keyboard, so the window-level keydown listener below
  // never fires for them. Reader mounts a visually-hidden input bound to this ref; focusing
  // it is what raises the soft keyboard, and its value changes drive typing on mobile.
  const hiddenInputRef = useRef<HTMLInputElement>(null);
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
    async (lineId: string, attempt: string, score: number, passed: boolean, timeMs: number) => {
      try {
        const res = await fetch("/api/progress/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId, lineId, attempt, score, passed, timeMs }),
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
    (score: number, timeMs: number, passed: boolean, attemptText: string) => {
      if (!currentLine) return;
      const xp = passed ? lineXP(score, timeMs, currentStreak) : 0;
      setResults((r) => [...r, { lineId: currentLine.id, position: currentLine.position, score, passed, xp }]);
      void syncAttempt(currentLine.id, attemptText, score, passed, timeMs);
      if (passed) void collectVocabulary(currentLine, score);

      if (isLastLine) {
        const minutesElapsed = sessionStartRef.current ? (Date.now() - sessionStartRef.current) / 60000 : 0;
        setFinalWpm(minutesElapsed > 0 ? Math.round((correctKeystrokes + 1) / 5 / minutesElapsed) : 0);
        setReaderState("completed");
        return;
      }
      setLineIndex((i) => i + 1);
      setInput("");
      setFlashIndex(null);
      setShowTranslation(true);
      lineStartRef.current = Date.now();
    },
    [currentLine, isLastLine, currentStreak, syncAttempt, collectVocabulary, correctKeystrokes]
  );

  // Fuzzy-grades a submitted attempt against the target line. Called either once the
  // typed buffer reaches the target's length, or on an explicit Enter submission.
  const gradeAndSubmit = useCallback(
    (attemptText: string) => {
      if (!currentLine) return;
      const target = currentLine.text;
      const timeMs = Date.now() - lineStartRef.current;
      const score = fuzzyMatch(attemptText, target);
      const result = getMatchResult(score);

      if (result === "pass") {
        setFeedback(null);
        advanceLine(score, timeMs, true, attemptText);
        return;
      }

      feedbackIdRef.current += 1;
      const diff = diffChars(attemptText, target);

      if (result === "retry") {
        // Give them another go at the same line — clear the buffer so they can retype.
        setFeedback({ id: feedbackIdRef.current, type: "retry", score, timeMs, attempt: attemptText, diff });
        setInput("");
        setFlashIndex(null);
        return;
      }

      // fail — reveal the correct line; the line still advances (see the effect below),
      // just with passed=false and zero XP.
      setFeedback({ id: feedbackIdRef.current, type: "fail", score, timeMs, attempt: attemptText, diff });
    },
    [currentLine, advanceLine]
  );

  // Retry feedback auto-clears so the user can try again; fail feedback stays up long
  // enough to read the reveal, then the line advances on its own.
  useEffect(() => {
    if (!feedback) return;
    if (feedback.type === "retry") {
      const id = setTimeout(() => setFeedback(null), 1600);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setFeedback(null);
      advanceLine(feedback.score, feedback.timeMs, false, feedback.attempt);
    }, 2200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new `feedback` object should retrigger this
  }, [feedback]);

  // Strict per-keystroke gating is gone — every key (right or wrong) is appended to the
  // buffer so fuzzy grading has real input to work with. "T" only toggles the translation
  // when it isn't the character actually due next, so typing a line that contains a
  // literal "t" is never hijacked by the hotkey.
  const handleKey = useCallback(
    (key: string) => {
      if (!currentLine || feedback) return;
      const target = currentLine.text;
      const position = input.length;
      const expected = target[position];
      const isCorrect = expected !== undefined && key.toLowerCase() === expected.toLowerCase();

      if (!isCorrect && (key === "t" || key === "T")) {
        toggleTranslation();
        return;
      }

      playKey(isCorrect);
      if (isCorrect) {
        setCorrectKeystrokes((n) => n + 1);
        setFlashIndex(null);
      } else {
        setErrorKeystrokes((n) => n + 1);
        setFlashIndex(position);
      }

      const nextInput = input + key;
      setInput(nextInput);
      if (nextInput.length >= target.length) gradeAndSubmit(nextInput);
    },
    [currentLine, feedback, input, toggleTranslation, playKey, gradeAndSubmit]
  );

  const handleBackspace = useCallback(() => {
    if (feedback) return;
    setInput((s) => s.slice(0, -1));
    setFlashIndex(null);
  }, [feedback]);

  // Explicit early submission — lets the user submit before reaching the target's length.
  const handleEnter = useCallback(() => {
    if (feedback || !currentLine || input.length === 0) return;
    gradeAndSubmit(input);
  }, [feedback, currentLine, input, gradeAndSubmit]);

  // Mobile path: the soft keyboard reports whole-value changes (and fires no useful
  // keydown for most IMEs, autocorrect, or swipe input), so we diff against the previous
  // buffer instead of reading individual keys. Deliberately no "T" toggle hotkey here —
  // on a phone that would hijack every literal "t" the user types; the on-screen
  // translation button covers it instead.
  const handleInputChange = useCallback(
    (value: string) => {
      if (!currentLine || feedback) return;
      const target = currentLine.text;

      // Backspace / autocorrect deletion — no scoring, just rewind the buffer.
      if (value.length <= input.length) {
        setInput(value);
        setFlashIndex(null);
        return;
      }

      // Score only the characters that are genuinely new this event.
      let lastWrongIndex: number | null = null;
      let correct = 0;
      let wrong = 0;
      for (let i = input.length; i < value.length; i++) {
        const expected = target[i];
        if (expected !== undefined && value[i].toLowerCase() === expected.toLowerCase()) correct++;
        else {
          wrong++;
          lastWrongIndex = i;
        }
      }
      if (correct > 0) setCorrectKeystrokes((n) => n + correct);
      if (wrong > 0) setErrorKeystrokes((n) => n + wrong);
      playKey(wrong === 0);
      setFlashIndex(lastWrongIndex);

      setInput(value);
      if (value.length >= target.length) gradeAndSubmit(value);
    },
    [currentLine, feedback, input, playKey, gradeAndSubmit]
  );

  const focusInput = useCallback(() => {
    if (!prefersSoftKeyboard()) return;
    hiddenInputRef.current?.focus();
  }, []);

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
      // Keydown from the hidden mobile input bubbles up here too; letting it through
      // would score every character twice (once here, once in handleInputChange).
      if (e.target === hiddenInputRef.current) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleEnter();
        return;
      }
      if (e.key.length !== 1) return;
      e.preventDefault();
      handleKey(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [readerState, handleKey, handleBackspace, handleEnter]);

  const start = useCallback(() => {
    sessionStartRef.current = Date.now();
    lineStartRef.current = Date.now();
    setReaderState("typing");
    // Must run inside the Start button's own click handler — iOS Safari only honours
    // programmatic focus (and so only raises the keyboard) during a real user gesture.
    if (prefersSoftKeyboard()) hiddenInputRef.current?.focus();
  }, []);

  // Keep the soft keyboard up across line changes, and restore it after feedback clears.
  useEffect(() => {
    if (readerState !== "typing" || feedback) return;
    if (!prefersSoftKeyboard()) return;
    hiddenInputRef.current?.focus();
  }, [readerState, lineIndex, feedback]);

  const restart = useCallback(() => {
    setLineIndex(0);
    setInput("");
    setFlashIndex(null);
    setShowTranslation(true);
    setResults([]);
    setCorrectKeystrokes(0);
    setErrorKeystrokes(0);
    setFeedback(null);
    sessionStartRef.current = null;
    setReaderState("idle");
  }, []);

  return {
    currentLine,
    lineIndex,
    totalLines,
    readerState,
    input,
    flashIndex,
    showTranslation,
    feedback,
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
    hiddenInputRef,
    handleInputChange,
    handleEnter,
    focusInput,
    toggleTranslation,
  };
}
