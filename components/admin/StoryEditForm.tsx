"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { parseVocabTags } from "@/lib/utils";
import { cn } from "@/lib/cn";
import type { StoryWithLines, Translations } from "@/types";

function asTranslations(value: unknown): Translations {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Translations) : {};
}

export function StoryEditForm({ story }: { story: StoryWithLines }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [checkingQA, setCheckingQA] = useState(false);
  const [qaIssues, setQaIssues] = useState<Record<number, string>>({});
  const [qaChecked, setQaChecked] = useState(false);
  const [translatingLocale, setTranslatingLocale] = useState<string | null>(null);
  const [translatingVocabLocale, setTranslatingVocabLocale] = useState<string | null>(null);
  const allTags = story.lines.flatMap((l) => parseVocabTags(l.vocabTags));
  const [data, setData] = useState({
    title: story.title,
    description: story.description ?? "",
    isPremium: story.isPremium,
    titleTranslations: asTranslations(story.titleTranslations),
    descriptionTranslations: asTranslations(story.descriptionTranslations),
    lines: story.lines.map((l) => ({ id: l.id, position: l.position, text: l.text, translations: asTranslations(l.translations) })),
  });

  function updateTitleTranslation(code: string, val: string) {
    setData((s) => ({ ...s, titleTranslations: { ...s.titleTranslations, [code]: val } }));
  }

  function updateDescriptionTranslation(code: string, val: string) {
    setData((s) => ({ ...s, descriptionTranslations: { ...s.descriptionTranslations, [code]: val } }));
  }

  function updateLineText(idx: number, val: string) {
    setData((s) => ({ ...s, lines: s.lines.map((l, i) => (i === idx ? { ...l, text: val } : l)) }));
  }

  function updateLineTranslation(idx: number, code: string, val: string) {
    setData((s) => ({
      ...s,
      lines: s.lines.map((l, i) => (i === idx ? { ...l, translations: { ...l.translations, [code]: val } } : l)),
    }));
    if (code === "ar") {
      const position = data.lines[idx].position;
      setQaIssues((issues) => {
        if (!(position in issues)) return issues;
        const next = { ...issues };
        delete next[position];
        return next;
      });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          titleTranslations: data.titleTranslations,
          description: data.description,
          descriptionTranslations: data.descriptionTranslations,
          isPremium: data.isPremium,
          lines: data.lines.map((l) => ({ id: l.id, text: l.text, translations: l.translations })),
        }),
      });
      router.push("/admin/stories");
    } finally {
      setSaving(false);
    }
  }

  async function handleTagVocab() {
    setTagging(true);
    try {
      await fetch("/api/ai/tag-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id }),
      });
      alert("Vocab tagging complete!");
    } finally { setTagging(false); }
  }

  async function handleCheckTranslations() {
    setCheckingQA(true);
    try {
      const res = await fetch("/api/ai/qa-translation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id }),
      });
      if (!res.ok) {
        alert("Translation check failed — the AI service may be unavailable.");
        return;
      }
      const json = await res.json();
      const issues: { position: number; issue: string }[] = json.issues ?? [];
      setQaIssues(Object.fromEntries(issues.map((i) => [i.position, i.issue])));
      setQaChecked(true);
      if (issues.length === 0) alert("No issues found — translations look good!");
    } finally { setCheckingQA(false); }
  }

  async function handleAiTranslate(localeCode: string) {
    setTranslatingLocale(localeCode);
    try {
      const res = await fetch("/api/ai/translate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id, targetLocale: localeCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.error ? `Translation failed: ${JSON.stringify(err.error)}` : "Translation failed — the AI service may be unavailable.");
        return;
      }
      // The translation is persisted server-side for every line — reload to pick it up
      // (this page is server-rendered directly from the DB, unlike /api/stories which
      // 404s on unpublished stories, so a full reload is the reliable way to refresh).
      window.location.reload();
    } finally {
      setTranslatingLocale(null);
    }
  }

  async function handleAiTranslateVocab(localeCode: string) {
    setTranslatingVocabLocale(localeCode);
    try {
      const res = await fetch("/api/ai/translate-vocab-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id, targetLocale: localeCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.error ? `Translation failed: ${JSON.stringify(err.error)}` : "Translation failed — the AI service may be unavailable.");
        return;
      }
      window.location.reload();
    } finally {
      setTranslatingVocabLocale(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-cream">Story details</h2>
        <Input label="Title (English)" value={data.title} onChange={(e) => setData((s) => ({ ...s, title: e.target.value }))} />
        <textarea
          value={data.description}
          onChange={(e) => setData((s) => ({ ...s, description: e.target.value }))}
          rows={2}
          placeholder="Description (English)"
          className="w-full text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream resize-none"
        />

        <div>
          <p className="text-xs font-semibold text-cream/40 uppercase tracking-wide mb-2">Title translations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div key={lang.code}>
                <label className="text-xs text-cream/40 flex items-center gap-1 mb-1">
                  <span aria-hidden>{lang.flag}</span> {lang.name}
                </label>
                <input
                  value={data.titleTranslations[lang.code] ?? ""}
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

        <div>
          <p className="text-xs font-semibold text-cream/40 uppercase tracking-wide mb-2">Description translations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div key={lang.code}>
                <label className="text-xs text-cream/40 flex items-center gap-1 mb-1">
                  <span aria-hidden>{lang.flag}</span> {lang.name}
                </label>
                <textarea
                  value={data.descriptionTranslations[lang.code] ?? ""}
                  onChange={(e) => updateDescriptionTranslation(lang.code, e.target.value)}
                  rows={2}
                  dir={lang.rtl ? "rtl" : "ltr"}
                  className={cn(
                    "w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream resize-none",
                    (lang.code === "ar") && "font-arabic"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPremium" checked={data.isPremium} onChange={(e) => setData((s) => ({ ...s, isPremium: e.target.checked }))} className="rounded border-white/20 bg-white/5 text-brand-500" />
          <label htmlFor="isPremium" className="text-sm text-cream/70">Pro story</label>
        </div>
      </div>

      <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-cream">Lines</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCheckTranslations} loading={checkingQA}>
              Check Arabic translations
            </Button>
            <Button variant="secondary" size="sm" onClick={handleTagVocab} loading={tagging}>Tag vocabulary</Button>
          </div>
        </div>
        {qaChecked && Object.keys(qaIssues).length > 0 && (
          <p className="text-xs text-amber-400 mb-3">
            {Object.keys(qaIssues).length} translation{Object.keys(qaIssues).length > 1 ? "s" : ""} flagged below — fix and re-check before publishing.
          </p>
        )}

        {allTags.length > 0 && (
          <div className="mb-5 p-3 bg-white/[0.03] rounded-lg">
            <p className="text-xs font-semibold text-cream/40 uppercase tracking-wide mb-2">
              Tappable vocabulary translations ({allTags.length} word{allTags.length === 1 ? "" : "s"} tagged)
            </p>
            <div className="flex flex-wrap gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const covered = allTags.filter((t) => (t.translations[lang.code] ?? "").trim().length > 0).length;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => void handleAiTranslateVocab(lang.code)}
                    disabled={translatingVocabLocale !== null}
                    className="flex items-center gap-1.5 text-xs font-medium text-cream/60 hover:text-brand-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {translatingVocabLocale === lang.code ? (
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <span aria-hidden>{lang.flag}</span>
                    )}
                    {lang.code.toUpperCase()}
                    <span className={covered === allTags.length ? "text-brand-400" : "text-cream/25"}>
                      {covered}/{allTags.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-cream/40 uppercase tracking-wide align-bottom pb-1 min-w-[220px]">
                  English
                </th>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const covered = data.lines.filter((l) => (l.translations[lang.code] ?? "").trim().length > 0).length;
                  return (
                    <th key={lang.code} className="text-left align-bottom pb-1 min-w-[220px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-cream/40 uppercase tracking-wide flex items-center gap-1">
                          <span aria-hidden>{lang.flag}</span> {lang.code.toUpperCase()}
                          <span className={cn("font-normal normal-case", covered === data.lines.length ? "text-brand-400" : "text-cream/25")}>
                            {covered}/{data.lines.length}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleAiTranslate(lang.code)}
                          disabled={translatingLocale !== null}
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
              </tr>
            </thead>
            <tbody>
              {data.lines.map((line, idx) => (
                <tr key={line.id}>
                  <td className="align-top">
                    <label className="text-xs text-cream/30 block mb-1">Line {line.position}</label>
                    <textarea
                      value={line.text}
                      onChange={(e) => updateLineText(idx, e.target.value)}
                      rows={2}
                      className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream resize-none"
                    />
                  </td>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <td key={lang.code} className="align-top">
                      <textarea
                        value={line.translations[lang.code] ?? ""}
                        onChange={(e) => updateLineTranslation(idx, lang.code, e.target.value)}
                        rows={2}
                        dir={lang.rtl ? "rtl" : "ltr"}
                        className={cn(
                          "w-full text-sm border rounded-md px-3 py-2 bg-white/5 text-cream resize-none",
                          (lang.code === "ar") && "font-arabic",
                          lang.code === "ar" && qaIssues[line.position] ? "border-amber-400/60" : "border-white/15"
                        )}
                      />
                      {lang.code === "ar" && qaIssues[line.position] && (
                        <p className="text-xs text-amber-400 mt-1">⚠ {qaIssues[line.position]}</p>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/admin/stories")}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>Save changes</Button>
      </div>
    </div>
  );
}
