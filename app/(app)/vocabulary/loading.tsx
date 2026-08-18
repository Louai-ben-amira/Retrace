import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="flex flex-wrap gap-2 mb-9">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
