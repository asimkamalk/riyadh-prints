import type { JsonLdNode } from "@/lib/seo/compact";

function escapeJsonLd(json: string): string {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function toPayload(data: JsonLdNode | Array<JsonLdNode | null | undefined>): JsonLdNode {
  if (!Array.isArray(data)) {
    return data;
  }
  return {
    "@context": "https://schema.org",
    "@graph": data.filter((node): node is JsonLdNode => Boolean(node)).map((node) => {
      const { "@context": _context, ...rest } = node;
      return rest;
    }),
  };
}

export function JsonLd({
  data,
}: {
  data: JsonLdNode | Array<JsonLdNode | null | undefined> | null | undefined;
}) {
  if (!data || (Array.isArray(data) && data.filter(Boolean).length === 0)) {
    return null;
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: escapeJsonLd(JSON.stringify(toPayload(data))),
      }}
    />
  );
}
