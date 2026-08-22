"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { ActionError, CONTENT_ROLES, createAction } from "./_helpers";
import { notFound } from "./_resource";

const mediaCreateSchema = z.object({
  url: z.string().url(),
  pathname: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(120),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  folder: z.string().max(80).optional(),
  altEn: z.string().trim().min(1).max(200),
  altAr: z.string().trim().max(200).optional(),
  titleEn: z.string().max(200).optional(),
  titleAr: z.string().max(200).optional(),
});

const mediaUpdateSchema = mediaCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const createMedia = createAction({
  input: mediaCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "media.create", entityType: "media", entityId: (_i, r) => r.id },
  handler: async ({ input, user }) => {
    return prisma.media.create({
      data: {
        url: input.url,
        pathname: input.pathname,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        sizeBytes: input.sizeBytes,
        folder: input.folder ?? "uploads",
        uploadedById: user?.id,
        translations: {
          create: [
            { locale: "EN", alt: input.altEn, title: input.titleEn },
            {
              locale: "AR",
              alt: input.altAr ?? input.altEn,
              title: input.titleAr ?? input.titleEn,
            },
          ],
        },
      },
      select: { id: true, url: true, pathname: true },
    });
  },
});

export const updateMedia = createAction({
  input: mediaUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
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
        folder: input.folder,
      },
      select: { id: true, url: true, pathname: true },
    });
    if (input.altEn || input.titleEn) {
      await prisma.mediaTranslation.upsert({
        where: { mediaId_locale: { mediaId: existing.id, locale: "EN" } },
        create: {
          mediaId: existing.id,
          locale: "EN",
          alt: input.altEn ?? "",
          title: input.titleEn,
        },
        update: { alt: input.altEn, title: input.titleEn },
      });
    }
    if (input.altAr || input.titleAr) {
      await prisma.mediaTranslation.upsert({
        where: { mediaId_locale: { mediaId: existing.id, locale: "AR" } },
        create: {
          mediaId: existing.id,
          locale: "AR",
          alt: input.altAr ?? input.altEn ?? "",
          title: input.titleAr,
        },
        update: { alt: input.altAr, title: input.titleAr },
      });
    }
    return row;
  },
});

export const deleteMedia = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "media.delete", entityType: "media", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.media.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Media");
    }
    try {
      await prisma.media.delete({ where: { id: existing.id } });
    } catch {
      throw new ActionError("Media is in use and cannot be deleted.", "CONFLICT");
    }
    return { id: existing.id };
  },
});

export const duplicateMedia = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
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
  revalidate: () => [tags.global()],
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
  revalidate: () => [tags.global()],
  audit: { action: "media.reorder", entityType: "media", entityId: () => "batch" },
  handler: async () => {
    throw new ActionError("Media items are ordered by upload date.");
  },
});

export const bulkUpdateMediaStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    folder: z.string().min(1).max(80),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "media.bulkUpdateStatus", entityType: "media", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.media.updateMany({
      where: { id: { in: input.ids } },
      data: { folder: input.folder },
    });
    return { count: result.count };
  },
});

export const bulkDeleteMedia = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "media.bulkDelete", entityType: "media", entityId: () => "batch" },
  handler: async ({ input }) => {
    let count = 0;
    for (const id of input.ids) {
      try {
        await prisma.media.delete({ where: { id } });
        count += 1;
      } catch {
        // Skip files still referenced by catalogue rows.
      }
    }
    return { count };
  },
});
