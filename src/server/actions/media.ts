"use server";

import { tags } from "@/lib/cache-tags";
import { sanitizeFolder } from "@/lib/media-types";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import {
  mediaCreateSchema,
  mediaMoveSchema,
  mediaUpdateSchema,
} from "@/lib/validations/media";
import { prisma } from "@/server/db";
import { deleteStoredBlob } from "@/server/media/store";
import { getAdminMedia } from "@/server/queries/media";
import { getMediaUsages } from "@/server/queries/media-usages";

import { ActionError, CONTENT_ROLES, createAction } from "./_helpers";
import { notFound } from "./_resource";

const mediaTags = () => [tags.media(), tags.global()];
const READ_ROLES = ["ADMIN", "EDITOR", "VIEWER"] as const;

export const listMediaUsages = createAction({
  input: idSchema,
  roles: READ_ROLES,
  revalidate: () => [],
  audit: false,
  touchSitemap: false,
  handler: async ({ input }) => getMediaUsages(input.id),
});

export const createMedia = createAction({
  input: mediaCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.create", entityType: "media", entityId: (_i, r) => r.id },
  handler: async ({ input, user }) => {
    const row = await prisma.media.create({
      data: {
        url: input.url,
        pathname: input.pathname,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        sizeBytes: input.sizeBytes,
        folder: sanitizeFolder(input.folder),
        uploadedById: user?.id,
        translations: {
          create: [
            {
              locale: "EN",
              alt: input.altEn,
              title: input.titleEn,
              caption: input.captionEn,
            },
            {
              locale: "AR",
              alt: input.altAr ?? input.altEn,
              title: input.titleAr ?? input.titleEn,
              caption: input.captionAr ?? input.captionEn,
            },
          ],
        },
      },
      select: { id: true, url: true, pathname: true },
    });
    return row;
  },
});

export const updateMedia = createAction({
  input: mediaUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.update", entityType: "media", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.media.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Media");
    }
    const row = await prisma.media.update({
      where: { id: existing.id },
      data: {
        url: input.url,
        pathname: input.pathname,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        sizeBytes: input.sizeBytes,
        folder: input.folder ? sanitizeFolder(input.folder) : undefined,
      },
      select: { id: true, url: true, pathname: true },
    });
    await upsertTranslation(existing.id, "EN", {
      alt: input.altEn,
      title: input.titleEn,
      caption: input.captionEn,
    });
    await upsertTranslation(existing.id, "AR", {
      alt: input.altAr,
      title: input.titleAr,
      caption: input.captionAr,
    });
    const fresh = await getAdminMedia(existing.id);
    return fresh ?? row;
  },
});

export const deleteMedia = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.delete", entityType: "media", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.media.findUnique({
      where: { id: input.id },
      select: { id: true, url: true, provider: true },
    });
    if (!existing) {
      notFound("Media");
    }
    const usages = await getMediaUsages(existing.id);
    if (usages.length > 0) {
      throw new ActionError(
        `This file is used in ${usages.length} place${usages.length === 1 ? "" : "s"} and cannot be deleted.`,
        "CONFLICT",
      );
    }
    try {
      await prisma.media.delete({ where: { id: existing.id } });
    } catch {
      throw new ActionError("Media is in use and cannot be deleted.", "CONFLICT");
    }
    await deleteStoredBlob(existing);
    return { id: existing.id };
  },
});

export const duplicateMedia = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.duplicate", entityType: "media", entityId: (_i, r) => r.id },
  handler: async ({ input, user }) => {
    const existing = await prisma.media.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Media");
    }
    return prisma.media.create({
      data: {
        url: existing.url,
        pathname: `${existing.pathname}-copy`,
        mimeType: existing.mimeType,
        width: existing.width,
        height: existing.height,
        sizeBytes: existing.sizeBytes,
        folder: existing.folder,
        uploadedById: user?.id,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            alt: row.alt,
            title: row.title,
            caption: row.caption,
          })),
        },
      },
      select: { id: true, url: true, pathname: true },
    });
  },
});

export const toggleMediaStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.toggleStatus", entityType: "media", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.media.findUnique({
      where: { id: input.id },
      select: { id: true, folder: true },
    });
    if (!existing) {
      notFound("Media");
    }
    const archived = existing.folder === "archived";
    return prisma.media.update({
      where: { id: existing.id },
      data: { folder: archived ? "uploads" : "archived" },
      select: { id: true, folder: true },
    });
  },
});

export const reorderMedia = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.reorder", entityType: "media", entityId: () => "batch" },
  handler: async () => {
    throw new ActionError("Media items are ordered by upload date.");
  },
});

export const bulkUpdateMediaStatus = createAction({
  input: mediaMoveSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.bulkUpdateStatus", entityType: "media", entityId: () => "batch" },
  handler: async ({ input }) => {
    const folder = sanitizeFolder(input.folder);
    const result = await prisma.media.updateMany({
      where: { id: { in: input.ids } },
      data: { folder },
    });
    return { count: result.count, folder };
  },
});

export const bulkDeleteMedia = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => mediaTags(),
  touchSitemap: false,
  audit: { action: "media.bulkDelete", entityType: "media", entityId: () => "batch" },
  handler: async ({ input }) => {
    let count = 0;
    let skipped = 0;
    for (const id of input.ids) {
      const existing = await prisma.media.findUnique({
        where: { id },
        select: { id: true, url: true, provider: true },
      });
      if (!existing) {
        skipped += 1;
        continue;
      }
      const usages = await getMediaUsages(existing.id);
      if (usages.length > 0) {
        skipped += 1;
        continue;
      }
      try {
        await prisma.media.delete({ where: { id: existing.id } });
        await deleteStoredBlob(existing);
        count += 1;
      } catch {
        skipped += 1;
      }
    }
    return { count, skipped };
  },
});

async function upsertTranslation(
  mediaId: string,
  locale: "EN" | "AR",
  fields: { alt?: string; title?: string; caption?: string },
) {
  if (fields.alt === undefined && fields.title === undefined && fields.caption === undefined) {
    return;
  }
  await prisma.mediaTranslation.upsert({
    where: { mediaId_locale: { mediaId, locale } },
    create: {
      mediaId,
      locale,
      alt: fields.alt ?? "",
      title: fields.title,
      caption: fields.caption,
    },
    update: {
      ...(fields.alt !== undefined ? { alt: fields.alt } : {}),
      ...(fields.title !== undefined ? { title: fields.title } : {}),
      ...(fields.caption !== undefined ? { caption: fields.caption } : {}),
    },
  });
}
