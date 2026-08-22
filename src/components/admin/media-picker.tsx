"use client";

import { useEffect, useRef, useState } from "react";

import { MediaDropzone } from "@/components/admin/media/dropzone";
import { MediaFolderSidebar } from "@/components/admin/media/folder-sidebar";
import { MediaGrid } from "@/components/admin/media/grid";
import { MediaUploadQueue } from "@/components/admin/media/upload-queue";
import { useMediaUploads } from "@/components/admin/media/use-media-uploads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DEFAULT_MEDIA_FOLDER } from "@/lib/media-types";
import { listAdminMediaFolders, searchAdminMedia } from "@/server/actions/admin";
import type { AdminMediaRecord } from "@/server/queries/media";

export type MediaPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: AdminMediaRecord) => void;
  selectedId?: string | null;
  allowUpload?: boolean;
};

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  allowUpload = true,
}: MediaPickerProps) {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [items, setItems] = useState<AdminMediaRecord[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { jobs, uploadFiles } = useMediaUploads(() => {
    void load();
  });

  async function load() {
    const [media, folderList] = await Promise.all([
      searchAdminMedia({
        query,
        folder: folder || undefined,
        page: 1,
        perPage: 48,
      }),
      listAdminMediaFolders({}),
    ]);
    if (media.ok) {
      setItems(media.data.items);
    }
    if (folderList.ok) {
      setFolders(folderList.data);
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    void load();
    // Intentionally refetch when the dialog opens or filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, folder]);

  function choose(item: AdminMediaRecord) {
    onSelect(item);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>Search or upload an image, then select it.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
          <MediaFolderSidebar folders={folders} active={folder} onSelect={setFolder} canCreate={allowUpload} />
          <div className="grid min-w-0 gap-3">
            <div className="flex flex-wrap gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search filename or alt…"
                className="max-w-sm"
              />
              {allowUpload ? (
                <Button type="button" size="sm" onClick={() => fileRef.current?.click()}>
                  Upload
                </Button>
              ) : null}
            </div>
            {allowUpload ? (
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                multiple
                className="sr-only"
                onChange={(event) => {
                  const files = event.target.files ? [...event.target.files] : [];
                  event.target.value = "";
                  if (files.length) {
                    void uploadFiles(files, folder || DEFAULT_MEDIA_FOLDER);
                  }
                }}
              />
            ) : null}
            <MediaUploadQueue jobs={jobs} />
            <MediaDropzone
              disabled={!allowUpload}
              onFiles={(files) => void uploadFiles(files, folder || DEFAULT_MEDIA_FOLDER)}
            >
              <ScrollArea className="h-80">
                <MediaGrid
                  items={items}
                  selectedIds={new Set(selectedId ? [selectedId] : [])}
                  onToggle={(id) => {
                    const item = items.find((row) => row.id === id);
                    if (item) choose(item);
                  }}
                  onOpen={choose}
                  selectable={false}
                />
              </ScrollArea>
            </MediaDropzone>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
