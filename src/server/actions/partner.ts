"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction } from "./_resource";

const partnerCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().max(120).optional(),
  websiteUrl: z.string().url().optional(),
  logoId: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

const partnerUpdateSchema = partnerCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const createPartner = createAction({
  input: partnerCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.create", entityType: "partner", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    return prisma.partner.create({
      data: {
        name: input.name,
        websiteUrl: input.websiteUrl,
        logoId: input.logoId,
        sortOrder: input.sortOrder ?? 0,
        translations: {
          create: [
            { locale: "EN", name: input.name },
            { locale: "AR", name: input.nameAr ?? input.name },
          ],
        },
      },
      select: { id: true, name: true },
    });
  },
});

export const updatePartner = createAction({
  input: partnerUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.update", entityType: "partner", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.partner.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Partner");
    }
    const row = await prisma.partner.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        websiteUrl: input.websiteUrl,
        logoId: input.logoId,
        sortOrder: input.sortOrder,
      },
      select: { id: true, name: true },
    });
    if (input.name) {
      await prisma.partnerTranslation.upsert({
        where: { partnerId_locale: { partnerId: existing.id, locale: "EN" } },
        create: { partnerId: existing.id, locale: "EN", name: input.name },
        update: { name: input.name },
      });
    }
    if (input.nameAr) {
      await prisma.partnerTranslation.upsert({
        where: { partnerId_locale: { partnerId: existing.id, locale: "AR" } },
        create: { partnerId: existing.id, locale: "AR", name: input.nameAr },
        update: { name: input.nameAr },
      });
    }
    return row;
  },
});

export const deletePartner = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.delete", entityType: "partner", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.partner.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Partner");
    }
    return prisma.partner.update({
      where: { id: existing.id },
      data: { isVisible: false },
      select: { id: true, isVisible: true },
    });
  },
});

export const duplicatePartner = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.duplicate", entityType: "partner", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.partner.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Partner");
    }
    return prisma.partner.create({
      data: {
        name: `${existing.name} (copy)`,
        websiteUrl: existing.websiteUrl,
        logoId: existing.logoId,
        sortOrder: existing.sortOrder + 1,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            name: `${row.name} (copy)`,
          })),
        },
      },
      select: { id: true, name: true },
    });
  },
});

export const togglePartnerStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.toggleStatus", entityType: "partner", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.partner.findUnique({
      where: { id: input.id },
      select: { id: true, isVisible: true },
    });
    if (!existing) {
      notFound("Partner");
    }
    return prisma.partner.update({
      where: { id: existing.id },
      data: { isVisible: !existing.isVisible },
      select: { id: true, isVisible: true },
    });
  },
});

export const reorderPartners = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.reorder", entityType: "partner", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.partner.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdatePartnerStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    isVisible: z.boolean(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.bulkUpdateStatus", entityType: "partner", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.partner.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: input.isVisible },
    });
    return { count: result.count };
  },
});

export const bulkDeletePartners = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "partner.bulkDelete", entityType: "partner", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.partner.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: false },
    });
    return { count: result.count };
  },
});
