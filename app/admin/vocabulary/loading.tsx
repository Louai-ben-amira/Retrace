import { Skeleton } from "@/components/ui/Skeleton";

// Mirrors the eight-column vocab-groups table in page.tsx so the swap to real content
// doesn't shift the layout.
export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-6 w-44 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      <div className="bg-ink-surface rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="border-b border-white/[0.07] bg-white/[0.02] px-5 py-3">
          <Skeleton className="h-3 w-full max-w-lg" />
        </div>
        <div className="divide-y divide-white/[0.06]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-6">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
