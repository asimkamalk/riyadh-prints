import type { Prisma } from "@/generated/prisma/client";
import type { Locale as PrismaLocale } from "@/generated/prisma/enums";
import { tags } from "@/lib/cache-tags";
import {
  DEFAULT_MEDIA_FOLDER,
  MEDIA_PAGE_SIZE,
  mimesForTypeFilter,
  sanitizeFolder,
  type MediaTypeFilter,
} from "@/lib/media-types";
import type { Paginated } from "@/types/content";
import { prisma } from "@/server/db";
import { cachedQuery, pagination } from "@/server/queries/_shared";

export type AdminMediaRecord = {
  id: string;
  url: string;
  pathname: string;
  provider: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  sizeBytes: number | null;
  folder: string | null;
  uploadedById: string | null;
  createdAt: string;
  altEn: string;
  altAr: string;
  titleEn: string;
  titleAr: string;
  captionEn: string;
  captionAr: string;
};

export type AdminMediaItem = AdminMediaRecord;

export type MediaListFilters = {
  query?: string;
  folder?: string;
  type?: MediaTypeFilter;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
};

type MediaRow = {
  id: string;
  url: string;
  pathname: string;
  provider: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  sizeBytes: number | null;
  folder: string | null;
  uploadedById: string | null;
  createdAt: Date;
  translations: {
    locale: PrismaLocale;
    alt: string;
    title: string | null;
    caption: string | null;
  }[];
};

export const adminMediaSelect = {
  id: true,
  url: true,
  pathname: true,
  provider: true,
  mimeType: true,
  width: true,
  height: true,
  blurDataUrl: true,
  sizeBytes: true,
  folder: true,
  uploadedById: true,
  createdAt: true,
  translations: { select: { locale: true, alt: true, title: true, caption: true } },
} as const;

function loc(
  rows: MediaRow["translations"],
  locale: PrismaLocale,
  field: "alt" | "title" | "caption",
): string {
  return rows.find((row) => row.locale === locale)?.[field] ?? "";
}

export function mapAdminMedia(row: MediaRow): AdminMediaRecord {
  return {
    id: row.id,
    url: row.url,
    pathname: row.pathname,
    provider: row.provider,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    blurDataUrl: row.blurDataUrl,
    sizeBytes: row.sizeBytes,
    folder: row.folder,
    uploadedById: row.uploadedById,
    createdAt: row.createdAt.toISOString(),
    altEn: loc(row.translations, "EN", "alt"),
    altAr: loc(row.translations, "AR", "alt"),
    titleEn: loc(row.translations, "EN", "title"),
    titleAr: loc(row.translations, "AR", "title"),
    captionEn: loc(row.translations, "EN", "caption"),
    captionAr: loc(row.translations, "AR", "caption"),
  };
}

function mediaWhere(filters: MediaListFilters): Prisma.MediaWhereInput {
  const q = filters.query?.trim() ?? "";
  const folder = filters.folder?.trim()
    ? sanitizeFolder(filters.folder)
    : "";
  const mimes = mimesForTypeFilter(filters.type ?? "all");
  const from = filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : null;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : null;

  return {
    ...(folder ? { folder } : {}),
    ...(mimes ? { mimeType: { in: [...mimes] } } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { pathname: { contains: q, mode: "insensitive" } },
            { translations: { some: { alt: { contains: q, mode: "insensitive" } } } },
            { translations: { some: { title: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };
}

export function listAdminMediaPage(
  filters: MediaListFilters,
): Promise<Paginated<AdminMediaRecord>> {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? MEDIA_PAGE_SIZE;
  const key = [
    "admin-media-page",
    filters.query ?? "",
    filters.folder ?? "",
    filters.type ?? "all",
    filters.from ?? "",
    filters.to ?? "",
    String(page),
    String(perPage),
  ];
  return cachedQuery({
    key,
    tags: [tags.media(), tags.global()],
    revalidate: 30,
    fn: async () => {
      const where = mediaWhere(filters);
      const total = await prisma.media.count({ where });
      const pageInfo = pagination(total, page, perPage);
      const rows = await prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pageInfo.skip,
        take: pageInfo.perPage,
        select: adminMediaSelect,
      });
      return {
        items: rows.map(mapAdminMedia),
        total: pageInfo.total,
        totalPages: pageInfo.totalPages,
        page: pageInfo.page,
        perPage: pageInfo.perPage,
      };
    },
  });
}

export function listMediaFolders(): Promise<string[]> {
  return cachedQuery({
    key: ["admin-media-folders"],
    tags: [tags.media(), tags.global()],
    revalidate: 60,
    fn: async () => {
      const rows = await prisma.media.findMany({
        distinct: ["folder"],
        select: { folder: true },
      });
      const names = new Set<string>([DEFAULT_MEDIA_FOLDER, "archived"]);
      for (const row of rows) {
        if (row.folder) {
          names.add(row.folder);
        }
      }
      return [...names].sort();
    },
  });
}

export async function getAdminMedia(id: string): Promise<AdminMediaRecord | null> {
  const row = await prisma.media.findUnique({
    where: { id },
    select: adminMediaSelect,
  });
  return row ? mapAdminMedia(row) : null;
}
