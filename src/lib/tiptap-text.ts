export function tiptapToPlainText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (!value || typeof value !== "object") {
    return "";
  }
  const node = value as { text?: unknown; content?: unknown[] };
  const parts: string[] = [];
  if (typeof node.text === "string") {
    parts.push(node.text);
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const text = tiptapToPlainText(child);
      if (text) {
        parts.push(text);
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function plainTextToTiptap(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: trimmed ? [{ type: "text", text: trimmed }] : [],
      },
    ],
  };
}
