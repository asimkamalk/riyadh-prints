"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import {
  bulkIdsSchema,
  bulkStatusSchema,
  contentStatusSchema,
  idSchema,
  reorderSchema,
  translationCopySchema,
} from "@/lib/validations/common";
import { categoryMoveSchema, categorySaveSchema } from "@/lib/validations/category";
import { emptyToNull } from "@/server/catalogue/seo-write";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction, ActionError } from "./_helpers";
import { redirectOnPublishedSlugChange } from "./_redirects";
import { copySuffix, nextStatus, notFound, reorderTransaction } from "./_resource";
import { generateUniqueSlug } from "./_slug";
import {
  categoryTranslationData,
  parentWouldCycle,
} from "@/server/catalogue/category-write";

const categoryKindSchema = z.enum([
  "PRODUCT",
  "POST",
  "PORTFOLIO",
  "SERVICE",
  "PAGE",
]);

const categoryCreateSchema = translationCopySchema.extend({
  kind: categoryKindSchema.default("PRODUCT"),
  parentId: z.string().min(1).nullable().optional(),
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  iconName: z.string().max(60).optional(),
  imageId: z.string().min(1).optional(),
});

const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string().min(1),
});

function categoryTags(slug: string) {
  return [tags.category(slug), tags.categories(), tags.search(), tags.global()];
}

export const createCategory = createAction({
  input: categoryCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: {
    action: "category.create",
    entityType: "category",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug(
      "category",
      "en",
      input.slugEn ?? input.nameEn,
    );
    const slugAr = await generateUniqueSlug(
      "category",
      "ar",
      input.slugAr ?? input.nameAr ?? input.nameEn,
    );
    return prisma.category.create({
      data: {
        slug,
        kind: input.kind,
        parentId: input.parentId ?? undefined,
        status: input.status ?? "DRAFT",
        isFeatured: input.isFeatured ?? false,
        iconName: input.iconName,
        imageId: input.imageId,
        translations: {
          create: [
            {
              locale: "EN",
              name: input.nameEn,
              slug,
              shortDescription: input.shortEn,
            },
            {
              locale: "AR",
              name: input.nameAr ?? input.nameEn,
              slug: slugAr,
              shortDescription: input.shortAr ?? input.shortEn,
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true, kind: true },
    });
  },
});

export const updateCategory = createAction({
  input: categoryUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: {
    action: "category.update",
    entityType: "category",
    entityId: (i) => i.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.category.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        kind: true,
        translations: { select: { locale: true, slug: true, name: true } },
      },
    });
    if (!existing) {
      notFound("Category");
    }
    const nextSlug =
      input.slugEn || input.nameEn
        ? await generateUniqueSlug(
            "category",
            "en",
            input.slugEn ?? input.nameEn ?? existing.slug,
            existing.id,
          )
        : existing.slug;
    const published = (input.status ?? existing.status) === "PUBLISHED";
    if (nextSlug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "category",
        oldSlug: existing.slug,
        newSlug: nextSlug,
        locale: "en",
        kind: existing.kind,
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    let nextAr = ar?.slug;
    if (input.slugAr || input.nameAr) {
      nextAr = await generateUniqueSlug(
        "category",
        "ar",
        input.slugAr ?? input.nameAr ?? ar?.name ?? existing.slug,
        existing.id,
      );
      if (ar && nextAr !== ar.slug) {
        await redirectOnPublishedSlugChange({
          published,
          entityType: "category",
          oldSlug: ar.slug,
          newSlug: nextAr,
          locale: "ar",
          kind: existing.kind,
        });
      }
    }
    const row = await prisma.category.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
        kind: input.kind,
        parentId: input.parentId,
        status: input.status,
        isFeatured: input.isFeatured,
        iconName: input.iconName,
        imageId: input.imageId,
      },
      select: { id: true, slug: true, status: true, kind: true },
    });
    if (input.nameEn || input.shortEn || input.slugEn) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: existing.id, locale: "EN" } },
        create: {
          categoryId: existing.id,
          locale: "EN",
          name: input.nameEn ?? existing.slug,
          slug: nextSlug,
          shortDescription: input.shortEn,
        },
        update: {
          name: input.nameEn,
          slug: nextSlug,
          shortDescription: input.shortEn,
        },
      });
    }
    if (input.nameAr || input.shortAr || nextAr) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: existing.id, locale: "AR" } },
        create: {
          categoryId: existing.id,
          locale: "AR",
          name: input.nameAr ?? input.nameEn ?? existing.slug,
          slug: nextAr ?? nextSlug,
          shortDescription: input.shortAr,
        },
        update: { name: input.nameAr, slug: nextAr, shortDescription: input.shortAr },
      });
    }
    return row;
  },
});

export const deleteCategory = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: { action: "category.delete", entityType: "category", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.category.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      notFound("Category");
    }
    return prisma.category.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const duplicateCategory = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: {
    action: "category.duplicate",
    entityType: "category",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.category.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Category");
    }
    const slug = await generateUniqueSlug("category", "en", copySuffix(existing.slug));
    const en = existing.translations.find((row) => row.locale === "EN");
    const ar = existing.translations.find((row) => row.locale === "AR");
    return prisma.category.create({
      data: {
        slug,
        kind: existing.kind,
        parentId: existing.parentId,
        status: "DRAFT",
        iconName: existing.iconName,
        translations: {
          create: [
            { locale: "EN", name: `${en?.name ?? slug} (copy)`, slug },
            {
              locale: "AR",
              name: `${ar?.name ?? slug} (نسخة)`,
              slug: await generateUniqueSlug("category", "ar", copySuffix(ar?.slug ?? slug)),
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const toggleCategoryStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: {
    action: "category.toggleStatus",
    entityType: "category",
    entityId: (i) => i.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.category.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, status: true },
    });
    if (!existing) {
      notFound("Category");
    }
    return prisma.category.update({
      where: { id: existing.id },
      data: { status: nextStatus(existing.status) },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const reorderCategories = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.categories(), tags.global()],
  audit: { action: "category.reorder", entityType: "category", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.category.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateCategoryStatus = createAction({
  input: bulkStatusSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.categories(), tags.global()],
  audit: {
    action: "category.bulkUpdateStatus",
    entityType: "category",
    entityId: () => "batch",
  },
  handler: async ({ input }) => {
    const result = await prisma.category.updateMany({
      where: { id: { in: input.ids } },
      data: { status: input.status },
    });
    return { count: result.count };
  },
});

export const bulkDeleteCategories = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.categories(), tags.global()],
  audit: { action: "category.bulkDelete", entityType: "category", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.category.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "ARCHIVED" },
    });
    return { count: result.count };
  },
});

export const toggleCategoryFeatured = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: {
    action: "category.toggleFeatured",
    entityType: "category",
    entityId: (i) => i.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.category.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, isFeatured: true },
    });
    if (!existing) {
      notFound("Category");
    }
    return prisma.category.update({
      where: { id: existing.id },
      data: { isFeatured: !existing.isFeatured },
      select: { id: true, slug: true, isFeatured: true },
    });
  },
});

export const moveCategory = createAction({
  input: categoryMoveSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: {
    action: "category.move",
    entityType: "category",
    entityId: (i) => i.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.category.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      notFound("Category");
    }
    if (await parentWouldCycle(existing.id, input.parentId)) {
      throw new ActionError("A category cannot be nested under itself.", "INVALID");
    }
    return prisma.category.update({
      where: { id: existing.id },
      data: { parentId: input.parentId, sortOrder: input.sortOrder },
      select: { id: true, slug: true },
    });
  },
});

export const saveCategory = createAction({
  input: categorySaveSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => categoryTags(r.slug),
  audit: {
    action: "category.save",
    entityType: "category",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input }) => {
    const parentId = input.parentId === undefined ? undefined : input.parentId;
    if (input.id && parentId && (await parentWouldCycle(input.id, parentId))) {
      throw new ActionError("A category cannot be nested under itself.", "INVALID");
    }
    const slug = await generateUniqueSlug(
      "category",
      "en",
      input.slugEn || input.nameEn,
      input.id,
    );
    const slugAr = await generateUniqueSlug(
      "category",
      "ar",
      input.slugAr || input.nameAr || input.nameEn,
      input.id,
    );
    const status = input.status ?? "DRAFT";
    const core = {
      slug,
      kind: input.kind ?? "PRODUCT",
      parentId,
      status,
      isFeatured: input.isFeatured ?? false,
      iconName: emptyToNull(input.iconName) ?? null,
      imageId: input.imageId === undefined ? undefined : input.imageId,
      sortOrder: input.sortOrder ?? 0,
    };

    if (!input.id) {
      return prisma.category.create({
        data: {
          ...core,
          translations: {
            create: [
              { locale: "EN", ...categoryTranslationData(input, "EN", slug) },
              { locale: "AR", ...categoryTranslationData(input, "AR", slugAr) },
            ],
          },
        },
        select: { id: true, slug: true, status: true },
      });
    }

    const existing = await prisma.category.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        kind: true,
        translations: { select: { locale: true, slug: true } },
      },
    });
    if (!existing) {
      notFound("Category");
    }
    const published = status === "PUBLISHED";
    const kind = input.kind ?? existing.kind;
    if (slug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "category",
        oldSlug: existing.slug,
        newSlug: slug,
        locale: "en",
        kind,
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    if (ar && slugAr !== ar.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "category",
        oldSlug: ar.slug,
        newSlug: slugAr,
        locale: "ar",
        kind,
      });
    }
    const row = await prisma.category.update({
      where: { id: existing.id },
      data: core,
      select: { id: true, slug: true, status: true },
    });
    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: existing.id, locale: "EN" } },
      create: {
        categoryId: existing.id,
        locale: "EN",
        ...categoryTranslationData(input, "EN", slug),
      },
      update: categoryTranslationData(input, "EN", slug),
    });
    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: existing.id, locale: "AR" } },
      create: {
        categoryId: existing.id,
        locale: "AR",
        ...categoryTranslationData(input, "AR", slugAr),
      },
      update: categoryTranslationData(input, "AR", slugAr),
    });
    return row;
  },
});
