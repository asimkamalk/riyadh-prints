import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  getSiteUrl,
  OG_LOCALE,
  SITE_NAME,
  TITLE_TEMPLATE,
  TWITTER_HANDLE,
  absoluteUrl,
} from "@/lib/seo/config";
import type { SeoDto } from "@/types/content";

const FORCE_NOINDEX_PATHS = new Set(["/search", "/wishlist", "/compare"]);

export type MetadataInput = {
  title?: string | null;
  description?: string | null;
  derivedTitle?: string | null;
  derivedDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  path: string;
  locale: Locale;
  ogImage?: string | null;
  type?: "website" | "article" | "product" | "profile";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  canonicalOverride?: string | null;
  alternateSlug?: string | null;
  alternatePath?: string | null;
  page?: number;
  thinContent?: boolean;
};

export function normalizePath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

export function truncateDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) {
    return cleaned;
  }
  const sliced = cleaned.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > Math.floor(max * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return cut.replace(/[\s.,;:!?-]+$/u, "").trim();
}

export function firstText(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.replace(/\s+/g, " ").trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return "";
}

export function formatTitle(pageTitle: string): string {
  const trimmed = pageTitle.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed === SITE_NAME) {
    return SITE_NAME;
  }
  if (trimmed.includes(SITE_NAME)) {
    return trimmed;
  }
  return TITLE_TEMPLATE.replace("%s", trimmed);
}

function replaceLeaf(path: string, slug: string): string {
  const parts = normalizePath(path).split("/").filter(Boolean);
  if (parts.length === 0) {
    return `/${slug}`;
  }
  parts[parts.length - 1] = slug.replace(/^\/+|\/+$/g, "");
  return `/${parts.join("/")}`;
}

function otherLocalePath(input: MetadataInput, currentPath: string): string {
  if (input.alternatePath) {
    return normalizePath(input.alternatePath);
  }
  if (input.alternateSlug) {
    return replaceLeaf(currentPath, input.alternateSlug);
  }
  return currentPath;
}

export function shouldNoIndex(input: {
  path: string;
  noIndex?: boolean;
  page?: number;
  thinContent?: boolean;
}): boolean {
  if (input.noIndex) {
    return true;
  }
  const path = normalizePath(input.path);
  if (FORCE_NOINDEX_PATHS.has(path)) {
    return true;
  }
  for (const prefix of FORCE_NOINDEX_PATHS) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return true;
    }
  }
  const page = input.page ?? 1;
  return page > 1 && input.thinContent !== false;
}

export function localePairPaths(
  locale: Locale,
  prefix: string,
  slugs: { en: string; ar: string },
): { path: string; alternatePath: string } {
  const other = locale === "en" ? "ar" : "en";
  const base = normalizePath(prefix);
  const join = (slug: string) => (base === "/" ? `/${slug}` : `${base}/${slug}`);
  return {
    path: join(slugs[locale]),
    alternatePath: join(slugs[other]),
  };
}

export function homeCrumb(locale: Locale): { href: string; label: string } {
  return {
    href: withLocalePath(locale, "/"),
    label: locale === "ar" ? "الرئيسية" : "Home",
  };
}

export function rootLayoutMetadata(): Metadata {
  return {
    metadataBase: new URL(`${getSiteUrl()}/`),
    title: {
      default: SITE_NAME,
      template: TITLE_TEMPLATE,
    },
    description: DEFAULT_DESCRIPTION,
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
    },
  };
}

export function buildMetadata(input: MetadataInput): Metadata {
  const path = normalizePath(input.path);
  const title = formatTitle(firstText(input.title, input.derivedTitle, SITE_NAME));
  const description = truncateDescription(
    firstText(input.description, input.derivedDescription, DEFAULT_DESCRIPTION),
  );
  const ogTitle = formatTitle(firstText(input.ogTitle, title));
  const ogDescription = truncateDescription(firstText(input.ogDescription, description));
  const ogImage = firstText(input.ogImage, DEFAULT_OG_IMAGE);
  const noIndex = shouldNoIndex(input);
  const canonical = input.canonicalOverride
    ? absoluteUrl(input.canonicalOverride)
    : absoluteUrl(withLocalePath(input.locale, path));
  const otherPath = otherLocalePath(input, path);
  const enPath = input.locale === "en" ? path : otherPath;
  const arPath = input.locale === "ar" ? path : otherPath;
  const languages =
    path === "/admin" || path.startsWith("/admin/")
      ? { en: canonical, ar: canonical, "x-default": canonical }
      : {
          en: absoluteUrl(withLocalePath("en", enPath)),
          ar: absoluteUrl(withLocalePath("ar", arPath)),
          "x-default": absoluteUrl(withLocalePath("en", enPath)),
        };
  const ogType = input.type === "article" || input.type === "profile" ? input.type : "website";
  const images = [{ url: absoluteUrl(ogImage) }];

  return {
    metadataBase: new URL(`${getSiteUrl()}/`),
    title: { absolute: title },
    description,
    robots: {
      index: !noIndex,
      follow: !input.noFollow,
      googleBot: {
        index: !noIndex,
        follow: !input.noFollow,
      },
    },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: ogType,
      locale: OG_LOCALE[input.locale],
      alternateLocale: input.locale === "ar" ? ["en_US"] : ["ar_SA"],
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images,
      ...(ogType === "article"
        ? {
            publishedTime: input.publishedTime || undefined,
            modifiedTime: input.modifiedTime || input.publishedTime || undefined,
            authors: input.authors?.length ? input.authors : undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      title: ogTitle,
      description: ogDescription,
      images: [absoluteUrl(ogImage)],
    },
    authors: input.authors?.map((name) => ({ name })),
  };
}

export function contentMetadata(input: {
  locale: Locale;
  path: string;
  alternatePath?: string | null;
  alternateSlug?: string | null;
  seo: SeoDto;
  derivedTitle: string;
  derivedDescription?: string | null;
  ogImage?: string | null;
  type?: MetadataInput["type"];
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  noIndex?: boolean;
  page?: number;
  thinContent?: boolean;
}): Metadata {
  return buildMetadata({
    locale: input.locale,
    path: input.path,
    alternatePath: input.alternatePath,
    alternateSlug: input.alternateSlug,
    title: input.seo.metaTitle,
    derivedTitle: input.derivedTitle,
    description: input.seo.metaDescription,
    derivedDescription: input.derivedDescription,
    ogTitle: input.seo.ogTitle,
    ogDescription: input.seo.ogDescription,
    ogImage: input.ogImage,
    type: input.type,
    publishedTime: input.publishedTime,
    modifiedTime: input.modifiedTime,
    authors: input.authors,
    noIndex: Boolean(input.noIndex || input.seo.noIndex),
    noFollow: input.seo.noFollow,
    canonicalOverride: input.seo.canonicalUrl,
    page: input.page,
    thinContent: input.thinContent,
  });
}
