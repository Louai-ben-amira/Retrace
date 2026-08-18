import Link from "next/link";
import { cn } from "@/lib/cn";
import { topicMeta } from "@/lib/topics";
import { getAppCopy } from "@/lib/i18n/app";

interface SidebarTopic { key: string; count: number }
interface SidebarStory { id: string; title: string; count: number }

interface WordBankSidebarProps {
  totalCount: number;
  dueCount: number;
  weakCount: number;
  masteredCount: number;
  topics: SidebarTopic[];
  recentStories: SidebarStory[];
  activeFilter?: "due" | "weak" | "mastered";
  uiLanguage?: string | null;
}

function CategoryLink({
  href, label, count, active, badgeColor,
}: { href: string; label: string; count: number; active: boolean; badgeColor?: "amber" | "rose" }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
        active ? "bg-brand-500/15 text-brand-400 font-medium" : "text-cream/60 hover:text-cream hover:bg-white/[0.06]"
      )}
    >
      <span>{label}</span>
      {count > 0 ? (
        <span
          className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
            badgeColor === "amber" && "bg-amber-400/15 text-amber-300",
            badgeColor === "rose" && "bg-rose-400/15 text-rose-300",
            !badgeColor && "bg-white/10 text-cream/50"
          )}
        >
          {count}
        </span>
      ) : (
        <span className="text-xs text-cream/25">{count}</span>
      )}
    </Link>
  );
}

// Below lg the sidebar is hidden entirely, which used to take the SRS filters — the only
// route into a review session — with it. This is the same navigation as a horizontally
// scrolling chip row, which suits a thumb better than a vertical list on a phone anyway.
function FilterChip({
  href, label, count, active, badgeColor,
}: { href: string; label: string; count: number; active: boolean; badgeColor?: "amber" | "rose" }) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors",
        active
          ? "border-brand-500/40 bg-brand-500/15 text-brand-400 font-medium"
          : "border-white/10 text-cream/60 active:bg-white/[0.06]"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
          badgeColor === "amber" && count > 0 && "bg-amber-400/15 text-amber-300",
          badgeColor === "rose" && count > 0 && "bg-rose-400/15 text-rose-300",
          (!badgeColor || count === 0) && "bg-white/10 text-cream/50"
        )}
      >
        {count}
      </span>
    </Link>
  );
}

export function WordBankSidebar({ totalCount, dueCount, weakCount, masteredCount, topics, recentStories, activeFilter, uiLanguage }: WordBankSidebarProps) {
  const t = getAppCopy(uiLanguage);
  return (
    <>
    <div className="lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 pb-1 w-max">
        <FilterChip href="/wordbank" label={t.wordbank.allTopics} count={totalCount} active={!activeFilter} />
        <FilterChip href="/wordbank?filter=due" label={t.wordbank.dueForReview} count={dueCount} active={activeFilter === "due"} badgeColor="amber" />
        <FilterChip href="/wordbank?filter=weak" label={t.wordbank.weakWords} count={weakCount} active={activeFilter === "weak"} badgeColor="rose" />
        <FilterChip href="/wordbank?filter=mastered" label={t.wordbank.masteredFilter} count={masteredCount} active={activeFilter === "mastered"} />
        {topics.map((topic) => {
          const meta = topicMeta(topic.key);
          return (
            <Link
              key={topic.key}
              href={`/wordbank/topic/${topic.key}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-sm text-cream/60 whitespace-nowrap active:bg-white/[0.06] transition-colors"
            >
              <span aria-hidden>{meta.emoji}</span>
              <span>{meta.label}</span>
              <span className="text-[11px] text-cream/30">{topic.count}</span>
            </Link>
          );
        })}
      </div>
    </div>

    <aside className="w-[200px] shrink-0 hidden lg:block">
      <nav className="space-y-1 mb-6">
        <CategoryLink href="/wordbank" label={t.wordbank.allTopics} count={totalCount} active={!activeFilter} />
        <CategoryLink href="/wordbank?filter=due" label={t.wordbank.dueForReview} count={dueCount} active={activeFilter === "due"} badgeColor={dueCount > 0 ? "amber" : undefined} />
        <CategoryLink href="/wordbank?filter=weak" label={t.wordbank.weakWords} count={weakCount} active={activeFilter === "weak"} badgeColor={weakCount > 0 ? "rose" : undefined} />
        <CategoryLink href="/wordbank?filter=mastered" label={t.wordbank.masteredFilter} count={masteredCount} active={activeFilter === "mastered"} />
      </nav>

      {topics.length > 0 && (
        <>
          <div className="h-px bg-white/[0.08] mb-4" />
          <p className="text-[11px] uppercase tracking-wide text-cream/30 font-semibold px-3 mb-2">{t.wordbank.byTopic}</p>
          <nav className="space-y-0.5 mb-6">
            {topics.map((topic) => {
              const meta = topicMeta(topic.key);
              return (
                <Link
                  key={topic.key}
                  href={`/wordbank/topic/${topic.key}`}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm text-cream/60 hover:text-cream hover:bg-white/[0.06] transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span aria-hidden>{meta.emoji}</span>
                    <span className="truncate">{meta.label}</span>
                  </span>
                  <span className="text-xs text-cream/30 shrink-0">{topic.count}</span>
                </Link>
              );
            })}
          </nav>
        </>
      )}

      {recentStories.length > 0 && (
        <>
          <div className="h-px bg-white/[0.08] mb-4" />
          <p className="text-[11px] uppercase tracking-wide text-cream/30 font-semibold px-3 mb-2">{t.wordbank.byStory}</p>
          <nav className="space-y-0.5">
            {recentStories.map((s) => (
              <Link
                key={s.id}
                href={`/wordbank/story/${s.id}`}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm text-cream/60 hover:text-cream hover:bg-white/[0.06] transition-colors"
              >
                <span className="truncate">{s.title}</span>
                <span className="text-xs text-cream/30 shrink-0">{s.count}</span>
              </Link>
            ))}
          </nav>
        </>
      )}
    </aside>
    </>
  );
}
