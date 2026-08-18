import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Difficulty } from "@prisma/client";

// Cached DB reads that are identical for every user (no per-user data), safe to
// share across requests. Never wrap anything here that depends on the signed-in
// user — unstable_cache's result is shared globally, not scoped per request.

export const getPublishedStories = unstable_cache(
  async (difficulty?: string, topic?: string) => {
    return db.story.findMany({
      where: {
        isPublished: true,
        ...(difficulty && { difficulty: difficulty as Difficulty }),
        ...(topic && { topic }),
      },
      include: { tags: true },
      orderBy: { createdAt: "desc" },
    });
  },
  ["published-stories"],
  { revalidate: 60, tags: ["stories"] }
);

export const getAdminStoriesList = unstable_cache(
  async () => {
    return db.story.findMany({
      select: {
        id: true,
        title: true,
        titleTranslations: true,
        difficulty: true,
        isPublished: true,
        createdAt: true,
        _count: { select: { lines: true, progress: true } },
        lines: { select: { translations: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["admin-stories-list"],
  { revalidate: 30, tags: ["stories"] }
);

export const getAdminVocabGroupsList = unstable_cache(
  async () => {
    return db.vocabGroup.findMany({
      select: {
        id: true,
        name: true,
        emoji: true,
        titleTranslations: true,
        difficulty: true,
        isPremium: true,
        isPublished: true,
        createdAt: true,
        _count: { select: { words: true, progress: true } },
        words: { select: { translations: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["admin-vocab-groups-list"],
  { revalidate: 30, tags: ["vocab-groups"] }
);

export const getAdminAnalyticsCounts = unstable_cache(
  async () => {
    const [totalUsers, totalStories, totalAttempts, completedStories, avgAccuracy, passRate, topStories] = await Promise.all([
      db.user.count(),
      db.story.count({ where: { isPublished: true } }),
      db.lineAttempt.count(),
      db.storyProgress.count({ where: { completed: true } }),
      db.lineAttempt.aggregate({ _avg: { score: true } }),
      db.lineAttempt.groupBy({ by: ["passed"], _count: { passed: true } }),
      db.storyProgress.groupBy({
        by: ["storyId"],
        _count: { storyId: true },
        orderBy: { _count: { storyId: "desc" } },
        take: 5,
      }),
    ]);

    const storyIds = topStories.map((s) => s.storyId);
    const storiesData = await db.story.findMany({
      where: { id: { in: storyIds } },
      select: { id: true, title: true },
    });

    return { totalUsers, totalStories, totalAttempts, completedStories, avgAccuracy, passRate, topStories, storiesData };
  },
  ["admin-analytics-counts"],
  { revalidate: 120 }
);
