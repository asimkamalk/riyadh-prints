export type JsonLdNode = Record<string, unknown>;

export function sanitizeSchemaString(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === "string" && value.length === 0) {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}

export function compactJsonLd<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeSchemaString(value) as T;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => compactJsonLd(item))
      .filter((item) => !isEmpty(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      const compacted = compactJsonLd(nested);
      if (isEmpty(compacted)) {
        continue;
      }
      out[key] = compacted;
    }
    return out as T;
  }
  return value;
}
