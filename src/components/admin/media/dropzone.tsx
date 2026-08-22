"use client";

import { cn } from "@/lib/utils";

export function MediaDropzone({
  disabled,
  onFiles,
  children,
}: {
  disabled: boolean;
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
}) {
  function takeFiles(list: FileList | null) {
    if (!list || list.length === 0) {
      return;
    }
    onFiles([...list]);
  }

  return (
    <div
      className="relative"
      onDragOver={(event) => {
        if (disabled) {
          return;
        }
        event.preventDefault();
        event.currentTarget.dataset.dragging = "true";
      }}
      onDragLeave={(event) => {
        event.currentTarget.dataset.dragging = "false";
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.currentTarget.dataset.dragging = "false";
        if (!disabled) {
          takeFiles(event.dataTransfer.files);
        }
      }}
    >
      {children}
      {disabled ? null : (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 hidden items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 text-sm font-medium",
            "[[data-dragging=true]_&]:flex",
          )}
        >
          Drop files to upload
        </div>
      )}
    </div>
  );
}
