import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-2 w-full rounded-full mb-10" />
      <div className="text-center">
        <Skeleton className="h-4 w-24 mx-auto mb-6" />
        <Skeleton className="h-8 w-full mb-3" />
        <Skeleton className="h-8 w-3/4 mx-auto mb-8" />
        <Skeleton className="h-5 w-2/3 mx-auto mb-10" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
