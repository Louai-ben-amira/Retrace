import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics — Admin" };

export default async function AdminAnalyticsPage() {
  const [totalUsers, totalStories, totalAttempts, completedStories] = await Promise.all([
    db.user.count(),
    db.story.count({ where: { isPublished: true } }),
    db.lineAttempt.count(),
    db.storyProgress.count({ where: { completed: true } }),
  ]);

  const avgAccuracy = await db.lineAttempt.aggregate({ _avg: { score: true } });
  const passRate = await db.lineAttempt.groupBy({
    by: ["passed"],
    _count: { passed: true },
  });

  const passed = passRate.find((r) => r.passed)?._count.passed ?? 0;
  const total = passRate.reduce((s, r) => s + r._count.passed, 0);
  const passPercent = total > 0 ? Math.round((passed / total) * 100) : 0;

  const topStories = await db.storyProgress.groupBy({
    by: ["storyId"],
    _count: { storyId: true },
    orderBy: { _count: { storyId: "desc" } },
    take: 5,
  });

  const storyIds = topStories.map((s) => s.storyId);
  const storiesData = await db.story.findMany({ where: { id: { in: storyIds } } });
  const storyMap = new Map(storiesData.map((s) => [s.id, s]));

  const stats = [
    { label: "Total users",     value: totalUsers },
    { label: "Published stories", value: totalStories },
    { label: "Line attempts",   value: totalAttempts.toLocaleString() },
    { label: "Stories completed", value: completedStories },
    { label: "Avg accuracy",    value: `${Math.round((avgAccuracy._avg.score ?? 0) * 100)}%` },
    { label: "Pass rate",       value: `${passPercent}%` },
  ];

  return (
    <div>
      <h1 className="font-serif text-xl font-bold text-cream mb-8">Analytics</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md" className="hover:border-brand-500/25">
            <p className="text-sm text-cream/40 mb-1">{stat.label}</p>
            <p className="font-serif text-2xl font-bold text-cream">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card padding="md">
        <h2 className="font-semibold text-cream mb-4">Most active stories</h2>
        <div className="space-y-3">
          {topStories.map((row) => {
            const story = storyMap.get(row.storyId);
            return (
              <div key={row.storyId} className="flex items-center justify-between">
                <span className="text-sm text-cream/70">{story?.title ?? row.storyId}</span>
                <span className="text-sm font-medium text-brand-400">{row._count.storyId} learners</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
