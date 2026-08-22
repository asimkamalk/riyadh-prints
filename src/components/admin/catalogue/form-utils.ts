import type { SeoValues } from "@/components/admin/seo-panel";
import type { AdminLocaleSeo } from "@/server/queries/admin-products";

export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function seoToForm(
  seo: AdminLocaleSeo,
  pageTitle: string,
  pageUrl: string,
): SeoValues {
  return {
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    canonicalUrl: seo.canonicalUrl,
    noIndex: seo.noIndex,
    noFollow: seo.noFollow,
    focusKeyword: seo.focusKeyword,
    pageTitle,
    pageUrl,
  };
}

export function emptySeoForm(pageTitle: string, pageUrl: string): SeoValues {
  return {
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
    focusKeyword: "",
    pageTitle,
    pageUrl,
  };
}

export function seoToPayload(seo: SeoValues) {
  return {
    metaTitle: seo.metaTitle || undefined,
    metaDescription: seo.metaDescription || undefined,
    ogTitle: seo.ogTitle || undefined,
    ogDescription: seo.ogDescription || undefined,
    canonicalUrl: seo.canonicalUrl.trim() || undefined,
    noIndex: seo.noIndex,
    noFollow: seo.noFollow,
    focusKeyword: seo.focusKeyword || undefined,
  };
}

export function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const n = Number(trimmed);
  return Number.isInteger(n) ? n : null;
}
