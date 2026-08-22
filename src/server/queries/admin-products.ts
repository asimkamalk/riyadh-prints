import type { ContentStatus } from "@/generated/prisma/enums";
import type { JsonValue, Paginated } from "@/types/content";
import {
  compactKvRows,
  compactStrings,
  parseKvRows,
  parseStringList,
  type KvRow,
} from "@/lib/catalogue-json";
import { decimalToString, pagination } from "@/server/queries/_shared";
import { prisma } from "@/server/db";
import {
  adminMediaSelect,
  mapAdminMedia,
  type AdminMediaRecord,
} from "@/server/queries/media";

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
  isFeatured: boolean;
  categoryId: string | null;
  categoryName: string | null;
  basePrice: string | null;
  priceUnit: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  updatedAt: string;
};

export type AdminProductOptionValue = {
  id: string;
  value: string;
  priceModifier: string;
  sortOrder: number;
  labelEn: string;
  labelAr: string;
};

export type AdminProductOption = {
  id: string;
  key: string;
  sortOrder: number;
  labelEn: string;
  labelAr: string;
  values: AdminProductOptionValue[];
};

export type AdminProductImage = {
  id: string;
  mediaId: string;
  sortOrder: number;
  isPrimary: boolean;
  media: AdminMediaRecord;
};

export type AdminLocaleSeo = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageId: string | null;
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
  focusKeyword: string;
};

export type AdminProductDetail = {
  id: string;
  slug: string;
  sku: string;
  status: ContentStatus;
  isFeatured: boolean;
  isNew: boolean;
  includesDesign: boolean;
  sameDayAvailable: boolean;
  minOrderQty: number | null;
  turnaroundDays: number | null;
  basePrice: string;
  priceUnit: string;
  categoryId: string | null;
  publishedAt: string | null;
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  shortEn: string;
  shortAr: string;
  longEn: JsonValue | null;
  longAr: JsonValue | null;
  specificationsEn: KvRow[];
  specificationsAr: KvRow[];
  materialsEn: string[];
  materialsAr: string[];
  useCasesEn: string[];
  useCasesAr: string[];
  seoEn: AdminLocaleSeo;
  seoAr: AdminLocaleSeo;
  images: AdminProductImage[];
  priceTiers: { minQty: number; maxQty: number | null; unitPrice: string }[];
  options: AdminProductOption[];
  relatedProductIds: string[];
};

export type AdminNamedOption = { id: string; name: string };

const LIST_PAGE = 20;

function emptySeo(): AdminLocaleSeo {
  return {
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImageId: null,
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
    focusKeyword: "",
  };
}

function seoFrom(row: {
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
  focusKeyword: string | null;
} | undefined): AdminLocaleSeo {
  if (!row) {
    return emptySeo();
  }
  return {
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    ogTitle: row.ogTitle ?? "",
    ogDescription: row.ogDescription ?? "",
    ogImageId: row.ogImageId,
    canonicalUrl: row.canonicalUrl ?? "",
    noIndex: row.noIndex,
    noFollow: row.noFollow,
    focusKeyword: row.focusKeyword ?? "",
  };
}

export async function listAdminProducts(args: {
  query?: string;
  categoryId?: string;
  status?: ContentStatus;
  featured?: boolean;
  page?: number;
  perPage?: number;
}): Promise<Paginated<AdminProductListItem>> {
  const q = args.query?.trim() ?? "";
  const page = args.page ?? 1;
  const perPage = args.perPage ?? LIST_PAGE;
  const where = {
    ...(args.categoryId ? { categoryId: args.categoryId } : {}),
    ...(args.status ? { status: args.status } : {}),
    ...(args.featured === undefined ? {} : { isFeatured: args.featured }),
    ...(q
      ? {
          OR: [
            { slug: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
            { translations: { some: { name: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };
  const total = await prisma.product.count({ where });
  const pageInfo = pagination(total, page, perPage);
  const rows = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: pageInfo.skip,
    take: pageInfo.perPage,
    select: {
      id: true,
      slug: true,
      status: true,
      isFeatured: true,
      categoryId: true,
      basePrice: true,
      priceUnit: true,
      updatedAt: true,
      category: {
        select: { translations: { where: { locale: "EN" }, select: { name: true } } },
      },
      translations: { where: { locale: "EN" }, select: { name: true } },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: {
          media: {
            select: {
              url: true,
              translations: { where: { locale: "EN" }, select: { alt: true } },
            },
          },
        },
      },
    },
  });
  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.translations[0]?.name ?? row.slug,
      slug: row.slug,
      status: row.status,
      isFeatured: row.isFeatured,
      categoryId: row.categoryId,
      categoryName: row.category?.translations[0]?.name ?? null,
      basePrice: decimalToString(row.basePrice),
      priceUnit: row.priceUnit,
      thumbnailUrl: row.images[0]?.media.url ?? null,
      thumbnailAlt: row.images[0]?.media.translations[0]?.alt ?? "",
      updatedAt: row.updatedAt.toISOString(),
    })),
    total: pageInfo.total,
    totalPages: pageInfo.totalPages,
    page: pageInfo.page,
    perPage: pageInfo.perPage,
  };
}

export async function listAdminProductChoices(excludeId?: string): Promise<AdminNamedOption[]> {
  const rows = await prisma.product.findMany({
    where: { ...(excludeId ? { id: { not: excludeId } } : {}), status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      slug: true,
      translations: { where: { locale: "EN" }, select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.translations[0]?.name ?? row.slug,
  }));
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: {
      translations: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          mediaId: true,
          sortOrder: true,
          isPrimary: true,
          media: { select: adminMediaSelect },
        },
      },
      priceTiers: { orderBy: { minQty: "asc" } },
      options: {
        orderBy: { sortOrder: "asc" },
        include: {
          translations: true,
          values: {
            orderBy: { sortOrder: "asc" },
            include: { translations: true },
          },
        },
      },
      relationsFrom: { orderBy: { sortOrder: "asc" }, select: { relatedProductId: true } },
    },
  });
  if (!row) {
    return null;
  }
  const en = row.translations.find((t) => t.locale === "EN");
  const ar = row.translations.find((t) => t.locale === "AR");
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku ?? "",
    status: row.status,
    isFeatured: row.isFeatured,
    isNew: row.isNew,
    includesDesign: row.includesDesign,
    sameDayAvailable: row.sameDayAvailable,
    minOrderQty: row.minOrderQty,
    turnaroundDays: row.turnaroundDays,
    basePrice: decimalToString(row.basePrice) ?? "",
    priceUnit: row.priceUnit ?? "",
    categoryId: row.categoryId,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    nameEn: en?.name ?? "",
    nameAr: ar?.name ?? "",
    slugEn: en?.slug ?? row.slug,
    slugAr: ar?.slug ?? "",
    shortEn: en?.shortDescription ?? "",
    shortAr: ar?.shortDescription ?? "",
    longEn: (en?.longDescription as JsonValue | null) ?? null,
    longAr: (ar?.longDescription as JsonValue | null) ?? null,
    specificationsEn: compactKvRows(parseKvRows(en?.specifications)),
    specificationsAr: compactKvRows(parseKvRows(ar?.specifications)),
    materialsEn: compactStrings(parseStringList(en?.materials)),
    materialsAr: compactStrings(parseStringList(ar?.materials)),
    useCasesEn: compactStrings(parseStringList(en?.useCases)),
    useCasesAr: compactStrings(parseStringList(ar?.useCases)),
    seoEn: seoFrom(en),
    seoAr: seoFrom(ar),
    images: row.images.map((image) => ({
      id: image.id,
      mediaId: image.mediaId,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
      media: mapAdminMedia(image.media),
    })),
    priceTiers: row.priceTiers.map((tier) => ({
      minQty: tier.minQty,
      maxQty: tier.maxQty,
      unitPrice: decimalToString(tier.unitPrice) ?? "0",
    })),
    options: row.options.map((option) => ({
      id: option.id,
      key: option.key,
      sortOrder: option.sortOrder,
      labelEn: option.translations.find((t) => t.locale === "EN")?.label ?? option.key,
      labelAr: option.translations.find((t) => t.locale === "AR")?.label ?? "",
      values: option.values.map((value) => ({
        id: value.id,
        value: value.value,
        priceModifier: decimalToString(value.priceModifier) ?? "0",
        sortOrder: value.sortOrder,
        labelEn: value.translations.find((t) => t.locale === "EN")?.label ?? value.value,
        labelAr: value.translations.find((t) => t.locale === "AR")?.label ?? "",
      })),
    })),
    relatedProductIds: row.relationsFrom.map((rel) => rel.relatedProductId),
  };
}
