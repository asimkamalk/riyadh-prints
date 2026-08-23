import { unstable_cache } from "next/cache";

import type { Locale as PrismaLocale } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/locales";
import type { JsonValue, MediaDto, SeoDto } from "@/types/content";

export function toPrismaLocale(locale: Locale): PrismaLocale {
  return locale === "ar" ? "AR" : "EN";
}

export function fromPrismaLocale(locale: PrismaLocale): Locale {
  return locale === "AR" ? "ar" : "en";
}

export function translationLocales(requested: Locale): PrismaLocale[] {
  return requested === "ar" ? ["AR", "EN"] : ["EN"];
}

export const ALL_TRANSLATION_LOCALES: PrismaLocale[] = ["EN", "AR"];

export function slugsFromTranslations(
  translations: { locale: PrismaLocale; slug: string }[],
  identitySlug: string,
): { en: string; ar: string } {
  return {
    en: translations.find((row) => row.locale === "EN")?.slug ?? identitySlug,
    ar: translations.find((row) => row.locale === "AR")?.slug ?? identitySlug,
  };
}

export type PickedTranslation<T> = {
  value: T;
  servedLocale: Locale;
  isFallback: boolean;
};

export function pickTranslation<T extends { locale: PrismaLocale }>(
  rows: readonly T[],
  requested: Locale,
): PickedTranslation<T> | null {
  const want = toPrismaLocale(requested);
  const exact = rows.find((row) => row.locale === want);
  if (exact) {
    return { value: exact, servedLocale: requested, isFallback: false };
  }
  if (requested === "ar") {
    const english = rows.find((row) => row.locale === "EN");
    if (english) {
      return { value: english, servedLocale: "en", isFallback: true };
    }
  }
  return null;
}

export function cachedQuery<T>(options: {
  key: readonly string[];
  tags: readonly string[];
  revalidate?: number;
  fn: () => Promise<T>;
}): Promise<T> {
  return unstable_cache(options.fn, [...options.key], {
    tags: [...options.tags],
    ...(options.revalidate !== undefined
      ? { revalidate: options.revalidate }
      : {}),
  })();
}

export function decimalToString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && "toString" in value) {
    const text = (value as { toString: () => string }).toString();
    return text === "[object Object]" ? null : text;
  }
  return null;
}

export function toIso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

export function toJson(value: unknown): JsonValue | null {
  if (value === null || value === undefined) {
    return null;
  }
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

export function mediaSelect(locale: Locale) {
  return {
    id: true,
    url: true,
    width: true,
    height: true,
    blurDataUrl: true,
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: { locale: true, alt: true, title: true },
    },
  } as const;
}

type MediaRow = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  translations: { locale: PrismaLocale; alt: string; title: string | null }[];
};

export function mapMedia(row: MediaRow | null, locale: Locale): MediaDto | null {
  if (!row) {
    return null;
  }
  const picked = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    url: row.url,
    width: row.width,
    height: row.height,
    blurDataUrl: row.blurDataUrl,
    alt: picked?.value.alt ?? "",
    title: picked?.value.title ?? null,
    servedLocale: picked?.servedLocale ?? "en",
    isFallback: picked?.isFallback ?? locale === "ar",
  };
}

type SeoRow = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
  jsonLdOverride: unknown;
  focusKeyword: string | null;
};

export function mapSeo(row: SeoRow | null | undefined): SeoDto {
  return {
    metaTitle: row?.metaTitle ?? null,
    metaDescription: row?.metaDescription ?? null,
    ogTitle: row?.ogTitle ?? null,
    ogDescription: row?.ogDescription ?? null,
    ogImageId: row?.ogImageId ?? null,
    canonicalUrl: row?.canonicalUrl ?? null,
    noIndex: row?.noIndex ?? false,
    noFollow: row?.noFollow ?? false,
    jsonLdOverride: toJson(row?.jsonLdOverride ?? null),
    focusKeyword: row?.focusKeyword ?? null,
  };
}

export function localizeHref(locale: Locale, path: string): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("https://wa.me")
  ) {
    return path;
  }
  const normalized = (path.startsWith("/") ? path : `/${path}`).replace(
    /\/+$/,
    "",
  );
  const clean = normalized === "" ? "/" : normalized;
  if (locale === "en") {
    return clean;
  }
  if (clean === "/") {
    return "/ar";
  }
  if (clean === "/ar" || clean.startsWith("/ar/")) {
    return clean;
  }
  return `/ar${clean}`;
}

export function productHref(locale: Locale, slug: string): string {
  return localizeHref(locale, `/product/${slug}`);
}

export function categoryHref(
  locale: Locale,
  kind: string,
  slug: string,
): string {
  const path =
    kind === "POST"
      ? `/blogs/category/${slug}`
      : kind === "PORTFOLIO"
        ? `/portfolio`
        : kind === "SERVICE"
          ? `/services`
          : `/product-category/${slug}`;
  return localizeHref(locale, path);
}

export function serviceHref(locale: Locale, slug: string): string {
  return localizeHref(locale, `/services/${slug}`);
}

export function postHref(locale: Locale, slug: string): string {
  return localizeHref(locale, `/blogs/${slug}`);
}

export function projectHref(locale: Locale, slug: string): string {
  return localizeHref(locale, `/portfolio/${slug}`);
}

export function pageHref(locale: Locale, segments: string[]): string {
  const filtered = segments.filter((segment) => segment && segment !== "home");
  if (filtered.length === 0) {
    return localizeHref(locale, "/");
  }
  return localizeHref(locale, `/${filtered.join("/")}`);
}

export function authorHref(locale: Locale, slug: string): string {
  return localizeHref(locale, `/author/${slug}`);
}

export function teamMemberHref(locale: Locale, slug: string): string {
  return localizeHref(locale, `/about/${slug}`);
}

export function pagination(total: number, page: number, perPage: number) {
  const safePage = Math.max(1, page);
  const safePer = Math.max(1, perPage);
  return {
    page: safePage,
    perPage: safePer,
    total,
    totalPages: Math.max(1, Math.ceil(total / safePer)),
    skip: (safePage - 1) * safePer,
  };
}

export const seoSelect = {
  metaTitle: true,
  metaDescription: true,
  ogTitle: true,
  ogDescription: true,
  ogImageId: true,
  canonicalUrl: true,
  noIndex: true,
  noFollow: true,
  jsonLdOverride: true,
  focusKeyword: true,
} as const;

export const published = { status: "PUBLISHED" as const };
