import { locales, type Locale } from "@/i18n/locales";

export const SITE_NAME = "Riyadh Prints";
export const TITLE_TEMPLATE = "%s | Riyadh Prints";
export const DEFAULT_DESCRIPTION =
  "Same-day printing in Riyadh — apparel, packaging, banners, and stationery.";
export const DEFAULT_OG_IMAGE = "/og-default.jpg";
export const TWITTER_HANDLE = "@riyadhprintss";
export const PRICE_RANGE = "$$";
export const AREA_SERVED_CITY = "Riyadh";
export const AREA_SERVED_COUNTRY = "SA";
export const SEO_LOCALES = locales;
export const HREFLANG_BY_LOCALE = { en: "en", ar: "ar" } as const;
export const HREFLANG_DEFAULT = "x-default" as const;
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ar: "ar_SA",
};

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function organizationId(): string {
  return `${getSiteUrl()}/#organization`;
}

export function localBusinessId(): string {
  return `${getSiteUrl()}/#localbusiness`;
}

export function websiteId(): string {
  return `${getSiteUrl()}/#website`;
}
