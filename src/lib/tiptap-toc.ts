import slugify from "slugify";

import { asRecord, asString } from "@/lib/sections/parse";
import { tiptapToPlainText } from "@/lib/tiptap-text";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function headingSlug(text: string): string {
  const slug = slugify(text, { lower: true, strict: true });
  return slug || "section";
}

export function uniqueHeadingId(text: string, used: Map<string, number>): string {
  const base = headingSlug(text);
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

export function tiptapToc(value: unknown): TocItem[] {
  const node = asRecord(value);
  const content = Array.isArray(node.content) ? node.content : [];
  const used = new Map<string, number>();
  const items: TocItem[] = [];
  for (const child of content) {
    const record = asRecord(child);
    if (asString(record.type) !== "heading") {
      continue;
    }
    const level = Number(asRecord(record.attrs).level);
    if (level !== 2 && level !== 3) {
      continue;
    }
    const text = tiptapToPlainText(child);
    if (!text) {
      continue;
    }
    items.push({
      id: uniqueHeadingId(text, used),
      text,
      level,
    });
  }
  return items;
}
