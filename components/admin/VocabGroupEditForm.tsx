"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VocabGroupPublishToggle } from "@/components/admin/VocabGroupPublishToggle";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/cn";
import type { VocabGroupWithWords, Translations } from "@/types";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

interface EditableWord {
  id?: string;
  word: string;
  translations: Translations;
  example: string;
}

function asTranslations(value: unknown): Translations {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Translations) : {};
}

export function VocabGroupEditForm({ group }: { group: VocabGroupWithWords }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [translatingLocale, setTranslatingLocale] = useState<string | null>(null);
  const [name, setName] = useState(group.name);
  const [titleTranslations, setTitleTranslations] = useState<Translations>(asTranslations(group.titleTranslations));
  const [emoji, setEmoji] = useState(group.emoji);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>(group.difficulty);
  const [isPremium, setIsPremium] = useState(group.isPremium);
  const [words, setWords] = useState<EditableWord[]>(
    group.words.map((w) => ({ id: w.id, word: w.word, translations: asTranslations(w.translations), example: w.example }))
  );

  function updateTitleTranslation(code: string, val: string) {
    setTitleTranslations((t) => ({ ...t, [code]: val }));
  }

  function updateWord(idx: number, field: "word" | "example", val: string) {
    setWords((ws) => ws.map((w, i) => (i === idx ? { ...w, [field]: val } : w)));
  }

  function updateWordTranslation(idx: number, code: string, val: string) {
    setWords((ws) => ws.map((w, i) => (i === idx ? { ...w, translations: { ...w.translations, [code]: val } } : w)));
  }

  function removeWord(idx: number) {
    setWords((ws) => ws.filter((_, i) => i !== idx));
  }

  function addWord() {
    setWords((ws) => [...ws, { word: "", translations: {}, example: "" }]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/vocab-groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, titleTranslations, emoji, difficulty, isPremium, words }),
      });
      router.push("/admin/vocabulary");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleAiTranslate(localeCode: string) {
    setTranslatingLocale(localeCode);
    try {
      const res = await fetch("/api/ai/translate-vocab-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group.id, targetLocale: localeCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.error ? `Translation failed: ${JSON.stringify(err.error)}` : "Translation failed — the AI service may be unavailable.");
        return;
      }
      // Persisted server-side for every word — reload to pick it up rather than trying
      // to merge into local state (mirrors the story editor's AI-translate behavior).
      window.location.reload();
    } finally {
      setTranslatingLocale(null);
    }
  }

  const arWordName = titleTranslations.ar ?? "";

  return (
    <div className="space-y-8">
      <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-cream">Group details</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-cream/50">Published</span>
            <VocabGroupPublishToggle groupId={group.id} published={group.isPublished} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name (English)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Name (Arabic)"
            value={arWordName}
            onChange={(e) => updateTitleTranslation("ar", e.target.value)}
            dir="rtl"
            className="font-arabic"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div>
          <p className="text-xs font-semibold text-cream/40 uppercase tracking-wide mb-2">Name translations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div key={lang.code}>
                <label className="text-xs text-cream/40 flex items-center gap-1 mb-1">
                  <span aria-hidden>{lang.flag}</span> {lang.name}
                </label>
                <input
                  value={titleTranslations[lang.code] ?? ""}
                  onChange={(e) => updateTitleTranslation(lang.code, e.target.value)}
                  dir={lang.rtl ? "rtl" : "ltr"}
                  className={cn(
                    "w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream",
                    (lang.code === "ar") && "font-arabic"
                  )}
                />
              </div>
            ))}
          </div>
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
      </div>

      <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-cream">Words ({words.length})</h2>
          <Button variant="secondary" size="sm" onClick={addWord}>+ Add word</Button>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-cream/40 uppercase tracking-wide align-bottom pb-1 min-w-[160px]">Word</th>
                <th className="text-left text-xs font-semibold text-cream/40 uppercase tracking-wide align-bottom pb-1 min-w-[200px]">Example</th>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const covered = words.filter((w) => (w.translations[lang.code] ?? "").trim().length > 0).length;
                  return (
                    <th key={lang.code} className="text-left align-bottom pb-1 min-w-[180px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-cream/40 uppercase tracking-wide flex items-center gap-1">
                          <span aria-hidden>{lang.flag}</span> {lang.code.toUpperCase()}
                          <span className={cn("font-normal normal-case", covered === words.length && words.length > 0 ? "text-brand-400" : "text-cream/25")}>
                            {covered}/{words.length}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleAiTranslate(lang.code)}
                          disabled={translatingLocale !== null || words.length === 0}
                          className="text-[11px] font-medium text-brand-400 hover:text-brand-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                        >
                          {translatingLocale === lang.code ? (
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : (
                            "✨"
                          )}
                          AI translate
                        </button>
                      </div>
                    </th>
                  );
                })}
                <th className="min-w-[32px]" />
              </tr>
            </thead>
            <tbody>
              {words.map((w, idx) => (
                <tr key={w.id ?? `new-${idx}`}>
                  <td className="align-top">
                    <input
                      value={w.word}
                      onChange={(e) => updateWord(idx, "word", e.target.value)}
                      className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream"
                    />
                  </td>
                  <td className="align-top">
                    <input
                      value={w.example}
                      onChange={(e) => updateWord(idx, "example", e.target.value)}
                      className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream"
                    />
                  </td>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <td key={lang.code} className="align-top">
                      <input
                        value={w.translations[lang.code] ?? ""}
                        onChange={(e) => updateWordTranslation(idx, lang.code, e.target.value)}
                        dir={lang.rtl ? "rtl" : "ltr"}
                        className={cn(
                          "w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream",
                          (lang.code === "ar") && "font-arabic"
                        )}
                      />
                    </td>
                  ))}
                  <td className="align-top">
                    <button
                      type="button"
                      onClick={() => removeWord(idx)}
                      className="text-cream/30 hover:text-rose-400 text-sm px-2"
                      title="Remove word"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/admin/vocabulary")}>Cancel</Button>
        <Button onClick={handleSave} loading={saving} disabled={!name || !arWordName || words.length === 0}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
