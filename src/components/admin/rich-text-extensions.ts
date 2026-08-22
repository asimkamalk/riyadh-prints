import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";

export function createRichTextExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: "noopener noreferrer" },
    }),
    Image.configure({ inline: false }),
    TableKit.configure({ table: { resizable: false } }),
    Youtube.configure({ modestBranding: true, width: 640, height: 360 }),
    Placeholder.configure({ placeholder: "Write content…" }),
    CharacterCount,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ];
}
