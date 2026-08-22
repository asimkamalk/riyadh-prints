"use client";

import { Button } from "@/components/ui/button";

export function MediaPagination({
  page,
  total,
  totalPages,
  onPage,
}: {
  page: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-muted-foreground">
        {total} file{total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <span className="text-muted-foreground self-center">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
