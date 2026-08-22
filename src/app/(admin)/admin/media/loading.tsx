import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMediaLoading() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
      <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <Skeleton className="h-72 rounded-lg" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
