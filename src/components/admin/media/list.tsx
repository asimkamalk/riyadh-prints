"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fileBasename, formatBytes } from "@/lib/media-types";
import type { AdminMediaRecord } from "@/server/queries/media";

import { MediaThumb } from "./thumb";

export function MediaList({
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
    <Table>
      <TableHeader>
        <TableRow>
          {selectable ? <TableHead className="w-10"> </TableHead> : null}
          <TableHead className="w-16">Preview</TableHead>
          <TableHead>File</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Added</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer"
            onClick={() => onOpen(item)}
          >
            {selectable ? (
              <TableCell
                onClick={(event) => event.stopPropagation()}
                className="w-10"
              >
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                  aria-label={`Select ${fileBasename(item.pathname)}`}
                />
              </TableCell>
            ) : null}
            <TableCell>
              <MediaThumb item={item} className="size-12 rounded-md" sizes="48px" />
            </TableCell>
            <TableCell className="max-w-56 truncate font-medium">
              {fileBasename(item.pathname)}
            </TableCell>
            <TableCell className="text-muted-foreground">{item.mimeType}</TableCell>
            <TableCell className="text-muted-foreground">{formatBytes(item.sizeBytes)}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                new Date(item.createdAt),
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
