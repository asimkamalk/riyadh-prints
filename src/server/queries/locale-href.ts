import { headers } from "next/headers";

import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { parseSitePath } from "@/lib/site-path";
import { prisma } from "@/server/db";
import {
  authorHref,
  categoryHref,
  pageHref,
  postHref,
  productHref,
  projectHref,
  published,
  serviceHref,
  toPrismaLocale,
} from "@/server/queries/_shared";

export async function getPublicPathname(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-pathname") ?? "/";
}

function home(to: Locale): string {
  return withLocalePath(to, "/");
}

function otherSlug(
  translations: { locale: "EN" | "AR"; slug: string }[],
  to: Locale,
): string | null {
  const want = toPrismaLocale(to);
  return translations.find((row) => row.locale === want)?.slug ?? null;
}

/**
 * Equivalent path in the other locale, or that locale's home — never a guessed 404.
 */
export async function getAlternateLocaleHref(pathname: string, from: Locale): Promise<string> {
  const to: Locale = from === "en" ? "ar" : "en";
  const route = parseSitePath(pathname);

  if (route.kind === "home" || route.kind === "search") {
    return route.kind === "search" ? withLocalePath(to, "/search") : home(to);
  }

  if (route.kind === "shop") {
    return withLocalePath(to, "/shop");
  }
  if (route.kind === "services") {
    return withLocalePath(to, "/services");
  }
  if (route.kind === "blogs") {
    return withLocalePath(to, "/blogs");
  }
  if (route.kind === "portfolio") {
    return withLocalePath(to, "/portfolio");
  }
  if (route.kind === "quote") {
    return withLocalePath(to, "/request-a-quote");
  }
  if (route.kind === "contact") {
    return withLocalePath(to, "/contact");
  }
  if (route.kind === "faqs") {
    return withLocalePath(to, "/faqs");
  }

  const fromLocale = toPrismaLocale(from);
  const toLocale = toPrismaLocale(to);

  if (route.kind === "product") {
    const row = await prisma.product.findFirst({
      where: {
        ...published,
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: { translations: { select: { locale: true, slug: true } } },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug ? productHref(to, slug) : home(to);
  }

  if (route.kind === "category") {
    const row = await prisma.category.findFirst({
      where: {
        status: "PUBLISHED",
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: {
        kind: true,
        translations: { select: { locale: true, slug: true } },
      },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug && row ? categoryHref(to, row.kind, slug) : home(to);
  }

  if (route.kind === "service") {
    const row = await prisma.service.findFirst({
      where: {
        ...published,
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: { translations: { select: { locale: true, slug: true } } },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug ? serviceHref(to, slug) : home(to);
  }

  if (route.kind === "post") {
    const row = await prisma.post.findFirst({
      where: {
        ...published,
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: { translations: { select: { locale: true, slug: true } } },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug ? postHref(to, slug) : home(to);
  }

  if (route.kind === "post-category") {
    const row = await prisma.category.findFirst({
      where: {
        status: "PUBLISHED",
        kind: "POST",
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: { translations: { select: { locale: true, slug: true } } },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug ? categoryHref(to, "POST", slug) : withLocalePath(to, "/blogs");
  }

  if (route.kind === "post-tag") {
    const row = await prisma.tag.findFirst({
      where: {
        kind: "POST",
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: { translations: { select: { locale: true, slug: true } } },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug ? withLocalePath(to, `/blogs/tag/${slug}`) : withLocalePath(to, "/blogs");
  }

  if (route.kind === "project") {
    const row = await prisma.project.findFirst({
      where: {
        ...published,
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: { translations: { select: { locale: true, slug: true } } },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug ? projectHref(to, slug) : home(to);
  }

  if (route.kind === "author") {
    const row = await prisma.author.findFirst({
      where: {
        translations: { some: { locale: fromLocale, slug: route.slug } },
      },
      select: { translations: { select: { locale: true, slug: true } } },
    });
    const slug = row ? otherSlug(row.translations, to) : null;
    return slug ? authorHref(to, slug) : home(to);
  }

  const toSlugs: string[] = [];
  let parentId: string | null = null;
  for (const segment of route.segments) {
    const row = await findPublishedPageSegment(segment, parentId, fromLocale);
    if (!row) {
      return home(to);
    }
    const slug = row.translations.find((item) => item.locale === toLocale)?.slug;
    if (!slug) {
      return home(to);
    }
    toSlugs.push(slug);
    parentId = row.id;
  }
  return pageHref(to, toSlugs);
}

async function findPublishedPageSegment(
  segment: string,
  parentId: string | null,
  fromLocale: "EN" | "AR",
) {
  return prisma.page.findFirst({
    where: {
      ...published,
      parentId,
      OR: [
        { slug: segment },
        { translations: { some: { locale: fromLocale, slug: segment } } },
      ],
    },
    select: {
      id: true,
      translations: { select: { locale: true, slug: true } },
    },
  });
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "ar" : "en";
}
