import { VocabGroupForm } from "@/components/admin/VocabGroupForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New vocabulary group — Admin" };

export default function NewVocabGroupPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-xl font-bold text-cream">New vocabulary group</h1>
        <p className="text-sm text-cream/40 mt-0.5">Fill in the details, then generate the word list with AI.</p>
      </div>
      <VocabGroupForm />
    </div>
  );
}
