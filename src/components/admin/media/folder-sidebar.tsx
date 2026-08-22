"use client";

import { Folder, FolderPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MediaFolderSidebar({
  folders,
  active,
  onSelect,
  canCreate,
}: {
  folders: readonly string[];
  active: string;
  onSelect: (folder: string) => void;
  canCreate?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);

  function submitNew() {
    const name = draft.trim();
    if (!name) {
      return;
    }
    onSelect(name);
    setDraft("");
    setCreating(false);
  }

  return (
    <nav aria-label="Folders" className="grid gap-1">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm",
          active === "" ? "bg-accent text-accent-foreground" : "hover:bg-muted",
        )}
      >
        <Folder className="size-4 shrink-0" />
        All files
      </button>
      {folders.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm",
            active === name ? "bg-accent text-accent-foreground" : "hover:bg-muted",
          )}
        >
          <Folder className="size-4 shrink-0" />
          <span className="truncate">{name}</span>
        </button>
      ))}
      {canCreate ? (
        creating ? (
          <div className="grid gap-1 pt-1">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitNew();
                }
              }}
              placeholder="New folder"
              aria-label="New folder name"
              autoFocus
            />
            <div className="flex gap-1">
              <Button type="button" size="xs" onClick={submitNew}>
                Open
              </Button>
              <Button type="button" size="xs" variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => setCreating(true)}
          >
            <FolderPlus className="size-4" />
            New folder
          </Button>
        )
      ) : null}
    </nav>
  );
}
