import { memo, useMemo } from "react";
import { cn } from "@/lib/cn";
import type { VocabTag } from "@/types";

interface KaraokeTextProps {
  text: string;
  typedIndex: number;
  flashIndex: number | null;
  vocabTags?: VocabTag[];
  vocabEnabled?: boolean;
  onWordTap?: (tag: VocabTag) => void;
}

// Precomputed once at module load — renderChar picks between these instead of
// running clsx/tailwind-merge conflict resolution on every character on every keystroke.
// display stays "inline" (not inline-block) so the browser only wraps at real spaces
// instead of treating every letter's box edge as a valid line-break point.
const CHAR_BASE = "relative whitespace-pre-wrap transition-colors duration-150";
const CHAR_CLASS_TYPED = cn(CHAR_BASE, "text-cream opacity-100");
const CHAR_CLASS_UNTYPED = cn(CHAR_BASE, "text-cream opacity-20");
const CHAR_CLASS_FLASH = cn(CHAR_BASE, "text-red-500 opacity-100");
const WORD_WRAPPER_CLASS = "whitespace-nowrap";
const TAPPABLE_WORD_CLASS = "whitespace-nowrap cursor-pointer border-b-2 border-dotted border-brand-500/50";

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, "");
}

function tokenizeWords(text: string): { word: string; start: number; end: number }[] {
  const words: { word: string; start: number; end: number }[] = [];
  const re = /[A-Za-z']+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    words.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  }
  return words;
}

export const KaraokeText = memo(function KaraokeText({
  text,
  typedIndex,
  flashIndex,
  vocabTags = [],
  vocabEnabled = false,
  onWordTap,
}: KaraokeTextProps) {
  const words = useMemo(() => tokenizeWords(text), [text]);
  const vocabByWord = useMemo(() => {
    const map = new Map<string, VocabTag>();
    for (const tag of vocabTags) map.set(normalizeWord(tag.word), tag);
    return map;
  }, [vocabTags]);

  const renderChar = (i: number) => {
    const char = text[i];
    const isTyped = i < typedIndex;
    const isCursor = i === typedIndex;
    const isFlashing = i === flashIndex;
    const className = isFlashing ? CHAR_CLASS_FLASH : isTyped ? CHAR_CLASS_TYPED : CHAR_CLASS_UNTYPED;
    return (
      <span key={i} className={className}>
        {char}
        {isCursor && (
          <span
            aria-hidden
            className="absolute left-0 -bottom-1.5 w-full h-1 rounded-full bg-brand-500 animate-pulse"
          />
        )}
      </span>
    );
  };

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let wordIndex = 0;
  while (cursor < text.length) {
    const w = words[wordIndex];
    if (w && w.start === cursor) {
      const tag = vocabByWord.get(normalizeWord(w.word));
      const tappable = vocabEnabled && !!tag && typedIndex <= w.start;
      const chars = [];
      for (let i = w.start; i < w.end; i++) chars.push(renderChar(i));
      nodes.push(
        <span
          key={`w-${w.start}`}
          onClick={tappable ? () => onWordTap?.(tag as VocabTag) : undefined}
          className={tappable ? TAPPABLE_WORD_CLASS : WORD_WRAPPER_CLASS}
        >
          {chars}
        </span>
      );
      cursor = w.end;
      wordIndex++;
    } else {
      nodes.push(renderChar(cursor));
      cursor++;
    }
  }

  return (
    <p className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-center text-balance select-none">
      {nodes}
    </p>
  );
});
