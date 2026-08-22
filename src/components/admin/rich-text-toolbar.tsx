"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Play,
  Quote,
  Table as TableIcon,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextToolbarProps = {
  editor: Editor;
  rtl: boolean;
  onRtlChange: (rtl: boolean) => void;
  onLink: () => void;
  onImage: () => void;
  onYoutube: () => void;
};

export function RichTextToolbar({
  editor,
  rtl,
  onRtlChange,
  onLink,
  onImage,
  onYoutube,
}: RichTextToolbarProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b p-1">
      <MarkButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </MarkButton>
      <MarkButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </MarkButton>
      <MarkButton
        label="Heading 4"
        active={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 />
      </MarkButton>
      <MarkButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </MarkButton>
      <MarkButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </MarkButton>
      <MarkButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </MarkButton>
      <MarkButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </MarkButton>
      <MarkButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </MarkButton>
      <MarkButton label="Link" active={editor.isActive("link")} onClick={onLink}>
        <Link2 />
      </MarkButton>
      <MarkButton label="Image" onClick={onImage}>
        <ImageIcon />
      </MarkButton>
      <MarkButton
        label="Table"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon />
      </MarkButton>
      <MarkButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote />
      </MarkButton>
      <MarkButton
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code />
      </MarkButton>
      <MarkButton label="YouTube" onClick={onYoutube}>
        <Play />
      </MarkButton>
      <MarkButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus />
      </MarkButton>
      <MarkButton label="Right-to-left" active={rtl} onClick={() => onRtlChange(!rtl)}>
        RTL
      </MarkButton>
    </div>
  );
}

function MarkButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-xs"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      className={cn("min-w-6", typeof children === "string" && "w-auto px-1.5 text-[10px]")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
