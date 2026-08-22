"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { defaultsFor, isSectionType, sectionTypeSchema } from "@/lib/sections/catalog";
import { bulkIdsSchema, idSchema, jsonValueSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";
import { toInputJson } from "@/server/actions/_resource";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction } from "./_resource";

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

function sectionTags(_input: unknown, result: { slug?: string }) {
  return [tags.pages(), tags.global(), ...(result.slug ? [tags.page(result.slug)] : [])];
}

async function slugForSection(id: string): Promise<string> {
  const row = await prisma.section.findUnique({
    where: { id },
    select: { page: { select: { slug: true } } },
  });
  return row?.page?.slug ?? "";
}

async function slugForPage(pageId?: string | null): Promise<string> {
  if (!pageId) {
    return "";
  }
  const row = await prisma.page.findUnique({ where: { id: pageId }, select: { slug: true } });
  return row?.slug ?? "";
}

export const createPageSection = createAction({
  input: sectionCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.create", entityType: "section", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const defaults = isSectionType(input.type) ? defaultsFor(input.type) : { data: {}, settings: {} };
    const max = input.pageId
      ? await prisma.section.aggregate({
          where: { pageId: input.pageId },
          _max: { sortOrder: true },
        })
      : { _max: { sortOrder: null } };
    const sortOrder = input.sortOrder ?? (max._max.sortOrder ?? -1) + 1;
    const row = await prisma.section.create({
      data: {
        type: input.type,
        pageId: input.pageId,
        serviceId: input.serviceId,
        productId: input.productId,
        projectId: input.projectId,
        postId: input.postId,
        sortOrder,
        settings: toInputJson(input.settings ?? defaults.settings),
        translations: {
          create: [
            { locale: "EN", data: toInputJson(input.dataEn ?? defaults.data) },
            { locale: "AR", data: toInputJson(input.dataAr ?? input.dataEn ?? defaults.data) },
          ],
        },
      },
      select: { id: true, type: true, pageId: true },
    });
    return { ...row, slug: await slugForPage(row.pageId) };
  },
});

export const updatePageSection = createAction({
  input: sectionUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.update", entityType: "section", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      select: { id: true, page: { select: { slug: true } } },
    });
    if (!existing) {
      notFound("Section");
    }
    const row = await prisma.section.update({
      where: { id: existing.id },
      data: {
        type: input.type,
        sortOrder: input.sortOrder,
        settings: input.settings !== undefined ? toInputJson(input.settings) : undefined,
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
        create: { sectionId: existing.id, locale: "EN", data: toInputJson(input.dataEn ?? {}) },
        update: { data: toInputJson(input.dataEn ?? {}) },
      });
    }
    if (input.dataAr !== undefined) {
      await prisma.sectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: existing.id, locale: "AR" } },
        create: { sectionId: existing.id, locale: "AR", data: toInputJson(input.dataAr ?? {}) },
        update: { data: toInputJson(input.dataAr ?? {}) },
      });
    }
    return { ...row, slug: existing.page?.slug ?? "" };
  },
});

export const deletePageSection = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.delete", entityType: "section", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      select: { id: true, page: { select: { slug: true } } },
    });
    if (!existing) {
      notFound("Section");
    }
    await prisma.section.delete({ where: { id: existing.id } });
    return { id: existing.id, slug: existing.page?.slug ?? "" };
  },
});

export const duplicatePageSection = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.duplicate", entityType: "section", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Section");
    }
    const nextOrder = existing.sortOrder + 1;
    if (existing.pageId) {
      await prisma.section.updateMany({
        where: { pageId: existing.pageId, sortOrder: { gte: nextOrder } },
        data: { sortOrder: { increment: 1 } },
      });
    }
    const created = await prisma.section.create({
      data: {
        type: existing.type,
        pageId: existing.pageId,
        serviceId: existing.serviceId,
        productId: existing.productId,
        projectId: existing.projectId,
        postId: existing.postId,
        sortOrder: nextOrder,
        settings: existing.settings ?? {},
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            data: row.data ?? {},
          })),
        },
      },
      select: { id: true, type: true, pageId: true },
    });
    return { ...created, slug: await slugForPage(created.pageId) };
  },
});

export const togglePageSectionStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.toggleStatus", entityType: "section", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.section.findUnique({
      where: { id: input.id },
      select: { id: true, isVisible: true, page: { select: { slug: true } } },
    });
    if (!existing) {
      notFound("Section");
    }
    const row = await prisma.section.update({
      where: { id: existing.id },
      data: { isVisible: !existing.isVisible },
      select: { id: true, isVisible: true },
    });
    return { ...row, slug: existing.page?.slug ?? "" };
  },
});

export const reorderPageSections = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.reorder", entityType: "section", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.section.update({ where: { id }, data: { sortOrder } }),
    );
    const slug = input.items[0] ? await slugForSection(input.items[0].id) : "";
    return { count: input.items.length, slug };
  },
});

export const bulkUpdatePageSectionStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    isVisible: z.boolean(),
  }),
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.bulkUpdateStatus", entityType: "section", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.section.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: input.isVisible },
    });
    const slug = input.ids[0] ? await slugForSection(input.ids[0]) : "";
    return { count: result.count, slug };
  },
});

export const bulkDeletePageSections = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: sectionTags,
  audit: { action: "pageSection.bulkDelete", entityType: "section", entityId: () => "batch" },
  handler: async ({ input }) => {
    const slug = input.ids[0] ? await slugForSection(input.ids[0]) : "";
    const result = await prisma.section.deleteMany({
      where: { id: { in: input.ids } },
    });
    return { count: result.count, slug };
  },
});
