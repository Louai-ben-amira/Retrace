"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { GeneratedStory } from "@/types";
import { slugify } from "@/lib/utils";
import { TOPIC_KEYS } from "@/lib/topics";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const TOPICS = TOPIC_KEYS;

export function StoryForm() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState<Partial<GeneratedStory> & { isPremium?: boolean }>({
    difficulty: "BEGINNER",
    topic: "daily-life",
    lines: [],
    isPremium: false,
  });
  const [aiTopic, setAiTopic] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: story.difficulty, topic: aiTopic || story.topic }),
      });
      const data = await res.json();
      if (data.story) setStory((s) => ({ ...s, ...data.story }));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!story.title || !story.titleAr || !story.lines?.length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...story,
          slug: slugify(story.title),
          isAIGenerated: true,
          isPremium: story.isPremium ?? false,
          isPublished: false,
        }),
      });
      const data = await res.json();
      if (data.story) router.push("/admin/stories");
    } finally {
      setSaving(false);
    }
  }

  function updateLine(idx: number, field: "text" | "translation", val: string) {
    setStory((s) => ({
      ...s,
      lines: s.lines?.map((l, i) => i === idx ? { ...l, [field]: val } : l),
    }));
  }

  return (
    <div className="space-y-8">
      {/* AI Generation */}
      <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-6">
        <h2 className="font-semibold text-brand-300 mb-4 flex items-center gap-2">
          <span className="text-lg">✨</span> Generate with AI
        </h2>
        <div className="flex gap-3 flex-wrap">
          <select
            value={story.difficulty}
            onChange={(e) => setStory((s) => ({ ...s, difficulty: e.target.value as any }))}
            className="text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream"
          >
            {DIFFICULTIES.map((d) => <option key={d} value={d} className="bg-ink-surface text-cream">{d}</option>)}
          </select>
          <select
            value={story.topic}
            onChange={(e) => setStory((s) => ({ ...s, topic: e.target.value }))}
            className="text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream"
          >
            {TOPICS.map((t) => <option key={t} value={t} className="bg-ink-surface text-cream">{t}</option>)}
          </select>
          <input
            placeholder="Custom topic (optional)"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            className="flex-1 text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream placeholder:text-cream/25"
          />
          <Button onClick={handleGenerate} loading={generating} size="sm">
            Generate
          </Button>
        </div>
      </div>

      {/* Story metadata */}
      <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-cream mb-2">Story details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Title (English)" value={story.title ?? ""} onChange={(e) => setStory((s) => ({ ...s, title: e.target.value }))} />
          <Input label="Title (Arabic)" value={story.titleAr ?? ""} onChange={(e) => setStory((s) => ({ ...s, titleAr: e.target.value }))} />
          <Input label="Description (English)" value={story.description ?? ""} onChange={(e) => setStory((s) => ({ ...s, description: e.target.value }))} />
          <Input label="Description (Arabic)" value={story.descriptionAr ?? ""} onChange={(e) => setStory((s) => ({ ...s, descriptionAr: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPremium"
            checked={story.isPremium ?? false}
            onChange={(e) => setStory((s) => ({ ...s, isPremium: e.target.checked }))}
            className="rounded border-white/20 bg-white/5 text-brand-500"
          />
          <label htmlFor="isPremium" className="text-sm text-cream/70">Pro story (requires subscription)</label>
        </div>
      </div>

      {/* Lines editor */}
      {story.lines && story.lines.length > 0 && (
        <div className="bg-ink-surface border border-white/[0.08] rounded-xl p-6">
          <h2 className="font-semibold text-cream mb-4">Lines ({story.lines.length})</h2>
          <div className="space-y-3">
            {story.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/[0.03] rounded-lg">
                <div>
                  <label className="text-xs text-cream/40 block mb-1">Line {line.position} — English</label>
                  <textarea
                    value={line.text}
                    onChange={(e) => updateLine(idx, "text", e.target.value)}
                    rows={2}
                    className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-cream/40 block mb-1">Arabic translation</label>
                  <textarea
                    value={line.translation}
                    onChange={(e) => updateLine(idx, "translation", e.target.value)}
                    rows={2}
                    dir="rtl"
                    className="w-full text-sm border border-white/15 rounded-md px-3 py-2 bg-white/5 text-cream font-arabic resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/admin/stories")}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!story.title || !story.lines?.length}
        >
          Save story
        </Button>
      </div>
    </div>
  );
}
