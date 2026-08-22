"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { ActionError, CONTENT_ROLES, createAction } from "./_helpers";
import { normalizePath } from "./_redirects";
import { notFound } from "./_resource";

const redirectCreateSchema = z.object({
  source: z.string().trim().min(1).max(500),
  destination: z.string().trim().min(1).max(500),
  type: z.enum(["PERMANENT", "TEMPORARY"]).optional(),
  note: z.string().max(300).optional(),
});

const redirectUpdateSchema = redirectCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const createRedirect = createAction({
  input: redirectCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.create", entityType: "redirect", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const source = normalizePath(input.source);
    const destination = normalizePath(input.destination);
    if (source === destination) {
      throw new ActionError("Source and destination must differ.");
    }
    return prisma.redirect.create({
      data: {
        source,
        destination,
        type: input.type ?? "PERMANENT",
        note: input.note,
      },
      select: { id: true, source: true, destination: true },
    });
  },
});

export const updateRedirect = createAction({
  input: redirectUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.update", entityType: "redirect", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.redirect.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Redirect");
    }
    return prisma.redirect.update({
      where: { id: existing.id },
      data: {
        source: input.source ? normalizePath(input.source) : undefined,
        destination: input.destination ? normalizePath(input.destination) : undefined,
        type: input.type,
        note: input.note,
      },
      select: { id: true, source: true, destination: true },
    });
  },
});

export const deleteRedirect = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.delete", entityType: "redirect", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.redirect.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Redirect");
    }
    return prisma.redirect.update({
      where: { id: existing.id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  },
});

export const duplicateRedirect = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.duplicate", entityType: "redirect", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.redirect.findUnique({
      where: { id: input.id },
    });
    if (!existing) {
      notFound("Redirect");
    }
    return prisma.redirect.create({
      data: {
        source: `${existing.source}-copy`,
        destination: existing.destination,
        type: existing.type,
        note: existing.note,
        isActive: false,
      },
      select: { id: true, source: true, destination: true },
    });
  },
});

export const toggleRedirectStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.toggleStatus", entityType: "redirect", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.redirect.findUnique({
      where: { id: input.id },
      select: { id: true, isActive: true },
    });
    if (!existing) {
      notFound("Redirect");
    }
    return prisma.redirect.update({
      where: { id: existing.id },
      data: { isActive: !existing.isActive },
      select: { id: true, isActive: true },
    });
  },
});

export const reorderRedirects = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.reorder", entityType: "redirect", entityId: () => "batch" },
  handler: async () => {
    throw new ActionError("Redirects have no sort order.");
  },
});

export const bulkUpdateRedirectStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    isActive: z.boolean(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.bulkUpdateStatus", entityType: "redirect", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.redirect.updateMany({
      where: { id: { in: input.ids } },
      data: { isActive: input.isActive },
    });
    return { count: result.count };
  },
});

export const bulkDeleteRedirects = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "redirect.bulkDelete", entityType: "redirect", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.redirect.updateMany({
      where: { id: { in: input.ids } },
      data: { isActive: false },
    });
    return { count: result.count };
  },
});
