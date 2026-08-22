"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction } from "./_resource";

const statCreateSchema = z.object({
  value: z.string().trim().min(1).max(40),
  prefix: z.string().max(20).optional(),
  suffix: z.string().max(20).optional(),
  iconName: z.string().max(60).optional(),
  labelEn: z.string().trim().min(1).max(120),
  labelAr: z.string().trim().max(120).optional(),
  sortOrder: z.number().int().optional(),
});

const statUpdateSchema = statCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const createStat = createAction({
  input: statCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.create", entityType: "stat", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    return prisma.stat.create({
      data: {
        value: input.value,
        prefix: input.prefix,
        suffix: input.suffix,
        iconName: input.iconName,
        sortOrder: input.sortOrder ?? 0,
        translations: {
          create: [
            { locale: "EN", label: input.labelEn },
            { locale: "AR", label: input.labelAr ?? input.labelEn },
          ],
        },
      },
      select: { id: true, value: true },
    });
  },
});

export const updateStat = createAction({
  input: statUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.update", entityType: "stat", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.stat.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Stat");
    }
    const row = await prisma.stat.update({
      where: { id: existing.id },
      data: {
        value: input.value,
        prefix: input.prefix,
        suffix: input.suffix,
        iconName: input.iconName,
        sortOrder: input.sortOrder,
      },
      select: { id: true, value: true },
    });
    if (input.labelEn) {
      await prisma.statTranslation.upsert({
        where: { statId_locale: { statId: existing.id, locale: "EN" } },
        create: { statId: existing.id, locale: "EN", label: input.labelEn },
        update: { label: input.labelEn },
      });
    }
    if (input.labelAr) {
      await prisma.statTranslation.upsert({
        where: { statId_locale: { statId: existing.id, locale: "AR" } },
        create: { statId: existing.id, locale: "AR", label: input.labelAr },
        update: { label: input.labelAr },
      });
    }
    return row;
  },
});

export const deleteStat = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.delete", entityType: "stat", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.stat.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Stat");
    }
    await prisma.stat.delete({ where: { id: existing.id } });
    return { id: existing.id };
  },
});

export const duplicateStat = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.duplicate", entityType: "stat", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.stat.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Stat");
    }
    return prisma.stat.create({
      data: {
        value: existing.value,
        prefix: existing.prefix,
        suffix: existing.suffix,
        iconName: existing.iconName,
        sortOrder: existing.sortOrder + 1,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            label: row.label,
          })),
        },
      },
      select: { id: true, value: true },
    });
  },
});

export const toggleStatStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.toggleStatus", entityType: "stat", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.stat.findUnique({
      where: { id: input.id },
      select: { id: true, value: true },
    });
    if (!existing) {
      notFound("Stat");
    }
    return { id: existing.id, value: existing.value };
  },
});

export const reorderStats = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.reorder", entityType: "stat", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.stat.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateStatStatus = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.bulkUpdateStatus", entityType: "stat", entityId: () => "batch" },
  handler: async ({ input }) => ({ count: input.ids.length }),
});

export const bulkDeleteStats = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "stat.bulkDelete", entityType: "stat", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.stat.deleteMany({ where: { id: { in: input.ids } } });
    return { count: result.count };
  },
});
