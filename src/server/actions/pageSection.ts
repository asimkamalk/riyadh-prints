"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, jsonValueSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction } from "./_resource";

const sectionTypeSchema = z.enum([
  "HERO",
  "USP_GRID",
  "SERVICE_GRID",
  "CATEGORY_GRID",
  "FEATURED_PRODUCTS",
  "RICH_TEXT",
  "IMAGE_TEXT",
  "STATS",
  "TESTIMONIALS",
  "PARTNERS",
  "CTA_BANNER",
  "FAQ",
  "GALLERY",
  "PRICING_TABLE",
  "STEPS",
  "VIDEO",
  "CONTACT_FORM",
]);

const sectionCreateSchema = z.object({
  type: sectionTypeSchema,
  pageId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
  postId: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  settings: jsonValueSchema.optional(),
  dataEn: jsonValueSchema.optional(),
  dataAr: jsonValueSchema.optional(),
});

const sectionUpdateSchema = sectionCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const createPageSection = createAction({
  input: sectionCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.create", entityType: "section", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const row = await prisma.section.create({
      data: {
        type: input.type,
        pageId: input.pageId,
        serviceId: input.serviceId,
        productId: input.productId,
        projectId: input.projectId,
        postId: input.postId,
        sortOrder: input.sortOrder ?? 0,
        settings: input.settings ?? {},
        translations: {
          create: [
            { locale: "EN", data: input.dataEn ?? {} },
            { locale: "AR", data: input.dataAr ?? input.dataEn ?? {} },
          ],
        },
      },
      select: { id: true, type: true, pageId: true },
    });
    return row;
  },
});

export const updatePageSection = createAction({
  input: sectionUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.update", entityType: "section", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Section");
    }
    const row = await prisma.section.update({
      where: { id: existing.id },
      data: {
        type: input.type,
        sortOrder: input.sortOrder,
        settings: input.settings ?? undefined,
        pageId: input.pageId,
        serviceId: input.serviceId,
        productId: input.productId,
        projectId: input.projectId,
        postId: input.postId,
      },
      select: { id: true, type: true },
    });
    if (input.dataEn !== undefined) {
      await prisma.sectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: existing.id, locale: "EN" } },
        create: { sectionId: existing.id, locale: "EN", data: input.dataEn ?? {} },
        update: { data: input.dataEn ?? {} },
      });
    }
    if (input.dataAr !== undefined) {
      await prisma.sectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: existing.id, locale: "AR" } },
        create: { sectionId: existing.id, locale: "AR", data: input.dataAr ?? {} },
        update: { data: input.dataAr ?? {} },
      });
    }
    return row;
  },
});

export const deletePageSection = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.delete", entityType: "section", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Section");
    }
    await prisma.section.update({
      where: { id: existing.id },
      data: { isVisible: false },
    });
    return { id: existing.id };
  },
});

export const duplicatePageSection = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.duplicate", entityType: "section", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Section");
    }
    return prisma.section.create({
      data: {
        type: existing.type,
        pageId: existing.pageId,
        serviceId: existing.serviceId,
        productId: existing.productId,
        projectId: existing.projectId,
        postId: existing.postId,
        sortOrder: existing.sortOrder + 1,
        settings: existing.settings ?? {},
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            data: row.data ?? {},
          })),
        },
      },
      select: { id: true, type: true },
    });
  },
});

export const togglePageSectionStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.toggleStatus", entityType: "section", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      select: { id: true, isVisible: true },
    });
    if (!existing) {
      notFound("Section");
    }
    return prisma.section.update({
      where: { id: existing.id },
      data: { isVisible: !existing.isVisible },
      select: { id: true, isVisible: true },
    });
  },
});

export const reorderPageSections = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.reorder", entityType: "section", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.section.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdatePageSectionStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    isVisible: z.boolean(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.bulkUpdateStatus", entityType: "section", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.section.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: input.isVisible },
    });
    return { count: result.count };
  },
});

export const bulkDeletePageSections = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "pageSection.bulkDelete", entityType: "section", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.section.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: false },
    });
    return { count: result.count };
  },
});
