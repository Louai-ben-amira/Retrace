import { StoryForm } from "@/components/admin/StoryForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New story — Admin" };

export default function NewStoryPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-xl font-bold text-cream">New story</h1>
        <p className="text-sm text-cream/40 mt-0.5">Create manually or generate with AI.</p>
      </div>
      <StoryForm />
    </div>
  );
}
