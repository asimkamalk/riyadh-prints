export function GallerySkeleton({ count }: { count: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-hidden>
      {Array.from({ length: Math.max(count, 1) }, (_, index) => (
        <li key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />
      ))}
    </ul>
  );
}
