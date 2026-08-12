"use client";
import { useState } from "react";

export function PublishToggle({ storyId, published }: { storyId: string; published: boolean }) {
  const [isPublished, setIsPublished] = useState(published);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      setIsPublished((p) => !p);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-surface ${
        isPublished ? "bg-brand-500" : "bg-white/15"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          isPublished ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
