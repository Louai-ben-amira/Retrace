import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { formatDate, difficultyLabel, difficultyColor } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My progress" };

export default async function ProgressPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [progress, lineAttemptsCount] = await Promise.all([
    db.storyProgress.findMany({ where: { userId: user.id }, include: { story: true }, orderBy: { updatedAt: "desc" } }),
    db.lineAttempt.count({ where: { userId: user.id } }),
  ]);

  const completedCount = progress.filter((p) => p.completed).length;
  const inProgressCount = progress.filter((p) => !p.completed && p.completedLines > 0).length;

  return (
    <div>
      <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream mb-8 animate-fade-up">My progress</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Day streak",        value: `🔥 ${user.streak?.current ?? 0}` },
          { label: "Best streak",       value: `${user.streak?.longest ?? 0} days` },
          { label: "Stories completed", value: completedCount },
          { label: "Lines typed",       value: lineAttemptsCount.toLocaleString() },
        ].map((stat, i) => (
          <Card key={stat.label} padding="md" className="animate-fade-up hover:border-brand-500/25" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-xs text-cream/40 mb-1">{stat.label}</p>
            <p className="font-serif text-2xl font-bold text-cream">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* In progress */}
      {inProgressCount > 0 && (
        <div className="mb-8 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h2 className="text-base font-semibold text-cream/70 mb-4">In progress</h2>
          <div className="space-y-3">
            {progress.filter((p) => !p.completed && p.completedLines > 0).map((p) => {
              const pct = Math.round((p.completedLines / p.totalLines) * 100);
              return (
                <Link key={p.id} href={`/story/${p.storyId}`} className="block bg-ink-surface border border-white/[0.07] rounded-xl p-5 hover:border-brand-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-cream">{p.story.title}</span>
                    <Badge variant={p.story.difficulty === "BEGINNER" ? "brand" : p.story.difficulty === "INTERMEDIATE" ? "amber" : "rose"}>
                      {difficultyLabel(p.story.difficulty)}
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-cream/40">{pct}% · last studied {formatDate(p.updatedAt)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedCount > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: "220ms" }}>
          <h2 className="text-base font-semibold text-cream/70 mb-4">Completed</h2>
          <div className="space-y-2">
            {progress.filter((p) => p.completed).map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-ink-surface border border-white/[0.07] rounded-xl px-5 py-4">
                <div>
                  <span className="font-medium text-cream">{p.story.title}</span>
                  <p className="text-xs text-cream/40 mt-0.5">Completed {p.completedAt ? formatDate(p.completedAt) : "—"}</p>
                </div>
                <div className="text-right">
                  {p.score && <p className="text-sm font-semibold text-brand-400">{Math.round(p.score)}%</p>}
                  <Badge variant="brand">✓ Done</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.length === 0 && (
        <div className="text-center py-24 text-cream/40 animate-fade-up">
          <p className="text-lg mb-3">No stories started yet.</p>
          <Link href="/library" className="text-brand-400 hover:underline text-sm">Browse the library →</Link>
        </div>
      )}
    </div>
  );
}
