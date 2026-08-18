import { VOCAB_MASTERY_META, type MasteryLevel } from "@/lib/vocabSrs";
import { getAppCopy } from "@/lib/i18n/app";

interface VocabularyMasteryBarProps {
  counts: Record<MasteryLevel, number>;
  total: number;
  uiLanguage?: string | null;
}

const ORDER: MasteryLevel[] = ["MASTERED", "GOOD", "LEARNING", "NEW"];
const LOWER: Record<MasteryLevel, "mastered" | "good" | "learning" | "new"> = {
  MASTERED: "mastered", GOOD: "good", LEARNING: "learning", NEW: "new",
};

export function VocabularyMasteryBar({ counts, total, uiLanguage }: VocabularyMasteryBarProps) {
  if (total === 0) return null;
  const t = getAppCopy(uiLanguage);

  return (
    <div className="mb-8">
      <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-white/[0.06]">
        {ORDER.map((level) => {
          const pct = (counts[level] / total) * 100;
          if (pct === 0) return null;
          return <div key={level} className={VOCAB_MASTERY_META[level].bar} style={{ width: `${pct}%` }} />;
        })}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
        {ORDER.map((level) => (
          <div key={level} className="flex items-center gap-1.5 text-xs text-cream/50">
            <span className={`w-2 h-2 rounded-full ${VOCAB_MASTERY_META[level].dot}`} />
            {t.common.mastery[LOWER[level]]} <span className="text-cream/70 font-medium">{counts[level]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
