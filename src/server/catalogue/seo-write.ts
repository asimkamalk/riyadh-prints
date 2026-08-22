import type { localeSeoSchema } from "@/lib/validations/catalogue";
import type { z } from "zod";

type LocaleSeo = z.infer<typeof localeSeoSchema>;

export function translationSeo(seo: LocaleSeo | undefined) {
  if (!seo) {
    return {};
  }
  return {
    metaTitle: seo.metaTitle || null,
    metaDescription: seo.metaDescription || null,
    ogTitle: seo.ogTitle || null,
    ogDescription: seo.ogDescription || null,
    ogImageId: seo.ogImageId ?? null,
    canonicalUrl: seo.canonicalUrl || null,
    noIndex: seo.noIndex ?? false,
    noFollow: seo.noFollow ?? false,
    focusKeyword: seo.focusKeyword || null,
  };
}

export function parsePublishedAt(value: string | undefined): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!value.trim()) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function emptyToNull(value: string | undefined | null): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
