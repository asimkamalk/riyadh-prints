"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction } from "./_resource";

const menuLocationSchema = z.enum([
  "HEADER",
  "FOOTER_INFO",
  "FOOTER_LINKS",
  "FOOTER_ABOUT",
  "MOBILE",
]);

const linkTypeSchema = z.enum([
  "INTERNAL",
  "EXTERNAL",
  "PAGE",
  "PRODUCT",
  "CATEGORY",
  "SERVICE",
  "POST",
  "PROJECT",
  "AUTHOR",
]);

const menuCreateSchema = z.object({
  location: menuLocationSchema,
  parentId: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  linkType: linkTypeSchema,
  targetId: z.string().min(1).optional(),
  externalUrl: z.string().url().optional(),
  internalPath: z.string().max(300).optional(),
  openInNewTab: z.boolean().optional(),
  iconName: z.string().max(60).optional(),
  isMegaMenu: z.boolean().optional(),
  highlight: z.boolean().optional(),
  labelEn: z.string().trim().min(1).max(120),
  labelAr: z.string().trim().max(120).optional(),
  descriptionEn: z.string().max(200).optional(),
  descriptionAr: z.string().max(200).optional(),
});

const menuUpdateSchema = menuCreateSchema.partial().extend({
  id: z.string().min(1),
  location: menuLocationSchema.optional(),
  linkType: linkTypeSchema.optional(),
  labelEn: z.string().trim().min(1).max(120).optional(),
});

function menuTags(location: string) {
  return [tags.menu(location), tags.global()];
}

export const createMenuItem = createAction({
  input: menuCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (input) => menuTags(input.location),
  audit: { action: "menu.create", entityType: "menuItem", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    return prisma.menuItem.create({
      data: {
        location: input.location,
        parentId: input.parentId,
        sortOrder: input.sortOrder ?? 0,
        linkType: input.linkType,
        targetId: input.targetId,
        externalUrl: input.externalUrl,
        internalPath: input.internalPath,
        openInNewTab: input.openInNewTab ?? false,
        iconName: input.iconName,
        isMegaMenu: input.isMegaMenu ?? false,
        highlight: input.highlight ?? false,
        translations: {
          create: [
            { locale: "EN", label: input.labelEn, description: input.descriptionEn },
            {
              locale: "AR",
              label: input.labelAr ?? input.labelEn,
              description: input.descriptionAr ?? input.descriptionEn,
            },
          ],
        },
      },
      select: { id: true, location: true },
    });
  },
});

export const updateMenuItem = createAction({
  input: menuUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => menuTags(r.location),
  audit: { action: "menu.update", entityType: "menuItem", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.menuItem.findUnique({
      where: { id: input.id },
      select: { id: true, location: true },
    });
    if (!existing) {
      notFound("Menu item");
    }
    const row = await prisma.menuItem.update({
      where: { id: existing.id },
      data: {
        location: input.location,
        parentId: input.parentId,
        sortOrder: input.sortOrder,
        linkType: input.linkType,
        targetId: input.targetId,
        externalUrl: input.externalUrl,
        internalPath: input.internalPath,
        openInNewTab: input.openInNewTab,
        iconName: input.iconName,
        isMegaMenu: input.isMegaMenu,
        highlight: input.highlight,
      },
      select: { id: true, location: true },
    });
    if (input.labelEn || input.descriptionEn) {
      await prisma.menuItemTranslation.upsert({
        where: { menuItemId_locale: { menuItemId: existing.id, locale: "EN" } },
        create: {
          menuItemId: existing.id,
          locale: "EN",
          label: input.labelEn ?? "",
          description: input.descriptionEn,
        },
        update: { label: input.labelEn, description: input.descriptionEn },
      });
    }
    if (input.labelAr || input.descriptionAr) {
      await prisma.menuItemTranslation.upsert({
        where: { menuItemId_locale: { menuItemId: existing.id, locale: "AR" } },
        create: {
          menuItemId: existing.id,
          locale: "AR",
          label: input.labelAr ?? input.labelEn ?? "",
          description: input.descriptionAr,
        },
        update: { label: input.labelAr, description: input.descriptionAr },
      });
    }
    return row;
  },
});

async function deleteMenuTree(id: string): Promise<void> {
  const children = await prisma.menuItem.findMany({
    where: { parentId: id },
    select: { id: true },
  });
  for (const child of children) {
    await deleteMenuTree(child.id);
  }
  await prisma.menuItem.delete({ where: { id } });
}

export const deleteMenuItem = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "menu.delete", entityType: "menuItem", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.menuItem.findUnique({
      where: { id: input.id },
      select: { id: true, location: true },
    });
    if (!existing) {
      notFound("Menu item");
    }
    await deleteMenuTree(existing.id);
    return { id: existing.id, location: existing.location };
  },
});

export const duplicateMenuItem = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => menuTags(r.location),
  audit: { action: "menu.duplicate", entityType: "menuItem", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.menuItem.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Menu item");
    }
    return prisma.menuItem.create({
      data: {
        location: existing.location,
        parentId: existing.parentId,
        sortOrder: existing.sortOrder + 1,
        linkType: existing.linkType,
        targetId: existing.targetId,
        externalUrl: existing.externalUrl,
        internalPath: existing.internalPath,
        openInNewTab: existing.openInNewTab,
        iconName: existing.iconName,
        isMegaMenu: existing.isMegaMenu,
        highlight: existing.highlight,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            label: `${row.label} (copy)`,
            description: row.description,
          })),
        },
      },
      select: { id: true, location: true },
    });
  },
});

export const toggleMenuItemStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => menuTags(r.location),
  audit: { action: "menu.toggleStatus", entityType: "menuItem", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.menuItem.findUnique({
      where: { id: input.id },
      select: { id: true, isVisible: true, location: true },
    });
    if (!existing) {
      notFound("Menu item");
    }
    return prisma.menuItem.update({
      where: { id: existing.id },
      data: { isVisible: !existing.isVisible },
      select: { id: true, isVisible: true, location: true },
    });
  },
});

export const reorderMenuItems = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "menu.reorder", entityType: "menuItem", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.menuItem.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateMenuItemStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    isVisible: z.boolean(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "menu.bulkUpdateStatus", entityType: "menuItem", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.menuItem.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: input.isVisible },
    });
    return { count: result.count };
  },
});

export const bulkDeleteMenuItems = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "menu.bulkDelete", entityType: "menuItem", entityId: () => "batch" },
  handler: async ({ input }) => {
    for (const id of input.ids) {
      const exists = await prisma.menuItem.findUnique({
        where: { id },
        select: { id: true },
      });
      if (exists) {
        await deleteMenuTree(id);
      }
    }
    return { count: input.ids.length };
  },
});
