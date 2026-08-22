import type { ContentStatus } from "@/generated/prisma/enums";
import type { JsonValue, Paginated } from "@/types/content";
import {
  compactSteps,
  compactStrings,
  parseProcessSteps,
  parseStringList,
  type ProcessStep,
} from "@/lib/catalogue-json";
import { decimalToString, pagination } from "@/server/queries/_shared";
import { prisma } from "@/server/db";
import {
  adminMediaSelect,
  mapAdminMedia,
  type AdminMediaRecord,
} from "@/server/queries/media";
import type { AdminLocaleSeo } from "@/server/queries/admin-products";

export type AdminServiceListItem = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
  isFeatured: boolean;
  categoryName: string | null;
  startingPrice: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  updatedAt: string;
};

export type AdminServiceDetail = {
  id: string;
  slug: string;
  status: ContentStatus;
  isFeatured: boolean;
  iconName: string;
  categoryId: string | null;
  turnaroundTime: string;
  startingPrice: string;
  publishedAt: string | null;
  image: AdminMediaRecord | null;
  heroImage: AdminMediaRecord | null;
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  shortEn: string;
  shortAr: string;
  longEn: JsonValue | null;
  longAr: JsonValue | null;
  ctaLabelEn: string;
  ctaLabelAr: string;
  heroHeadingEn: string;
  heroHeadingAr: string;
  heroSubheadingEn: string;
  heroSubheadingAr: string;
  benefitsEn: string[];
  benefitsAr: string[];
  processStepsEn: ProcessStep[];
  processStepsAr: ProcessStep[];
  seoEn: AdminLocaleSeo;
  seoAr: AdminLocaleSeo;
};

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

export async function listAdminServices(args: {
  query?: string;
  status?: ContentStatus;
  featured?: boolean;
  page?: number;
  perPage?: number;
}): Promise<Paginated<AdminServiceListItem>> {
  const q = args.query?.trim() ?? "";
  const page = args.page ?? 1;
  const perPage = args.perPage ?? 20;
  const where = {
    ...(args.status ? { status: args.status } : {}),
    ...(args.featured === undefined ? {} : { isFeatured: args.featured }),
    ...(q
      ? {
          OR: [
            { slug: { contains: q, mode: "insensitive" as const } },
            { translations: { some: { name: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };
  const total = await prisma.service.count({ where });
  const pageInfo = pagination(total, page, perPage);
  const rows = await prisma.service.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: pageInfo.skip,
    take: pageInfo.perPage,
    select: {
      id: true,
      slug: true,
      status: true,
      isFeatured: true,
      startingPrice: true,
      updatedAt: true,
      category: {
        select: { translations: { where: { locale: "EN" }, select: { name: true } } },
      },
      translations: { where: { locale: "EN" }, select: { name: true } },
      image: {
        select: {
          url: true,
          translations: { where: { locale: "EN" }, select: { alt: true } },
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
      categoryName: row.category?.translations[0]?.name ?? null,
      startingPrice: decimalToString(row.startingPrice),
      thumbnailUrl: row.image?.url ?? null,
      thumbnailAlt: row.image?.translations[0]?.alt ?? "",
      updatedAt: row.updatedAt.toISOString(),
    })),
    total: pageInfo.total,
    totalPages: pageInfo.totalPages,
    page: pageInfo.page,
    perPage: pageInfo.perPage,
  };
}

export async function getAdminService(id: string): Promise<AdminServiceDetail | null> {
  const row = await prisma.service.findUnique({
    where: { id },
    include: {
      translations: true,
      image: { select: adminMediaSelect },
      heroImage: { select: adminMediaSelect },
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
    status: row.status,
    isFeatured: row.isFeatured,
    iconName: row.iconName ?? "",
    categoryId: row.categoryId,
    turnaroundTime: row.turnaroundTime ?? "",
    startingPrice: decimalToString(row.startingPrice) ?? "",
    publishedAt: row.publishedAt?.toISOString() ?? null,
    image: row.image ? mapAdminMedia(row.image) : null,
    heroImage: row.heroImage ? mapAdminMedia(row.heroImage) : null,
    nameEn: en?.name ?? "",
    nameAr: ar?.name ?? "",
    slugEn: en?.slug ?? row.slug,
    slugAr: ar?.slug ?? "",
    shortEn: en?.shortDescription ?? "",
    shortAr: ar?.shortDescription ?? "",
    longEn: (en?.longDescription as JsonValue | null) ?? null,
    longAr: (ar?.longDescription as JsonValue | null) ?? null,
    ctaLabelEn: en?.ctaLabel ?? "",
    ctaLabelAr: ar?.ctaLabel ?? "",
    heroHeadingEn: en?.heroHeading ?? "",
    heroHeadingAr: ar?.heroHeading ?? "",
    heroSubheadingEn: en?.heroSubheading ?? "",
    heroSubheadingAr: ar?.heroSubheading ?? "",
    benefitsEn: compactStrings(parseStringList(en?.benefits)),
    benefitsAr: compactStrings(parseStringList(ar?.benefits)),
    processStepsEn: compactSteps(parseProcessSteps(en?.processSteps)),
    processStepsAr: compactSteps(parseProcessSteps(ar?.processSteps)),
    seoEn: seoFrom(en),
    seoAr: seoFrom(ar),
  };
}
