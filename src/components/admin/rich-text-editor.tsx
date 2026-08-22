"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { useState } from "react";

import { MediaPicker } from "@/components/admin/media-picker";
import { LinkDialog, YoutubeDialog } from "@/components/admin/rich-text-dialogs";
import { createRichTextExtensions } from "@/components/admin/rich-text-extensions";
import { RichTextToolbar } from "@/components/admin/rich-text-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type RichTextEditorProps = {
  value: JSONContent | null;
  onChange: (value: JSONContent) => void;
  editable?: boolean;
};

export function RichTextEditor({ value, onChange, editable = true }: RichTextEditorProps) {
  const [rtl, setRtl] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable,
    extensions: createRichTextExtensions(),
    content: value ?? { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-48 px-3 py-2 focus:outline-none [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold [&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_table]:w-full [&_td]:border [&_th]:border [&_td]:p-2 [&_th]:p-2",
      },
    },
  });

  if (!editor) {
    return <Skeleton className="h-64 w-full" />;
  }

  const characters = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();
  const minutes = Math.max(1, Math.ceil(words / 200));

  return (
    <div className={cn("overflow-hidden rounded-lg border", rtl && "font-arabic")}>
      <RichTextToolbar
        editor={editor}
        rtl={rtl}
        onRtlChange={setRtl}
        onLink={() => setLinkOpen(true)}
        onImage={() => setMediaOpen(true)}
        onYoutube={() => setYoutubeOpen(true)}
      />
      <div dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : "en"}>
        <EditorContent editor={editor} />
      </div>
      <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">
        {characters} characters · {words} words · ~{minutes} min read
      </p>
      <LinkDialog editor={editor} open={linkOpen} onOpenChange={setLinkOpen} />
      <YoutubeDialog editor={editor} open={youtubeOpen} onOpenChange={setYoutubeOpen} />
      <MediaPicker
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={(item) => {
          editor.chain().focus().setImage({ src: item.url, alt: item.altEn }).run();
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
