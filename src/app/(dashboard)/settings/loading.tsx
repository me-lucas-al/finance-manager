import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full max-w-2xl" />
        <Skeleton className="h-[200px] w-full max-w-2xl" />
      </div>
    </div>
  );
}
