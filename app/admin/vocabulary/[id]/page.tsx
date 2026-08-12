import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { VocabGroupEditForm } from "@/components/admin/VocabGroupEditForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit vocabulary group — Admin" };

export default async function EditVocabGroupPage({ params }: { params: { id: string } }) {
  const group = await db.vocabGroup.findUnique({
    where: { id: params.id },
    include: { words: { orderBy: { position: "asc" } } },
  });
  if (!group) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-xl font-bold text-cream">Edit: {group.name}</h1>
        <p className="text-sm text-cream/40 mt-0.5">{group.words.length} words</p>
      </div>
      <VocabGroupEditForm group={group} />
    </div>
  );
}
