"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MediaBulkBar({
  count,
  folders,
  onClear,
  onDelete,
  onMove,
}: {
  count: number;
  folders: readonly string[];
  onClear: () => void;
  onDelete: () => void;
  onMove: (folder: string) => void;
}) {
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [folder, setFolder] = useState(folders[0] ?? "uploads");
  const [custom, setCustom] = useState("");

  if (count === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
      <span className="text-sm">{count} selected</span>
      <Button type="button" size="sm" variant="outline" onClick={() => setMoveOpen(true)}>
        Move to folder
      </Button>
      <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
        Delete
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onClear}>
        Clear
      </Button>

      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move {count} file{count === 1 ? "" : "s"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Label htmlFor="media-move-folder">Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger id="media-move-folder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folders.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              placeholder="Or type a new folder name"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMoveOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onMove(custom.trim() || folder);
                setMoveOpen(false);
                setCustom("");
              }}
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} file{count === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Files that are still used on the site will be skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete();
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
