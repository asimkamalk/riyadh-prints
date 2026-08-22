"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { fileBasename } from "@/lib/media-types";
import { cn } from "@/lib/utils";
import type { AdminMediaRecord } from "@/server/queries/media";

import { MediaThumb } from "./thumb";

export function MediaGrid({
  items,
  selectedIds,
  onToggle,
  onOpen,
  selectable,
}: {
  items: readonly AdminMediaRecord[];
  selectedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onOpen: (item: AdminMediaRecord) => void;
  selectable: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No files match these filters.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {
        const selected = selectedIds.has(item.id);
        return (
          <li key={item.id} className="min-w-0">
            <div
              className={cn(
                "group relative overflow-hidden rounded-lg border",
                selected && "ring-2 ring-ring",
              )}
            >
              {selectable ? (
                <div className="absolute start-2 top-2 z-10">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggle(item.id)}
                    aria-label={`Select ${fileBasename(item.pathname)}`}
                    className="bg-background/80"
                  />
                </div>
              ) : null}
              <button
                type="button"
                className="block w-full text-start"
                onClick={() => onOpen(item)}
              >
                <MediaThumb item={item} className="aspect-square" sizes="220px" />
                <span className="block truncate px-2 py-1.5 text-xs">
                  {fileBasename(item.pathname)}
                </span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
