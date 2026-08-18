import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Reader } from "@/components/reader/Reader";
import { getAppCopy } from "@/lib/i18n/app";
import type { Metadata } from "next";

interface StoryPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await db.story.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: story?.title ?? "Story" };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [story, user] = await Promise.all([
    db.story.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        slug: true,
        title: true,
        isPublished: true,
        isPremium: true,
        lines: { orderBy: { position: "asc" } },
      },
    }),
    getCurrentUser(),
  ]);
  if (!story || !story.isPublished) notFound();

  const nativeLanguage = user?.nativeLanguage ?? "ar";

  const isPro = user?.subscription?.tier === "PRO";
  if (story.isPremium && !isPro) redirect("/settings");

  if (story.lines.length === 0) {
    const t = getAppCopy(user?.uiLanguage);
    return (
      <div className="text-center py-24 text-stone-400">
        <p className="text-lg">{t.reader.noLinesYet}</p>
      </div>
    );
  }

  const progress = user
    ? await db.storyProgress.findUnique({ where: { userId_storyId: { userId: user.id, storyId: story.id } } })
    : null;

  const startPosition = progress && !progress.completed ? progress.currentLine : 1;

  return (
    <Reader
      storyId={story.id}
      storySlug={story.slug}
      storyTitle={story.title}
      lines={story.lines}
      startPosition={startPosition}
      initialStreak={user?.streak?.current ?? 0}
      isPro={isPro}
      nativeLanguage={nativeLanguage}
    />
  );
}
