import { tags } from "@/lib/cache-tags";
import { RESERVED_SITE_SEGMENTS } from "@/lib/site-path";
import { prisma } from "@/server/db";
import type { PageDetail, PageSectionDto, SitemapSlug } from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  mapSeo,
  pageHref,
  pickTranslation,
  published,
  seoSelect,
  toIso,
  toJson,
  translationLocales,
} from "./_shared";

function pageSelect(locale: Locale, drafts = false) {
  return {
    id: true,
    slug: true,
    parentId: true,
    template: true,
    publishedAt: true,
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: {
        locale: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        ...seoSelect,
      },
    },
    sections: {
      where: drafts ? {} : { isVisible: true },
      orderBy: { sortOrder: "asc" as const },
      select: {
        id: true,
        type: true,
        sortOrder: true,
        isVisible: true,
        settings: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, data: true },
        },
      },
    },
  } as const;
}

type PageRow = {
  id: string;
  slug: string;
  parentId: string | null;
  template: string | null;
  publishedAt: Date | string | null;
  translations: {
    locale: "EN" | "AR";
    title: string;
    slug: string;
    excerpt: string | null;
    content: unknown;
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
  }[];
  sections: {
    id: string;
    type: PageSectionDto["type"];
    sortOrder: number;
    isVisible?: boolean;
    settings: unknown;
    translations: { locale: "EN" | "AR"; data: unknown }[];
  }[];
};

function mapSections(
  sections: PageRow["sections"],
  locale: Locale,
  includeHidden = false,
): PageSectionDto[] {
  return sections.flatMap((section) => {
    if (!includeHidden && section.isVisible === false) {
      return [];
    }
    const picked = pickTranslation(section.translations, locale);
    if (!picked) {
      return [];
    }
    return [
      {
        id: section.id,
        type: section.type,
        sortOrder: section.sortOrder,
        settings: toJson(section.settings) ?? {},
        data: toJson(picked.value.data) ?? {},
        servedLocale: picked.servedLocale,
        isFallback: picked.isFallback,
      },
    ];
  });
}

async function ancestorSlugs(
  parentId: string | null,
  locale: Locale,
): Promise<string[]> {
  const slugs: string[] = [];
  let current = parentId;
  while (current) {
    const parent = await prisma.page.findFirst({
      where: { id: current, ...published },
      select: {
        parentId: true,
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    if (!parent) {
      break;
    }
    const picked = pickTranslation(parent.translations, locale);
    slugs.unshift(picked?.value.slug ?? parent.slug);
    current = parent.parentId;
  }
  return slugs;
}

async function findChildPage(
  parentId: string | null,
  segment: string,
  locale: Locale,
) {
  return prisma.page.findFirst({
    where: {
      ...published,
      parentId,
      OR: [{ slug: segment }, { translations: { some: { slug: segment } } }],
    },
    select: pageSelect(locale),
  });
}

function mapPage(
  row: PageRow,
  locale: Locale,
  path: string[],
): PageDetail | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: pageHref(locale, path),
    path,
    title: picked.value.title,
    excerpt: picked.value.excerpt,
    content: toJson(picked.value.content),
    template: row.template,
    sections: mapSections(row.sections, locale),
    seo: mapSeo(picked.value),
    publishedAt: toIso(row.publishedAt),
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

/**
 * Static and nested pages (`/about`, `/about/asim-kamal`, home).
 * Cache tags: `page:{leafSlug}`, `pages`.
 */
export async function getPageBySlugPath(
  pathSegments: string[],
  locale: Locale,
): Promise<PageDetail | null> {
  const segments =
    pathSegments.length === 0 ||
    (pathSegments.length === 1 && pathSegments[0] === "")
      ? ["home"]
      : pathSegments;
  const keyPath = segments.join("/");

  return cachedQuery({
    key: ["page-by-slug-path", keyPath, locale, "v2"],
    tags: [tags.page(segments.at(-1) ?? "home"), tags.pages()],
    fn: async () => {
      let parentId: string | null = null;
      let row: Awaited<ReturnType<typeof findChildPage>> = null;

      for (const segment of segments) {
        const match = await findChildPage(parentId, segment, locale);
        if (!match) {
          return null;
        }
        row = match;
        parentId = match.id;
      }

      if (!row) {
        return null;
      }

      const ancestorPath = await ancestorSlugs(row.parentId, locale);
      const leafSlug =
        pickTranslation(row.translations, locale)?.value.slug ?? row.slug;
      return mapPage(row, locale, [...ancestorPath, leafSlug]);
    },
  });
}

/**
 * `app/sitemap.ts` page URLs.
 * Cache tags: `sitemap`, `pages`.
 */
export async function getPageSlugsForSitemap(): Promise<SitemapSlug[]> {
  return cachedQuery({
    key: ["page-slugs-sitemap"],
    tags: [tags.sitemap(), tags.pages()],
    fn: async () => {
      const rows = await prisma.page.findMany({
        where: { ...published, showInSitemap: true },
        select: {
          slug: true,
          updatedAt: true,
          changeFrequency: true,
          priority: true,
          translations: { select: { locale: true, slug: true } },
        },
      });
      return rows.map((row) => ({
        identitySlug: row.slug,
        slugs: {
          en: row.translations.find((t) => t.locale === "EN")?.slug ?? row.slug,
          ar: row.translations.find((t) => t.locale === "AR")?.slug ?? row.slug,
        },
        updatedAt: toIso(row.updatedAt) ?? new Date(0).toISOString(),
        changeFrequency: row.changeFrequency,
        priority: row.priority,
      }));
    },
  });
}

/**
 * `generateStaticParams` for the CMS catch-all, excluding reserved public routes.
 */
export async function getPublishedPagePaths(): Promise<string[][]> {
  const reserved = new Set<string>(RESERVED_SITE_SEGMENTS);
  return cachedQuery({
    key: ["published-page-paths"],
    tags: [tags.pages(), tags.sitemap()],
    fn: async () => {
      const rows = await prisma.page.findMany({
        where: published,
        select: {
          id: true,
          parentId: true,
          slug: true,
          translations: { select: { locale: true, slug: true } },
        },
      });
      const byId = new Map(rows.map((row) => [row.id, row]));
      const paths: string[][] = [];
      for (const row of rows) {
        const segments: string[] = [];
        let current: (typeof rows)[number] | undefined = row;
        const seen = new Set<string>();
        while (current && !seen.has(current.id)) {
          seen.add(current.id);
          const en = current.translations.find((item) => item.locale === "EN")?.slug;
          segments.unshift(en || current.slug);
          current = current.parentId ? byId.get(current.parentId) : undefined;
        }
        const filtered = segments.filter((segment) => segment && segment !== "home");
        if (filtered.length === 0 || reserved.has(filtered[0] ?? "")) {
          continue;
        }
        paths.push(filtered);
      }
      return paths;
    },
  });
}

async function ancestorSlugsAny(parentId: string | null, locale: Locale): Promise<string[]> {
  const slugs: string[] = [];
  let current = parentId;
  while (current) {
    const parent = await prisma.page.findUnique({
      where: { id: current },
      select: {
        parentId: true,
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    if (!parent) {
      break;
    }
    const picked = pickTranslation(parent.translations, locale);
    slugs.unshift(picked?.value.slug ?? parent.slug);
    current = parent.parentId;
  }
  return slugs;
}

/**
 * Draft preview by id (bypasses status and cache).
 */
export async function getPageByIdUncached(
  id: string,
  locale: Locale,
): Promise<PageDetail | null> {
  const row = await prisma.page.findUnique({
    where: { id },
    select: pageSelect(locale, true),
  });
  if (!row) {
    return null;
  }
  const ancestorPath = await ancestorSlugsAny(row.parentId, locale);
  const leafSlug = pickTranslation(row.translations, locale)?.value.slug ?? row.slug;
  return mapPage(row, locale, [...ancestorPath, leafSlug]);
}
