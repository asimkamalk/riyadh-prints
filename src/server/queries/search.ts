import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type { SearchHit } from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  categoryHref,
  pageHref,
  pickTranslation,
  postHref,
  productHref,
  projectHref,
  serviceHref,
  translationLocales,
} from "./_shared";

const SEARCH_LIMIT = 24;

function excerptOf(text: string | null | undefined): string {
  if (!text) {
    return "";
  }
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

function dedupe(hits: SearchHit[]): SearchHit[] {
  const seen = new Set<string>();
  const unique: SearchHit[] = [];
  for (const hit of hits) {
    const key = `${hit.entityType}:${hit.entityId}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(hit);
  }
  return unique.slice(0, SEARCH_LIMIT);
}

/**
 * Site search overlay and `/search`.
 * Cache tags: `search`, `global`.
 */
export async function searchAll(
  query: string,
  locale: Locale,
): Promise<SearchHit[]> {
  const q = query.trim();
  return cachedQuery({
    key: ["search-all", q.toLowerCase(), locale],
    tags: [tags.search(), tags.global()],
    fn: async () => {
      if (q.length < 2) {
        return [];
      }

      const contains = { contains: q, mode: "insensitive" as const };
      const locales = translationLocales(locale);

      const [indexHits, products, services, pages, posts, categories, projects] =
        await Promise.all([
          prisma.searchIndex.findMany({
            where: {
              locale: { in: locales },
              OR: [{ title: contains }, { body: contains }, { slug: contains }],
            },
            take: SEARCH_LIMIT,
            select: {
              entityType: true,
              entityId: true,
              locale: true,
              slug: true,
              title: true,
              body: true,
            },
          }),
          prisma.product.findMany({
            where: {
              status: "PUBLISHED",
              translations: {
                some: {
                  locale: { in: locales },
                  OR: [{ name: contains }, { shortDescription: contains }],
                },
              },
            },
            take: 8,
            select: {
              id: true,
              slug: true,
              translations: {
                where: { locale: { in: locales } },
                select: {
                  locale: true,
                  name: true,
                  slug: true,
                  shortDescription: true,
                },
              },
            },
          }),
          prisma.service.findMany({
            where: {
              status: "PUBLISHED",
              translations: {
                some: {
                  locale: { in: locales },
                  OR: [{ name: contains }, { shortDescription: contains }],
                },
              },
            },
            take: 8,
            select: {
              id: true,
              slug: true,
              translations: {
                where: { locale: { in: locales } },
                select: {
                  locale: true,
                  name: true,
                  slug: true,
                  shortDescription: true,
                },
              },
            },
          }),
          prisma.page.findMany({
            where: {
              status: "PUBLISHED",
              translations: {
                some: {
                  locale: { in: locales },
                  OR: [{ title: contains }, { excerpt: contains }],
                },
              },
            },
            take: 8,
            select: {
              id: true,
              slug: true,
              parentId: true,
              translations: {
                where: { locale: { in: locales } },
                select: { locale: true, title: true, slug: true, excerpt: true },
              },
            },
          }),
          prisma.post.findMany({
            where: {
              status: "PUBLISHED",
              translations: {
                some: {
                  locale: { in: locales },
                  OR: [{ title: contains }, { excerpt: contains }],
                },
              },
            },
            take: 8,
            select: {
              id: true,
              slug: true,
              translations: {
                where: { locale: { in: locales } },
                select: { locale: true, title: true, slug: true, excerpt: true },
              },
            },
          }),
          prisma.category.findMany({
            where: {
              status: "PUBLISHED",
              translations: {
                some: {
                  locale: { in: locales },
                  OR: [{ name: contains }, { shortDescription: contains }],
                },
              },
            },
            take: 8,
            select: {
              id: true,
              slug: true,
              kind: true,
              translations: {
                where: { locale: { in: locales } },
                select: {
                  locale: true,
                  name: true,
                  slug: true,
                  shortDescription: true,
                },
              },
            },
          }),
          prisma.project.findMany({
            where: {
              status: "PUBLISHED",
              translations: {
                some: {
                  locale: { in: locales },
                  OR: [{ title: contains }, { summary: contains }],
                },
              },
            },
            take: 8,
            select: {
              id: true,
              slug: true,
              translations: {
                where: { locale: { in: locales } },
                select: { locale: true, title: true, slug: true, summary: true },
              },
            },
          }),
        ]);

      const hits: SearchHit[] = [];

      for (const row of indexHits) {
        const served = row.locale === "AR" ? "ar" : "en";
        const isFallback = locale === "ar" && served === "en";
        const hrefFor = (type: string, slug: string) => {
          switch (type) {
            case "product":
              return productHref(locale, slug);
            case "service":
              return serviceHref(locale, slug);
            case "post":
              return postHref(locale, slug);
            case "project":
              return projectHref(locale, slug);
            case "category":
              return categoryHref(locale, "PRODUCT", slug);
            default:
              return pageHref(locale, [slug]);
          }
        };
        const entityType = (
          ["product", "service", "page", "post", "category", "project"] as const
        ).includes(row.entityType as SearchHit["entityType"])
          ? (row.entityType as SearchHit["entityType"])
          : "page";
        hits.push({
          entityType,
          entityId: row.entityId,
          slug: row.slug,
          title: row.title,
          excerpt: excerptOf(row.body),
          href: hrefFor(entityType, row.slug),
          servedLocale: served,
          isFallback,
        });
      }

      for (const row of products) {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          continue;
        }
        hits.push({
          entityType: "product",
          entityId: row.id,
          slug: picked.value.slug,
          title: picked.value.name,
          excerpt: excerptOf(picked.value.shortDescription),
          href: productHref(locale, picked.value.slug),
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        });
      }

      for (const row of services) {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          continue;
        }
        hits.push({
          entityType: "service",
          entityId: row.id,
          slug: picked.value.slug,
          title: picked.value.name,
          excerpt: excerptOf(picked.value.shortDescription),
          href: serviceHref(locale, picked.value.slug),
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        });
      }

      for (const row of pages) {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          continue;
        }
        hits.push({
          entityType: "page",
          entityId: row.id,
          slug: picked.value.slug,
          title: picked.value.title,
          excerpt: excerptOf(picked.value.excerpt),
          href: pageHref(locale, [picked.value.slug]),
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        });
      }

      for (const row of posts) {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          continue;
        }
        hits.push({
          entityType: "post",
          entityId: row.id,
          slug: picked.value.slug,
          title: picked.value.title,
          excerpt: excerptOf(picked.value.excerpt),
          href: postHref(locale, picked.value.slug),
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        });
      }

      for (const row of categories) {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          continue;
        }
        hits.push({
          entityType: "category",
          entityId: row.id,
          slug: picked.value.slug,
          title: picked.value.name,
          excerpt: excerptOf(picked.value.shortDescription),
          href: categoryHref(locale, row.kind, picked.value.slug),
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        });
      }

      for (const row of projects) {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          continue;
        }
        hits.push({
          entityType: "project",
          entityId: row.id,
          slug: picked.value.slug,
          title: picked.value.title,
          excerpt: excerptOf(picked.value.summary),
          href: projectHref(locale, picked.value.slug),
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        });
      }

      return dedupe(hits);
    },
  });
}
