"use server";

import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, jsonValueSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { ActionError, ADMIN_ROLES, createAction } from "./_helpers";
import { notFound } from "./_resource";

const settingCreateSchema = z.object({
  key: z.string().trim().min(1).max(120),
  group: z.string().trim().min(1).max(80),
  value: jsonValueSchema,
});

const settingUpdateSchema = settingCreateSchema.partial().extend({
  id: z.string().min(1).optional(),
  key: z.string().trim().min(1).max(120).optional(),
});

export const createSetting = createAction({
  input: settingCreateSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.create", entityType: "setting", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    return prisma.siteSetting.create({
      data: {
        key: input.key,
        group: input.group,
        value: (input.value ?? {}) as Prisma.InputJsonValue,
      },
      select: { id: true, key: true },
    });
  },
});

export const updateSetting = createAction({
  input: settingUpdateSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.update", entityType: "setting", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = input.id
      ? await prisma.siteSetting.findUnique({ where: { id: input.id } })
      : input.key
        ? await prisma.siteSetting.findUnique({ where: { key: input.key } })
        : null;
    if (!existing) {
      notFound("Setting");
    }
    return prisma.siteSetting.update({
      where: { id: existing.id },
      data: {
        key: input.key,
        group: input.group,
        value: input.value as Prisma.InputJsonValue | undefined,
      },
      select: { id: true, key: true },
    });
  },
});

export const deleteSetting = createAction({
  input: idSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.delete", entityType: "setting", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.siteSetting.findUnique({
      where: { id: input.id },
      select: { id: true, key: true },
    });
    if (!existing) {
      notFound("Setting");
    }
    await prisma.siteSetting.delete({ where: { id: existing.id } });
    return { id: existing.id, key: existing.key };
  },
});

export const duplicateSetting = createAction({
  input: idSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.duplicate", entityType: "setting", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.siteSetting.findUnique({
      where: { id: input.id },
    });
    if (!existing) {
      notFound("Setting");
    }
    return prisma.siteSetting.create({
      data: {
        key: `${existing.key}.copy`,
        group: existing.group,
        value: (existing.value ?? {}) as Prisma.InputJsonValue,
      },
      select: { id: true, key: true },
    });
  },
});

export const toggleSettingStatus = createAction({
  input: idSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.toggleStatus", entityType: "setting", entityId: (i) => i.id },
  handler: async () => {
    throw new ActionError("Settings have no status flag.");
  },
});

export const reorderSettings = createAction({
  input: reorderSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.reorder", entityType: "setting", entityId: () => "batch" },
  handler: async () => {
    throw new ActionError("Settings have no sort order.");
  },
});

export const bulkUpdateSettingStatus = createAction({
  input: bulkIdsSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.bulkUpdateStatus", entityType: "setting", entityId: () => "batch" },
  handler: async () => {
    throw new ActionError("Settings have no status flag.");
  },
});

export const bulkDeleteSettings = createAction({
  input: bulkIdsSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.settings(), tags.global()],
  audit: { action: "setting.bulkDelete", entityType: "setting", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.siteSetting.deleteMany({
      where: { id: { in: input.ids } },
    });
    return { count: result.count };
  },
});
