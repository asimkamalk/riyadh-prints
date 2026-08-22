"use client";

import { useState } from "react";

import { ReorderList } from "@/components/admin/catalogue/reorder-list";
import { MediaPicker } from "@/components/admin/media-picker";
import { MediaThumb } from "@/components/admin/media/thumb";
import { Button } from "@/components/ui/button";
import { fileBasename } from "@/lib/media-types";
import type { AdminMediaRecord } from "@/server/queries/media";

export type GalleryItem = {
  id: string;
  mediaId: string;
  isPrimary: boolean;
  media: AdminMediaRecord;
};

export function ProductMediaTab({
  images,
  onChange,
}: {
  images: GalleryItem[];
  onChange: (images: GalleryItem[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Drag to reorder. The primary image is used as the catalogue thumbnail.
        </p>
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Add images
        </Button>
      </div>
      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No gallery images yet.
        </p>
      ) : (
        <ReorderList
          items={images}
          onChange={onChange}
          renderItem={(item, handle) => (
            <div className="flex items-center gap-3 rounded-lg border p-2">
              {handle}
              <MediaThumb item={item.media} className="size-14 shrink-0 rounded-md" sizes="56px" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileBasename(item.media.pathname)}</p>
                <p className="truncate text-xs text-muted-foreground">{item.media.altEn}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={item.isPrimary ? "secondary" : "outline"}
                onClick={() =>
                  onChange(images.map((image) => ({ ...image, isPrimary: image.id === item.id })))
                }
              >
                {item.isPrimary ? "Primary" : "Set primary"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const next = images.filter((image) => image.id !== item.id);
                  if (item.isPrimary && next[0]) {
                    next[0] = { ...next[0], isPrimary: true };
                  }
                  onChange(next);
                }}
              >
                Remove
              </Button>
            </div>
          )}
        />
      )}
      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={(media) => {
          if (images.some((image) => image.mediaId === media.id)) {
            return;
          }
          onChange([
            ...images,
            {
              id: media.id,
              mediaId: media.id,
              isPrimary: images.length === 0,
              media,
            },
          ]);
        }}
      />
    </div>
  );
}
