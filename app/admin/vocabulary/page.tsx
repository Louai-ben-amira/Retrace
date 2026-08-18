import Link from "next/link";
import { getAdminVocabGroupsList } from "@/lib/queries";
import { Badge } from "@/components/ui/Badge";
import { difficultyLabel } from "@/lib/utils";
import { VocabGroupPublishToggle } from "@/components/admin/VocabGroupPublishToggle";
import { SUPPORTED_LANGUAGES, getTranslation } from "@/lib/languages";
import type { Translations } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vocabulary — Admin" };

function asTranslations(value: unknown): Translations {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Translations) : {};
}

export default async function AdminVocabularyPage() {
  const groups = await getAdminVocabGroupsList();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-xl font-bold text-cream">Vocabulary groups</h1>
          <p className="text-sm text-cream/40 mt-0.5">{groups.length} groups total</p>
        </div>
        <Link
          href="/admin/vocabulary/new"
          className="bg-brand-500 text-ink text-sm font-semibold px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-px transition-all duration-200"
        >
          + New group with AI
        </Link>
      </div>

      <div className="bg-ink-surface rounded-xl border border-white/[0.08] overflow-hidden">
        {/* The table scrolls inside its own card rather than widening the page — the
            outer `overflow-hidden` alone just clipped the right-hand columns on mobile. */}
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Group</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Level</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Access</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Words</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Learners</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Translations</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Published</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {groups.map((group) => {
              const coverage = SUPPORTED_LANGUAGES.map((lang) => {
                const covered =
                  group.words.length > 0 &&
                  group.words.every((w) => (asTranslations(w.translations)[lang.code] ?? "").trim().length > 0);
                return { code: lang.code, covered };
              });
              return (
              <tr key={group.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-cream flex items-center gap-2">
                    <span aria-hidden>{group.emoji}</span> {group.name}
                  </div>
                  <div className="font-arabic text-cream/30 text-xs mt-0.5" dir="rtl">{getTranslation(group.titleTranslations as Translations, "ar")}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={group.difficulty === "BEGINNER" ? "brand" : group.difficulty === "INTERMEDIATE" ? "amber" : "rose"}>
                    {difficultyLabel(group.difficulty)}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={group.isPremium ? "default" : "brand"}>{group.isPremium ? "Pro" : "Free"}</Badge>
                </td>
                <td className="px-5 py-4 text-cream/50">{group._count.words}</td>
                <td className="px-5 py-4 text-cream/50">{group._count.progress}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
                    {coverage.map((c) => (
                      <span key={c.code} className={c.covered ? "text-brand-400" : "text-cream/25"}>
                        {c.code.toUpperCase()} {c.covered ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <VocabGroupPublishToggle groupId={group.id} published={group.isPublished} />
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/admin/vocabulary/${group.id}`} className="text-brand-400 hover:text-brand-300 text-sm font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {groups.length === 0 && (
          <div className="text-center py-16 text-cream/40">
            <p className="mb-2">No vocabulary groups yet.</p>
            <Link href="/admin/vocabulary/new" className="text-brand-400 hover:underline text-sm">
              Create your first group →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
