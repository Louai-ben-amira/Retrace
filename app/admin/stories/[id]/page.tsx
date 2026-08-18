import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { StoryEditForm } from "@/components/admin/StoryEditForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit story — Admin" };

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  const story = await db.story.findUnique({
    where: { id: params.id },
    include: { lines: { orderBy: { position: "asc" } }, tags: true },
  });
  if (!story) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-xl font-bold text-cream">Edit: {story.title}</h1>
        <p className="text-sm text-cream/40 mt-0.5">{story.lines.length} lines · {story.wordCount} words</p>
      </div>
      <StoryEditForm story={story} />
    </div>
  );
}
