import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function DashboardPanelSkeleton({ className }: { className?: string }) {
  return <Skeleton className={className ?? "h-72 rounded-xl"} />;
}

export function AdminPageSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
      <DashboardStatsSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanelSkeleton />
        <DashboardPanelSkeleton />
      </div>
    </div>
  );
}
