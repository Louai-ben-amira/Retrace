import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-stretch lg:items-start">
      <div className="hidden lg:block w-64 shrink-0 space-y-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>

      <div className="flex-1 min-w-0">
        <Skeleton className="h-7 w-44 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <Skeleton className="h-20 rounded-xl mb-8" />
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
