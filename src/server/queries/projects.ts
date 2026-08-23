import type { Prisma } from "@/generated/prisma/client";
import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type {
  CategorySummary,
  Paginated,
  ProjectCard,
  ProjectDetail,
  SitemapSlug,
} from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  categoryHref,
  mapMedia,
  mapSeo,
  mediaSelect,
  pagination,
  pickTranslation,
  projectHref,
  published,
  seoSelect,
  slugsFromTranslations,
  toIso,
  toJson,
  translationLocales,
  ALL_TRANSLATION_LOCALES,
} from "./_shared";

const DEFAULT_PER_PAGE = 9;

function projectCardSelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    clientName: true,
    completedAt: true,
    coverImage: { select: mediaSelect(locale) },
    category: {
      select: {
        id: true,
        slug: true,
        kind: true,
        iconName: true,
        isFeatured: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, name: true, slug: true },
        },
      },
    },
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: { locale: true, title: true, slug: true, summary: true },
    },
  } as const;
}

type ProjectCardRow = {
  id: string;
  slug: string;
  clientName: string | null;
  completedAt: Date | string | null;
  coverImage: Parameters<typeof mapMedia>[0];
  category: {
    id: string;
    slug: string;
    kind: CategorySummary["kind"];
    iconName: string | null;
    isFeatured: boolean;
    translations: { locale: "EN" | "AR"; name: string; slug: string }[];
  } | null;
  translations: {
    locale: "EN" | "AR";
    title: string;
    slug: string;
    summary: string | null;
  }[];
};

function mapCategory(
  row: NonNullable<ProjectCardRow["category"]>,
  locale: Locale,
): CategorySummary | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  return {
    id: row.id,
    identitySlug: row.slug,
    slug: picked.value.slug,
    kind: row.kind,
    name: picked.value.name,
    href: categoryHref(locale, row.kind, picked.value.slug),
    iconName: row.iconName,
    isFeatured: row.isFeatured,
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

function mapProjectCard(row: ProjectCardRow, locale: Locale): ProjectCard | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: projectHref(locale, slug),
    title: picked.value.title,
    summary: picked.value.summary,
    clientName: row.clientName,
    completedAt: toIso(row.completedAt),
    coverImage: mapMedia(row.coverImage, locale),
    category: row.category ? mapCategory(row.category, locale) : null,
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

/**
 * Portfolio index `/portfolio`.
 * Cache tags: `projects`.
 */
export async function getPublishedProjects(input: {
  locale: Locale;
  categorySlug?: string;
  page?: number;
  perPage?: number;
}): Promise<Paginated<ProjectCard>> {
  const page = input.page ?? 1;
  const perPage = input.perPage ?? DEFAULT_PER_PAGE;
  return cachedQuery({
    key: [
      "published-projects",
      input.locale,
      input.categorySlug ?? "",
      String(page),
      String(perPage),
    ],
    tags: [tags.projects()],
    fn: async () => {
      const where: Prisma.ProjectWhereInput = {
        ...published,
        translations: { some: { locale: "EN" } },
        ...(input.categorySlug
          ? {
              OR: [
                { category: { slug: input.categorySlug } },
                {
                  category: {
                    translations: { some: { slug: input.categorySlug } },
                  },
                },
              ],
            }
          : {}),
      };
      const { skip, perPage: take } = pagination(0, page, perPage);
      const [total, rows] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
          skip,
          take,
          select: projectCardSelect(input.locale),
        }),
      ]);
      const items = rows
        .map((row) => mapProjectCard(row, input.locale))
        .filter((row): row is ProjectCard => row !== null);
      const paged = pagination(total, page, perPage);
      return {
        items,
        total: paged.total,
        totalPages: paged.totalPages,
        page: paged.page,
        perPage: paged.perPage,
      };
    },
  });
}

/**
 * Portfolio case study `/portfolio/[slug]`.
 * Cache tags: `project:{slug}`, `projects`.
 */
export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ProjectDetail | null> {
  return cachedQuery({
    key: ["project-by-slug", slug, locale],
    tags: [tags.project(slug), tags.projects()],
    fn: async () => {
      const row = await prisma.project.findFirst({
        where: {
          ...published,
          OR: [{ slug }, { translations: { some: { slug } } }],
        },
        select: {
          ...projectCardSelect(locale),
          translations: {
            where: { locale: { in: ALL_TRANSLATION_LOCALES } },
            select: {
              locale: true,
              title: true,
              slug: true,
              summary: true,
              content: true,
              challenge: true,
              solution: true,
              result: true,
              ...seoSelect,
            },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            select: { media: { select: mediaSelect(locale) } },
          },
        },
      });
      if (!row) {
        return null;
      }
      const card = mapProjectCard(row, locale);
      const picked = pickTranslation(row.translations, locale);
      if (!card || !picked) {
        return null;
      }
      return {
        ...card,
        content: toJson(picked.value.content),
        challenge: picked.value.challenge,
        solution: picked.value.solution,
        result: picked.value.result,
        images: row.images
          .map((image) => mapMedia(image.media, locale))
          .filter((image): image is NonNullable<typeof image> => image !== null),
        seo: mapSeo(picked.value),
        slugs: slugsFromTranslations(row.translations, row.slug),
      };
    },
  });
}

/**
 * `app/sitemap.ts` project URLs.
 * Cache tags: `sitemap`, `projects`.
 */
export async function getProjectSlugsForSitemap(): Promise<SitemapSlug[]> {
  return cachedQuery({
    key: ["project-slugs-sitemap"],
    tags: [tags.sitemap(), tags.projects()],
    fn: async () => {
      const rows = await prisma.project.findMany({
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
