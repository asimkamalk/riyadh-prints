"use client";

import { useState } from "react";

import { MediaPicker } from "@/components/admin/media-picker";
import { MediaThumb } from "@/components/admin/media/thumb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fileBasename } from "@/lib/media-types";
import type { AdminMediaRecord } from "@/server/queries/media";

export function MediaField({
  value,
  onChange,
  label = "Image",
  disabled,
}: {
  value: AdminMediaRecord | null;
  onChange: (media: AdminMediaRecord | null) => void;
  label?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border p-2">
          {value.url ? (
            <MediaThumb item={value} className="size-16 shrink-0 rounded-md" sizes="64px" />
          ) : (
            <div className="size-16 shrink-0 rounded-md bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileBasename(value.pathname)}</p>
            <p className="truncate text-xs text-muted-foreground">{value.altEn || value.mimeType}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
              Change
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => onChange(null)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
          Choose image
        </Button>
      )}
      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        selectedId={value?.id}
        allowUpload={!disabled}
        onSelect={(item) => {
          onChange(item);
          setOpen(false);
        }}
      />
    </div>
  );
}
