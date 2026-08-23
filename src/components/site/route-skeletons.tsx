import { Skeleton } from "@/components/ui/skeleton";

export function CatalogListingSkeleton() {
  return (
    <div className="container-page py-xl">
      <Skeleton className="mb-8 h-5 w-48" />
      <Skeleton className="mb-3 h-10 w-64" />
      <Skeleton className="mb-10 h-5 w-full max-w-xl" />
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
        <div className="grid gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailSplitSkeleton() {
  return (
    <div className="container-page py-xl">
      <Skeleton className="mb-8 h-5 w-56" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="grid gap-4 self-start">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-4 h-10 w-40" />
        </div>
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="container-page py-xl">
      <Skeleton className="mb-8 h-5 w-56" />
      <Skeleton className="mb-6 aspect-[21/9] w-full rounded-xl" />
      <Skeleton className="mb-4 h-10 w-3/4" />
      <Skeleton className="mb-8 h-5 w-1/2" />
      <div className="grid gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="container-page py-xl">
      <Skeleton className="mb-8 h-5 w-48" />
      <Skeleton className="mb-3 h-10 w-72" />
      <Skeleton className="mb-8 h-5 w-full max-w-xl" />
      <div className="grid max-w-xl gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export function HeroListingSkeleton() {
  return (
    <div className="container-page py-xl">
      <Skeleton className="mb-8 h-5 w-48" />
      <Skeleton className="mb-8 aspect-[21/9] w-full rounded-xl" />
      <Skeleton className="mb-3 h-10 w-72" />
      <Skeleton className="mb-10 h-5 w-full max-w-xl" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="aspect-[16/10] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
