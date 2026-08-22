import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/utils/site-url";

export function adminPageMetadata(
  title: string,
  path: string,
  description?: string,
): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description: description ?? `${title} — Riyadh Prints admin.`,
    robots: { index: false, follow: false },
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ar: canonical,
        "x-default": canonical,
      },
    },
  };
}
