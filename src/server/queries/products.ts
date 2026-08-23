import type { Prisma } from "@/generated/prisma/client";
import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type {
  CategorySummary,
  Paginated,
  ProductCard,
  ProductDetail,
  ProductOptionDto,
  ProductSort,
  PublishedProductsQuery,
  SitemapSlug,
} from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  categoryHref,
  decimalToString,
  mapMedia,
  mapSeo,
  mediaSelect,
  pagination,
  pickTranslation,
  productHref,
  published,
  seoSelect,
  slugsFromTranslations,
  toIso,
  toJson,
  translationLocales,
  ALL_TRANSLATION_LOCALES,
} from "./_shared";

const DEFAULT_PER_PAGE = 12;

function categorySummarySelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    kind: true,
    iconName: true,
    isFeatured: true,
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: { locale: true, name: true, slug: true },
    },
  } as const;
}

function productCardSelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    sku: true,
    isFeatured: true,
    isNew: true,
    includesDesign: true,
    sameDayAvailable: true,
    minOrderQty: true,
    turnaroundDays: true,
    basePrice: true,
    priceUnit: true,
    category: { select: categorySummarySelect(locale) },
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: {
        locale: true,
        name: true,
        slug: true,
        shortDescription: true,
      },
    },
    images: {
      where: { isPrimary: true },
      take: 1,
      select: { media: { select: mediaSelect(locale) } },
    },
  } as const;
}

type CategoryRow = {
  id: string;
  slug: string;
  kind: CategorySummary["kind"];
  iconName: string | null;
  isFeatured: boolean;
  translations: { locale: "EN" | "AR"; name: string; slug: string }[];
};

type ProductCardRow = {
  id: string;
  slug: string;
  sku: string | null;
  isFeatured: boolean;
  isNew: boolean;
  includesDesign: boolean;
  sameDayAvailable: boolean;
  minOrderQty: number | null;
  turnaroundDays: number | null;
  basePrice: unknown;
  priceUnit: string | null;
  category: CategoryRow | null;
  translations: {
    locale: "EN" | "AR";
    name: string;
    slug: string;
    shortDescription: string | null;
  }[];
  images: { media: Parameters<typeof mapMedia>[0] }[];
};

function mapCategorySummary(
  row: CategoryRow,
  locale: Locale,
): CategorySummary | null {
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

function mapProductCard(row: ProductCardRow, locale: Locale): ProductCard | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: productHref(locale, slug),
    name: picked.value.name,
    shortDescription: picked.value.shortDescription,
    sku: row.sku,
    isFeatured: row.isFeatured,
    isNew: row.isNew,
    includesDesign: row.includesDesign,
    sameDayAvailable: row.sameDayAvailable,
    minOrderQty: row.minOrderQty,
    turnaroundDays: row.turnaroundDays,
    basePrice: decimalToString(row.basePrice),
    priceUnit: row.priceUnit,
    primaryImage: mapMedia(row.images[0]?.media ?? null, locale),
    category: row.category ? mapCategorySummary(row.category, locale) : null,
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

function productOrderBy(
  sort: ProductSort,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ publishedAt: "desc" }, { sortOrder: "asc" }];
    case "oldest":
      return [{ publishedAt: "asc" }, { sortOrder: "asc" }];
    case "price-asc":
      return [{ basePrice: "asc" }, { sortOrder: "asc" }];
    case "price-desc":
      return [{ basePrice: "desc" }, { sortOrder: "asc" }];
    case "name-desc":
      return [{ slug: "desc" }];
    case "name-asc":
      return [{ slug: "asc" }];
    default:
      return [{ isFeatured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }];
  }
}

function productWhere(input: PublishedProductsQuery): Prisma.ProductWhereInput {
  const search = input.search?.trim();
  return {
    ...published,
    AND: [
      { translations: { some: { locale: "EN" } } },
      ...(search
        ? [
            {
              translations: {
                some: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { shortDescription: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            } satisfies Prisma.ProductWhereInput,
          ]
        : []),
    ],
    ...(input.featured === true ? { isFeatured: true } : {}),
    ...(input.categorySlug
      ? {
          OR: [
            { category: { slug: input.categorySlug } },
            {
              category: {
                translations: { some: { slug: input.categorySlug } },
              },
            },
            {
              categories: {
                some: {
                  category: {
                    OR: [
                      { slug: input.categorySlug },
                      {
                        translations: { some: { slug: input.categorySlug } },
                      },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
    ...(input.tagSlug
      ? {
          tags: {
            some: {
              tag: {
                kind: "PRODUCT",
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
 * Catalogue grid and featured blocks on home / category pages.
 * Cache tags: `products`, `category:{slug}` when filtered.
 */
export async function getPublishedProducts(
  input: PublishedProductsQuery,
): Promise<Paginated<ProductCard>> {
  const sort = input.sort ?? "featured";
  const page = input.page ?? 1;
  const perPage = input.perPage ?? DEFAULT_PER_PAGE;
  const cacheTags = [
    tags.products(),
    ...(input.categorySlug ? [tags.category(input.categorySlug)] : []),
  ];

  return cachedQuery({
    key: [
      "published-products",
      input.locale,
      input.categorySlug ?? "",
      String(page),
      String(perPage),
      sort,
      input.featured ? "1" : "0",
      input.search ?? "",
      input.tagSlug ?? "",
    ],
    tags: cacheTags,
    fn: async () => {
      const where = productWhere(input);
      const { skip, ...meta } = pagination(0, page, perPage);
      const [total, rows] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          orderBy: productOrderBy(sort),
          skip,
          take: meta.perPage,
          select: productCardSelect(input.locale),
        }),
      ]);
      const items = rows
        .map((row) => mapProductCard(row, input.locale))
        .filter((row): row is ProductCard => row !== null);
      const paged = pagination(total, page, perPage);
      return { items, total: paged.total, totalPages: paged.totalPages, page: paged.page, perPage: paged.perPage };
    },
  });
}

/**
 * Product detail + metadata for `/product/[slug]`.
 * Cache tags: `product:{slug}`, `products`.
 */
function productDetailSelect(locale: Locale) {
  return {
    ...productCardSelect(locale),
    publishedAt: true,
    translations: {
      where: { locale: { in: ALL_TRANSLATION_LOCALES } },
      select: {
        locale: true,
        name: true,
        slug: true,
        shortDescription: true,
        longDescription: true,
        specifications: true,
        materials: true,
        useCases: true,
        ...seoSelect,
      },
    },
    images: {
      orderBy: { sortOrder: "asc" as const },
      select: {
        isPrimary: true,
        media: { select: mediaSelect(locale) },
      },
    },
    options: {
      orderBy: { sortOrder: "asc" as const },
      select: {
        id: true,
        key: true,
        sortOrder: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, label: true },
        },
        values: {
          orderBy: { sortOrder: "asc" as const },
          select: {
            id: true,
            value: true,
            priceModifier: true,
            sortOrder: true,
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, label: true },
            },
          },
        },
      },
    },
    priceTiers: {
      orderBy: { minQty: "asc" as const },
      select: { minQty: true, maxQty: true, unitPrice: true },
    },
  };
}

function mapProductDetail(
  row: Awaited<ReturnType<typeof loadProductRow>>,
  locale: Locale,
): ProductDetail | null {
  if (!row) {
    return null;
  }
  const card = mapProductCard(row, locale);
  if (!card) {
    return null;
  }
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const options: ProductOptionDto[] = row.options.flatMap((option) => {
    const label = pickTranslation(option.translations, locale);
    if (!label) {
      return [];
    }
    return [
      {
        id: option.id,
        key: option.key,
        label: label.value.label,
        sortOrder: option.sortOrder,
        servedLocale: label.servedLocale,
        isFallback: label.isFallback,
        values: option.values.flatMap((value) => {
          const valueLabel = pickTranslation(value.translations, locale);
          if (!valueLabel) {
            return [];
          }
          return [
            {
              id: value.id,
              value: value.value,
              label: valueLabel.value.label,
              priceModifier: decimalToString(value.priceModifier) ?? "0",
              sortOrder: value.sortOrder,
              servedLocale: valueLabel.servedLocale,
              isFallback: valueLabel.isFallback,
            },
          ];
        }),
      },
    ];
  });
  const images = row.images
    .map((image) => mapMedia(image.media, locale))
    .filter((image): image is NonNullable<typeof image> => image !== null);

  return {
    ...card,
    longDescription: toJson(picked.value.longDescription),
    specifications: toJson(picked.value.specifications),
    materials: toJson(picked.value.materials),
    useCases: toJson(picked.value.useCases),
    images,
    options,
    priceTiers: row.priceTiers.map((tier) => ({
      minQty: tier.minQty,
      maxQty: tier.maxQty,
      unitPrice: decimalToString(tier.unitPrice) ?? "0",
    })),
    seo: mapSeo(picked.value),
    publishedAt: toIso(row.publishedAt),
    slugs: slugsFromTranslations(row.translations, row.slug),
  };
}

async function loadProductRow(where: Prisma.ProductWhereInput, locale: Locale) {
  return prisma.product.findFirst({
    where,
    select: productDetailSelect(locale),
  });
}

export async function getProductBySlug(
  slug: string,
  locale: Locale,
): Promise<ProductDetail | null> {
  return cachedQuery({
    key: ["product-by-slug", slug, locale],
    tags: [tags.product(slug), tags.products()],
    fn: async () =>
      mapProductDetail(
        await loadProductRow(
          { ...published, OR: [{ slug }, { translations: { some: { slug } } }] },
          locale,
        ),
        locale,
      ),
  });
}

export async function getProductByIdUncached(
  id: string,
  locale: Locale,
): Promise<ProductDetail | null> {
  return mapProductDetail(await loadProductRow({ id }, locale), locale);
}

/**
 * Related products strip on `/product/[slug]`.
 * Cache tags: `product:{slug}`, `products`.
 */
export async function getRelatedProducts(
  slug: string,
  locale: Locale,
  take = 4,
): Promise<ProductCard[]> {
  return cachedQuery({
    key: ["related-products", slug, locale, String(take)],
    tags: [tags.product(slug), tags.products()],
    fn: async () => {
      const product = await prisma.product.findFirst({
        where: {
          ...published,
          OR: [{ slug }, { translations: { some: { slug } } }],
        },
        select: { id: true, categoryId: true, slug: true },
      });
      if (!product) {
        return [];
      }
      const related = await prisma.productRelation.findMany({
        where: { productId: product.id, related: published },
        orderBy: { sortOrder: "asc" },
        take,
        select: { related: { select: productCardSelect(locale) } },
      });
      let cards = related
        .map((row) => mapProductCard(row.related, locale))
        .filter((row): row is ProductCard => row !== null);
      if (cards.length < take && product.categoryId) {
        const extras = await prisma.product.findMany({
          where: {
            ...published,
            categoryId: product.categoryId,
            id: { not: product.id },
          },
          orderBy: { sortOrder: "asc" },
          take: take - cards.length,
          select: productCardSelect(locale),
        });
        const seen = new Set(cards.map((card) => card.id));
        for (const extra of extras) {
          const card = mapProductCard(extra, locale);
          if (card && !seen.has(card.id)) {
            cards.push(card);
          }
        }
      }
      return cards.slice(0, take);
    },
  });
}

/**
 * `app/sitemap.ts` product URLs.
 * Cache tags: `sitemap`, `products`.
 */
export async function getProductSlugsForSitemap(): Promise<SitemapSlug[]> {
  return cachedQuery({
    key: ["product-slugs-sitemap"],
    tags: [tags.sitemap(), tags.products()],
    fn: async () => {
      const rows = await prisma.product.findMany({
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
