import Link from "next/link";
import { cn } from "@/lib/cn";
import { topicMeta } from "@/lib/topics";

interface SidebarTopic { key: string; count: number }
interface SidebarStory { id: string; title: string; count: number }

interface VocabularySidebarProps {
  totalCount: number;
  dueCount: number;
  weakCount: number;
  masteredCount: number;
  topics: SidebarTopic[];
  recentStories: SidebarStory[];
  activeFilter?: "due" | "weak" | "mastered";
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

export function VocabularySidebar({ totalCount, dueCount, weakCount, masteredCount, topics, recentStories, activeFilter }: VocabularySidebarProps) {
  return (
    <aside className="w-[200px] shrink-0 hidden lg:block">
      <nav className="space-y-1 mb-6">
        <CategoryLink href="/vocabulary/mine" label="All topics" count={totalCount} active={!activeFilter} />
        <CategoryLink href="/vocabulary/mine?filter=due" label="Due for review" count={dueCount} active={activeFilter === "due"} badgeColor={dueCount > 0 ? "amber" : undefined} />
        <CategoryLink href="/vocabulary/mine?filter=weak" label="Weak words" count={weakCount} active={activeFilter === "weak"} badgeColor={weakCount > 0 ? "rose" : undefined} />
        <CategoryLink href="/vocabulary/mine?filter=mastered" label="Mastered" count={masteredCount} active={activeFilter === "mastered"} />
      </nav>

      {topics.length > 0 && (
        <>
          <div className="h-px bg-white/[0.08] mb-4" />
          <p className="text-[11px] uppercase tracking-wide text-cream/30 font-semibold px-3 mb-2">By topic</p>
          <nav className="space-y-0.5 mb-6">
            {topics.map((t) => {
              const meta = topicMeta(t.key);
              return (
                <Link
                  key={t.key}
                  href={`/vocabulary/mine/topic/${t.key}`}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm text-cream/60 hover:text-cream hover:bg-white/[0.06] transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span aria-hidden>{meta.emoji}</span>
                    <span className="truncate">{meta.label}</span>
                  </span>
                  <span className="text-xs text-cream/30 shrink-0">{t.count}</span>
                </Link>
              );
            })}
          </nav>
        </>
      )}

      {recentStories.length > 0 && (
        <>
          <div className="h-px bg-white/[0.08] mb-4" />
          <p className="text-[11px] uppercase tracking-wide text-cream/30 font-semibold px-3 mb-2">By story</p>
          <nav className="space-y-0.5">
            {recentStories.map((s) => (
              <Link
                key={s.id}
                href={`/vocabulary/mine/story/${s.id}`}
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
  );
}
