import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StoryCard } from "@/components/progress/StoryCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Story Library" };

interface LibraryPageProps {
  searchParams: { difficulty?: string; topic?: string };
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const [user, stories] = await Promise.all([
    getCurrentUser(),
    db.story.findMany({
      where: {
        isPublished: true,
        ...(searchParams.difficulty && { difficulty: searchParams.difficulty as any }),
        ...(searchParams.topic && { topic: searchParams.topic }),
      },
      include: { tags: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const isPro = user?.subscription?.tier === "PRO";

  const progressRecords = user
    ? await db.storyProgress.findMany({ where: { userId: user.id } })
    : [];

  const progressMap = new Map(progressRecords.map((p) => [p.storyId, p]));

  const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream mb-1.5">Story library</h1>
        <p className="text-[15px] text-cream/50">Choose a story to start or continue learning.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-9 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <FilterChip href="/library" active={!searchParams.difficulty} label="All levels" />
        {difficulties.map((d) => (
          <FilterChip
            key={d}
            href={`/library?difficulty=${d}`}
            active={searchParams.difficulty === d}
            label={d.charAt(0) + d.slice(1).toLowerCase()}
          />
        ))}
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-24 text-cream/40 animate-fade-up">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-base font-medium text-cream/60 mb-2">No stories at this level yet</p>
          <p className="text-sm">More coming soon — try another level for now.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map((story, i) => (
            <div key={story.id} className="animate-fade-up" style={{ animationDelay: `${140 + i * 60}ms` }}>
              <StoryCard
                story={story}
                progress={progressMap.get(story.id) ?? null}
                locked={story.isPremium && !isPro}
                locale={user?.nativeLanguage ?? "ar"}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 font-medium ${
        active
          ? "bg-brand-500 text-ink border-brand-500"
          : "bg-white/5 text-cream/50 border-white/10 hover:border-brand-500/40 hover:text-brand-400"
      }`}
    >
      {label}
    </a>
  );
}
