import type { Prisma } from "@/generated/prisma/client";
import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type {
  AuthorDto,
  CategorySummary,
  Paginated,
  PostCard,
  PostDetail,
  PublishedPostsQuery,
  SitemapSlug,
} from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  authorHref,
  cachedQuery,
  categoryHref,
  mapMedia,
  mapSeo,
  mediaSelect,
  pagination,
  pickTranslation,
  postHref,
  published,
  seoSelect,
  slugsFromTranslations,
  toIso,
  toJson,
  translationLocales,
  ALL_TRANSLATION_LOCALES,
} from "./_shared";

const DEFAULT_PER_PAGE = 9;

function postCardSelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    publishedAt: true,
    readingMinutes: true,
    isFeatured: true,
    coverImage: { select: mediaSelect(locale) },
    author: {
      select: {
        id: true,
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, name: true, slug: true, role: true },
        },
      },
    },
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: { locale: true, title: true, slug: true, excerpt: true },
    },
    categories: {
      select: {
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
      },
    },
  } as const;
}

type PostCardRow = {
  id: string;
  slug: string;
  publishedAt: Date | string | null;
  readingMinutes: number | null;
  isFeatured: boolean;
  coverImage: Parameters<typeof mapMedia>[0];
  author: {
    id: string;
    slug: string;
    translations: {
      locale: "EN" | "AR";
      name: string;
      slug: string;
      role: string | null;
    }[];
  } | null;
  translations: {
    locale: "EN" | "AR";
    title: string;
    slug: string;
    excerpt: string | null;
  }[];
  categories: {
    category: {
      id: string;
      slug: string;
      kind: CategorySummary["kind"];
      iconName: string | null;
      isFeatured: boolean;
      translations: { locale: "EN" | "AR"; name: string; slug: string }[];
    };
  }[];
};

function mapAuthor(
  row: NonNullable<PostCardRow["author"]>,
  locale: Locale,
): AuthorDto | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: authorHref(locale, slug),
    name: picked.value.name,
    role: picked.value.role,
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

function mapPostCard(row: PostCardRow, locale: Locale): PostCard | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  const categories: CategorySummary[] = row.categories.flatMap((link) => {
    const cat = pickTranslation(link.category.translations, locale);
    if (!cat) {
      return [];
    }
    return [
      {
        id: link.category.id,
        identitySlug: link.category.slug,
        slug: cat.value.slug,
        kind: link.category.kind,
        name: cat.value.name,
        href: categoryHref(locale, link.category.kind, cat.value.slug),
        iconName: link.category.iconName,
        isFeatured: link.category.isFeatured,
        servedLocale: cat.servedLocale,
        isFallback: cat.isFallback,
      },
    ];
  });
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: postHref(locale, slug),
    title: picked.value.title,
    excerpt: picked.value.excerpt,
    publishedAt: toIso(row.publishedAt),
    readingMinutes: row.readingMinutes,
    isFeatured: row.isFeatured,
    coverImage: mapMedia(row.coverImage, locale),
    author: row.author ? mapAuthor(row.author, locale) : null,
    categories,
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

function postsWhere(input: PublishedPostsQuery): Prisma.PostWhereInput {
  return {
    ...published,
    translations: { some: { locale: "EN" } },
    ...(input.featured === true ? { isFeatured: true } : {}),
    ...(input.categorySlug
      ? {
          categories: {
            some: {
              category: {
                OR: [
                  { slug: input.categorySlug },
                  { translations: { some: { slug: input.categorySlug } } },
                ],
              },
            },
          },
        }
      : {}),
    ...(input.tagSlug
      ? {
          tags: {
            some: {
              tag: {
                OR: [
                  { slug: input.tagSlug },
                  { translations: { some: { slug: input.tagSlug } } },
                ],
              },
            },
          },
        }
      : {}),
  };
}

/**
 * Blog index `/blog` with category/tag filters.
 * Cache tags: `posts`, `category:{slug}` when filtered.
 */
export async function getPosts(
  input: PublishedPostsQuery,
): Promise<Paginated<PostCard>> {
  const page = input.page ?? 1;
  const perPage = input.perPage ?? DEFAULT_PER_PAGE;
  return cachedQuery({
    key: [
      "posts",
      input.locale,
      input.categorySlug ?? "",
      input.tagSlug ?? "",
      String(page),
      String(perPage),
      input.featured ? "1" : "0",
    ],
    tags: [
      tags.posts(),
      ...(input.categorySlug ? [tags.category(input.categorySlug)] : []),
    ],
    fn: async () => {
      const where = postsWhere(input);
      const { skip, perPage: take } = pagination(0, page, perPage);
      const [total, rows] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({
          where,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          skip,
          take,
          select: postCardSelect(input.locale),
        }),
      ]);
      const items = rows
        .map((row) => mapPostCard(row, input.locale))
        .filter((row): row is PostCard => row !== null);
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
 * Blog article `/blog/[slug]`.
 * Cache tags: `post:{slug}`, `posts`.
 */
export async function getPostBySlug(
  slug: string,
  locale: Locale,
): Promise<PostDetail | null> {
  return cachedQuery({
    key: ["post-by-slug", slug, locale],
    tags: [tags.post(slug), tags.posts()],
    fn: async () => {
      const row = await prisma.post.findFirst({
        where: {
          ...published,
          OR: [{ slug }, { translations: { some: { slug } } }],
        },
        select: {
          ...postCardSelect(locale),
          translations: {
            where: { locale: { in: ALL_TRANSLATION_LOCALES } },
            select: {
              locale: true,
              title: true,
              slug: true,
              excerpt: true,
              content: true,
              ...seoSelect,
            },
          },
          tags: {
            select: {
              tag: {
                select: {
                  slug: true,
                  translations: {
                    where: { locale: { in: translationLocales(locale) } },
                    select: { locale: true, name: true, slug: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!row) {
        return null;
      }
      const card = mapPostCard(row, locale);
      const picked = pickTranslation(row.translations, locale);
      if (!card || !picked) {
        return null;
      }
      return {
        ...card,
        content: toJson(picked.value.content),
        tags: row.tags.flatMap((link) => {
          const tag = pickTranslation(link.tag.translations, locale);
          if (!tag) {
            return [];
          }
          return [{ slug: tag.value.slug, name: tag.value.name }];
        }),
        seo: mapSeo(picked.value),
        slugs: slugsFromTranslations(row.translations, row.slug),
      };
    },
  });
}

/**
 * Related posts on `/blog/[slug]`.
 * Cache tags: `post:{slug}`, `posts`.
 */
export async function getRelatedPosts(
  slug: string,
  locale: Locale,
  take = 3,
): Promise<PostCard[]> {
  return cachedQuery({
    key: ["related-posts", slug, locale, String(take)],
    tags: [tags.post(slug), tags.posts()],
    fn: async () => {
      const post = await prisma.post.findFirst({
        where: {
          ...published,
          OR: [{ slug }, { translations: { some: { slug } } }],
        },
        select: {
          id: true,
          categories: { select: { categoryId: true } },
        },
      });
      if (!post) {
        return [];
      }
      const categoryIds = post.categories.map((link) => link.categoryId);
      const rows = await prisma.post.findMany({
        where: {
          ...published,
          id: { not: post.id },
          ...(categoryIds.length
            ? { categories: { some: { categoryId: { in: categoryIds } } } }
            : {}),
        },
        orderBy: { publishedAt: "desc" },
        take,
        select: postCardSelect(locale),
      });
      return rows
        .map((row) => mapPostCard(row, locale))
        .filter((row): row is PostCard => row !== null);
    },
  });
}

/**
 * `app/sitemap.ts` post URLs.
 * Cache tags: `sitemap`, `posts`.
 */
export async function getPostSlugsForSitemap(): Promise<SitemapSlug[]> {
  return cachedQuery({
    key: ["post-slugs-sitemap"],
    tags: [tags.sitemap(), tags.posts()],
    fn: async () => {
      const rows = await prisma.post.findMany({
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

export type PostTagDto = {
  slug: string;
  name: string;
  description: string | null;
  identitySlug: string;
  slugs: { en: string; ar: string };
};

export async function getTagBySlug(slug: string, locale: Locale): Promise<PostTagDto | null> {
  return cachedQuery({
    key: ["post-tag-by-slug", slug, locale],
    tags: [tags.posts()],
    fn: async () => {
      const row = await prisma.tag.findFirst({
        where: {
          kind: "POST",
          OR: [{ slug }, { translations: { some: { slug } } }],
        },
        select: {
          slug: true,
          translations: {
            where: { locale: { in: ALL_TRANSLATION_LOCALES } },
            select: { locale: true, name: true, slug: true, description: true },
          },
        },
      });
      if (!row) {
        return null;
      }
      const picked = pickTranslation(row.translations, locale);
      if (!picked) {
        return null;
      }
      return {
        identitySlug: row.slug,
        slug: picked.value.slug,
        name: picked.value.name,
        description: picked.value.description,
        slugs: slugsFromTranslations(row.translations, row.slug),
      };
    },
  });
}

export async function getPostTagSlugs(): Promise<string[]> {
  return cachedQuery({
    key: ["post-tag-slugs"],
    tags: [tags.posts(), tags.sitemap()],
    fn: async () => {
      const rows = await prisma.tag.findMany({
        where: { kind: "POST" },
        select: { slug: true },
      });
      return rows.map((row) => row.slug);
    },
  });
}
