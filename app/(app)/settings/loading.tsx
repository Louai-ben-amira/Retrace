import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-7 w-36 mb-8" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl mb-6" />
      ))}
    </div>
  );
}
