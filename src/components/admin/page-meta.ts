import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export function adminPageMetadata(
  title: string,
  path: string,
  description?: string,
): Metadata {
  return buildMetadata({
    locale: "en",
    path,
    title,
    description: description ?? `${title} — Riyadh Prints admin.`,
    noIndex: true,
    noFollow: true,
  });
}
