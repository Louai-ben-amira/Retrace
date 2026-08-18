import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-6 w-16 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <Skeleton className="h-11 w-full rounded-lg mb-6" />

      <div className="bg-ink-surface rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="divide-y divide-white/[0.06]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
