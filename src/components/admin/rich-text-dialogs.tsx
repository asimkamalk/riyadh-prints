"use client";

import type { Editor } from "@tiptap/react";
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
import { Switch } from "@/components/ui/switch";

export function LinkDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const previous = editor.getAttributes("link");
  const [href, setHref] = useState(typeof previous.href === "string" ? previous.href : "");
  const [blank, setBlank] = useState(previous.target === "_blank");
  const [nofollow, setNofollow] = useState(
    typeof previous.rel === "string" && previous.rel.includes("nofollow"),
  );

  function apply() {
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onOpenChange(false);
      return;
    }
    const relParts = ["noopener"];
    if (nofollow) {
      relParts.push("nofollow");
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: href.trim(),
        target: blank ? "_blank" : "_self",
        rel: relParts.join(" "),
      })
      .run();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="link-href">URL</Label>
            <Input id="link-href" value={href} onChange={(event) => setHref(event.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={blank} onCheckedChange={setBlank} />
            Open in new tab
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={nofollow} onCheckedChange={setNofollow} />
            rel=nofollow
          </label>
        </div>
        <DialogFooter>
          <Button type="button" onClick={apply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function YoutubeDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [url, setUrl] = useState("");

  function apply() {
    if (url.trim()) {
      editor.commands.setYoutubeVideo({ src: url.trim() });
    }
    onOpenChange(false);
    setUrl("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>YouTube embed</DialogTitle>
        </DialogHeader>
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
        <DialogFooter>
          <Button type="button" onClick={apply}>
            Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
