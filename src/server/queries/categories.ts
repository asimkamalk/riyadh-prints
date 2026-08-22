import type { CategoryKind } from "@/generated/prisma/enums";
import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type {
  CategoryDetail,
  CategorySummary,
  CategoryTreeNode,
} from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  categoryHref,
  mapMedia,
  mapSeo,
  mediaSelect,
  pickTranslation,
  published,
  seoSelect,
  translationLocales,
} from "./_shared";

function categorySelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    kind: true,
    parentId: true,
    iconName: true,
    isFeatured: true,
    sortOrder: true,
    image: { select: mediaSelect(locale) },
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: {
        locale: true,
        name: true,
        slug: true,
        shortDescription: true,
        longDescription: true,
        heroHeading: true,
        heroSubheading: true,
        ...seoSelect,
      },
    },
  } as const;
}

type CategoryRow = {
  id: string;
  slug: string;
  kind: CategoryKind;
  parentId: string | null;
  iconName: string | null;
  isFeatured: boolean;
  sortOrder: number;
  image: Parameters<typeof mapMedia>[0];
  translations: {
    locale: "EN" | "AR";
    name: string;
    slug: string;
    shortDescription: string | null;
    longDescription: string | null;
    heroHeading: string | null;
    heroSubheading: string | null;
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
};

function toSummary(row: CategoryRow, locale: Locale): CategorySummary | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    kind: row.kind,
    name: picked.value.name,
    href: categoryHref(locale, row.kind, slug),
    iconName: row.iconName,
    isFeatured: row.isFeatured,
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

/**
 * Mega-menu and home `CATEGORY_GRID`.
 * Cache tags: `categories`.
 */
export async function getCategoryTree(
  locale: Locale,
  kind: CategoryKind = "PRODUCT",
): Promise<CategoryTreeNode[]> {
  return cachedQuery({
    key: ["category-tree", locale, kind],
    tags: [tags.categories()],
    fn: async () => {
      const rows = await prisma.category.findMany({
        where: { ...published, kind },
        orderBy: { sortOrder: "asc" },
        select: categorySelect(locale),
      });
      const nodes = new Map<string, CategoryTreeNode>();
      for (const row of rows) {
        const summary = toSummary(row, locale);
        if (!summary) {
          continue;
        }
        nodes.set(row.id, {
          ...summary,
          shortDescription:
            pickTranslation(row.translations, locale)?.value.shortDescription ??
            null,
          image: mapMedia(row.image, locale),
          children: [],
        });
      }
      const roots: CategoryTreeNode[] = [];
      for (const row of rows) {
        const node = nodes.get(row.id);
        if (!node) {
          continue;
        }
        if (row.parentId && nodes.has(row.parentId)) {
          nodes.get(row.parentId)?.children.push(node);
        } else {
          roots.push(node);
        }
      }
      return roots;
    },
  });
}

async function loadCategoryDetail(
  where: { id?: string; slug?: string; kind?: CategoryKind },
  locale: Locale,
  drafts: boolean,
): Promise<CategoryDetail | null> {
  const statusFilter = drafts ? {} : published;
  const row = await prisma.category.findFirst({
    where: {
      ...statusFilter,
      ...(where.id ? { id: where.id } : {}),
      ...(where.kind ? { kind: where.kind } : {}),
      ...(where.slug
        ? { OR: [{ slug: where.slug }, { translations: { some: { slug: where.slug } } }] }
        : {}),
    },
    select: categorySelect(locale),
  });
  if (!row) {
    return null;
  }
  const picked = pickTranslation(row.translations, locale);
  const summary = toSummary(row, locale);
  if (!picked || !summary) {
    return null;
  }

  const ancestors: CategorySummary[] = [];
  let parentId = row.parentId;
  while (parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: parentId, ...statusFilter },
      select: categorySelect(locale),
    });
    if (!parent) {
      break;
    }
    const parentSummary = toSummary(parent, locale);
    if (parentSummary) {
      ancestors.unshift(parentSummary);
    }
    parentId = parent.parentId;
  }

  const childrenRows = await prisma.category.findMany({
    where: { parentId: row.id, ...statusFilter },
    orderBy: { sortOrder: "asc" },
    select: categorySelect(locale),
  });

  return {
    ...summary,
    shortDescription: picked.value.shortDescription,
    longDescription: picked.value.longDescription,
    heroHeading: picked.value.heroHeading,
    heroSubheading: picked.value.heroSubheading,
    image: mapMedia(row.image, locale),
    ancestors,
    children: childrenRows
      .map((child) => toSummary(child, locale))
      .filter((child): child is CategorySummary => child !== null),
    seo: mapSeo(picked.value),
  };
}

/**
 * Category landing `/product-category/[slug]` plus breadcrumb ancestors.
 * Cache tags: `category:{slug}`, `categories`.
 */
export async function getCategoryBySlug(
  slug: string,
  locale: Locale,
  kind: CategoryKind = "PRODUCT",
): Promise<CategoryDetail | null> {
  return cachedQuery({
    key: ["category-by-slug", slug, locale, kind],
    tags: [tags.category(slug), tags.categories()],
    fn: () => loadCategoryDetail({ slug, kind }, locale, false),
  });
}

export async function getCategoryByIdUncached(
  id: string,
  locale: Locale,
): Promise<CategoryDetail | null> {
  return loadCategoryDetail({ id }, locale, true);
}
