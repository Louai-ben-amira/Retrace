import Link from "next/link";
import { getAdminStoriesList } from "@/lib/queries";
import { Badge } from "@/components/ui/Badge";
import { difficultyLabel } from "@/lib/utils";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { StoryCover } from "@/components/library/StoryCover";
import { SUPPORTED_LANGUAGES, getTranslation } from "@/lib/languages";
import type { Translations } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Stories — Admin" };

function asTranslations(value: unknown): Translations {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Translations) : {};
}

export default async function AdminStoriesPage() {
  const stories = await getAdminStoriesList();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-xl font-bold text-cream">Stories</h1>
          <p className="text-sm text-cream/40 mt-0.5">{stories.length} stories total</p>
        </div>
        <Link
          href="/admin/stories/new"
          className="bg-brand-500 text-ink text-sm font-semibold px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-px transition-all duration-200"
        >
          + New story
        </Link>
      </div>

      <div className="bg-ink-surface rounded-xl border border-white/[0.08] overflow-hidden">
        {/* The table scrolls inside its own card rather than widening the page — the
            outer `overflow-hidden` alone just clipped the right-hand columns on mobile. */}
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Cover</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Level</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Lines</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Learners</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Translations</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {stories.map((story) => {
              const titleTranslations = asTranslations(story.titleTranslations);
              const coverage = SUPPORTED_LANGUAGES.map((lang) => {
                const covered =
                  story.lines.length > 0 &&
                  story.lines.every((l) => (asTranslations(l.translations)[lang.code] ?? "").trim().length > 0);
                return { code: lang.code, covered };
              });
              return (
              <tr key={story.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-4 pl-5 pr-0">
                  <StoryCover
                    src={story.coverImage}
                    topic={story.topic}
                    alt=""
                    sizes="72px"
                    emojiClassName="text-lg"
                    className="h-11 w-[72px] rounded-md border border-white/10"
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-cream">{story.title}</div>
                  <div className="font-arabic text-cream/30 text-xs mt-0.5" dir="rtl">{getTranslation(titleTranslations, "ar")}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={story.difficulty === "BEGINNER" ? "brand" : story.difficulty === "INTERMEDIATE" ? "amber" : "rose"}>
                    {difficultyLabel(story.difficulty)}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-cream/50">{story._count.lines}</td>
                <td className="px-5 py-4 text-cream/50">{story._count.progress}</td>
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
                  <PublishToggle storyId={story.id} published={story.isPublished} />
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/stories/${story.id}`}
                    className="text-brand-400 hover:text-brand-300 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {stories.length === 0 && (
          <div className="text-center py-16 text-cream/40">
            <p className="mb-2">No stories yet.</p>
            <Link href="/admin/stories/new" className="text-brand-400 hover:underline text-sm">
              Create your first story →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
