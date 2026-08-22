import Link from "next/link";
import type { ReactNode } from "react";

import { asRecord, asString } from "@/lib/sections/parse";

type TiptapNode = {
  type?: unknown;
  text?: unknown;
  marks?: unknown;
  content?: unknown;
  attrs?: unknown;
};

function marksOf(node: TiptapNode): string[] {
  if (!Array.isArray(node.marks)) {
    return [];
  }
  return node.marks
    .map((mark) => (mark && typeof mark === "object" ? asString(asRecord(mark).type) : ""))
    .filter(Boolean);
}

function hrefOf(node: TiptapNode): string | null {
  if (!Array.isArray(node.marks)) {
    return null;
  }
  for (const mark of node.marks) {
    const record = asRecord(mark);
    if (asString(record.type) !== "link") {
      continue;
    }
    const href = asString(asRecord(record.attrs).href);
    if (href.startsWith("/") && !href.startsWith("//")) {
      return href;
    }
    try {
      const url = new URL(href);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.toString();
      }
    } catch {
      return null;
    }
  }
  return null;
}

function wrapMarks(node: TiptapNode, children: ReactNode): ReactNode {
  const marks = marksOf(node);
  let tree = children;
  if (marks.includes("bold") || marks.includes("strong")) {
    tree = <strong>{tree}</strong>;
  }
  if (marks.includes("italic") || marks.includes("em")) {
    tree = <em>{tree}</em>;
  }
  if (marks.includes("underline")) {
    tree = <u>{tree}</u>;
  }
  const href = hrefOf(node);
  if (href) {
    tree = (
      <Link href={href as never} className="underline">
        {tree}
      </Link>
    );
  }
  return tree;
}

function renderNodes(value: unknown, keyPrefix: string): ReactNode[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item, index) => renderNode(item, `${keyPrefix}-${index}`));
}

function renderNode(value: unknown, key: string): ReactNode[] {
  const node = asRecord(value) as TiptapNode;
  const type = asString(node.type);
  if (type === "text") {
    const text = asString(node.text);
    if (!text) {
      return [];
    }
    return [<span key={key}>{wrapMarks(node, text)}</span>];
  }
  if (type === "hardBreak") {
    return [<br key={key} />];
  }
  const children = renderNodes(node.content, key);
  if (type === "paragraph") {
    return [<p key={key}>{children}</p>];
  }
  if (type === "heading") {
    const level = Number(asRecord(node.attrs).level);
    if (level === 3) {
      return [<h3 key={key}>{children}</h3>];
    }
    if (level === 4) {
      return [<h4 key={key}>{children}</h4>];
    }
    return [<h2 key={key}>{children}</h2>];
  }
  if (type === "bulletList") {
    return [<ul key={key}>{children}</ul>];
  }
  if (type === "orderedList") {
    return [<ol key={key}>{children}</ol>];
  }
  if (type === "listItem") {
    return [<li key={key}>{children}</li>];
  }
  if (type === "blockquote") {
    return [<blockquote key={key}>{children}</blockquote>];
  }
  return children;
}

export function TiptapBody({ value }: { value: unknown }) {
  if (typeof value === "string") {
    const paragraphs = value
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);
    return (
      <>
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </>
    );
  }
  const node = asRecord(value);
  if (!Array.isArray(node.content)) {
    return null;
  }
  return <>{renderNodes(node.content, "n")}</>;
}
