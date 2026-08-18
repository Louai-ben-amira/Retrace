import { Skeleton } from "@/components/ui/Skeleton";

// Onboarding does a requireUser() lookup and a cookie read before first paint, and it is
// the very first screen after signup — the one place a blank frame reads worst. Mirrors
// OnboardingFlow's centred card and language grid.
export default function Loading() {
  return (
    <div className="grain relative min-h-[100svh] bg-gradient-to-b from-ink via-ink to-ink-raised flex items-center justify-center px-4 py-10 sm:py-16 overflow-hidden">
      <div className="relative w-full max-w-2xl">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Skeleton className="h-1.5 w-8 rounded-full" />
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-ink-surface p-5 xs:p-8 sm:p-10">
          <div className="flex flex-col items-center gap-3 mb-8">
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[76px] rounded-xl" />
            ))}
          </div>

          <div className="flex items-center justify-end mt-8 sm:mt-10">
            <Skeleton className="h-11 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
