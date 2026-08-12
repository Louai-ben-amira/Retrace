"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

interface DraftWord {
  word: string;
  translation: string;
  example: string;
}

export function VocabGroupForm() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [emoji, setEmoji] = useState("📖");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("BEGINNER");
  const [isPremium, setIsPremium] = useState(false);
  const [wordCount, setWordCount] = useState(20);
  const [words, setWords] = useState<DraftWord[]>([]);

  async function handleGenerate() {
    if (!name) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/vocab-groups/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, difficulty, wordCount }),
      });
      const data = await res.json();
      if (data.words) setWords(data.words);
    } finally {
      setGenerating(false);
    }
  }

  function updateWord(idx: number, field: keyof DraftWord, val: string) {
    setWords((ws) => ws.map((w, i) => (i === idx ? { ...w, [field]: val } : w)));
  }

  function removeWord(idx: number) {
    setWords((ws) => ws.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!name || !nameAr || words.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vocab-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, titleTranslations: { ar: nameAr }, emoji, difficulty, isPremium, wordTarget: wordCount, words }),
      });
      const data = await res.json();
      if (data.group) router.push(`/admin/vocabulary/${data.group.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Group details */}
      <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-cream">Group details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name (English)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Family" />
          <Input label="Name (Arabic)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="العائلة" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-cream/70">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream"
            >
              {DIFFICULTIES.map((d) => <option key={d} value={d} className="bg-ink-surface text-cream">{d}</option>)}
            </select>
          </div>
          <Input
            label="Word count target"
            type="number"
            min={1}
            max={60}
            value={wordCount}
            onChange={(e) => setWordCount(Math.min(60, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPremium"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-brand-500"
          />
          <label htmlFor="isPremium" className="text-sm text-cream/70">Pro group (requires subscription)</label>
        </div>
        <Button onClick={handleGenerate} loading={generating} disabled={!name} size="sm">
          ✨ Generate with AI
        </Button>
      </div>

      {/* Words review */}
      {words.length > 0 && (
        <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6">
          <h2 className="font-semibold text-cream mb-4">Words ({words.length})</h2>
          <div className="space-y-3">
            {words.map((w, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 p-3 bg-white/[0.03] rounded-lg items-start">
                <div>
                  <label className="text-xs text-cream/40 block mb-1">Word</label>
                  <input
                    value={w.word}
                    onChange={(e) => updateWord(idx, "word", e.target.value)}
                    className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream"
                  />
                </div>
                <div>
                  <label className="text-xs text-cream/40 block mb-1">Arabic</label>
                  <input
                    value={w.translation}
                    onChange={(e) => updateWord(idx, "translation", e.target.value)}
                    dir="rtl"
                    className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream font-arabic"
                  />
                </div>
                <div>
                  <label className="text-xs text-cream/40 block mb-1">Example</label>
                  <input
                    value={w.example}
                    onChange={(e) => updateWord(idx, "example", e.target.value)}
                    className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeWord(idx)}
                  className="text-cream/30 hover:text-rose-400 text-sm mt-6 px-2"
                  title="Remove word"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/admin/vocabulary")}>Cancel</Button>
        <Button onClick={handleSave} loading={saving} disabled={!name || !nameAr || words.length === 0}>
          Save as draft
        </Button>
      </div>
    </div>
  );
}
