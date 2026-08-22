"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import type { AdminMediaItem } from "@/server/queries/admin";
import { listAdminMediaFolders, searchAdminMedia } from "@/server/actions/admin";
import { updateMedia } from "@/server/actions/media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type MediaPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: AdminMediaItem) => void;
};

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [items, setItems] = useState<AdminMediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    startTransition(async () => {
      const [media, folderList] = await Promise.all([
        searchAdminMedia({
          query,
          folder: folder === "all" ? undefined : folder,
        }),
        listAdminMediaFolders({}),
      ]);
      if (media.ok) {
        setItems(media.data);
      }
      if (folderList.ok) {
        setFolders(folderList.data);
      }
    });
  }, [folder, open, query]);

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) {
      toast.error("File upload requires Blob storage. Select an existing file for now.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>Search, filter, and pick an image.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search media…"
            className="max-w-sm"
          />
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger className="w-40" aria-label="Folder">
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All folders</SelectItem>
              {folders.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground",
            dragging && "border-primary bg-primary/5",
          )}
        >
          Drag and drop files to upload
        </div>
        <ScrollArea className="h-80">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pending && items.length === 0 ? (
              <li className="text-sm text-muted-foreground">Loading…</li>
            ) : null}
            {items.map((item) => (
              <MediaCard key={item.id} item={item} onSelect={onSelect} />
            ))}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function MediaCard({
  item,
  onSelect,
}: {
  item: AdminMediaItem;
  onSelect: (item: AdminMediaItem) => void;
}) {
  const [altEn, setAltEn] = useState(item.altEn);
  const [altAr, setAltAr] = useState(item.altAr);

  return (
    <li className="grid gap-2 rounded-md border p-2">
      <button type="button" className="bg-muted relative aspect-square overflow-hidden rounded" onClick={() => onSelect(item)}>
        <Image src={item.url} alt={item.altEn || item.pathname} fill className="object-cover" unoptimized />
      </button>
      <Label className="text-xs">Alt EN</Label>
      <Input
        value={altEn}
        onChange={(event) => setAltEn(event.target.value)}
        onBlur={() => {
          if (altEn !== item.altEn) {
            void updateMedia({ id: item.id, altEn });
          }
        }}
      />
      <Label className="text-xs">Alt AR</Label>
      <Input
        dir="rtl"
        value={altAr}
        onChange={(event) => setAltAr(event.target.value)}
        onBlur={() => {
          if (altAr !== item.altAr) {
            void updateMedia({ id: item.id, altAr });
          }
        }}
      />
      <Button type="button" size="xs" onClick={() => onSelect(item)}>
        Use
      </Button>
    </li>
  );
}
