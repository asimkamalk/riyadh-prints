"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import {
  bulkIdsSchema,
  bulkStatusSchema,
  contentStatusSchema,
  idSchema,
  jsonValueSchema,
  reorderSchema,
  translationCopySchema,
} from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { redirectOnPublishedSlugChange } from "./_redirects";
import { copySuffix, nextStatus, notFound, reorderTransaction } from "./_resource";
import { generateUniqueSlug } from "./_slug";

const serviceCreateSchema = translationCopySchema.extend({
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  iconName: z.string().max(60).optional(),
  categoryId: z.string().min(1).optional(),
  turnaroundTime: z.string().max(80).optional(),
  startingPrice: z.string().optional(),
  imageId: z.string().min(1).optional(),
  heroImageId: z.string().min(1).optional(),
  longEn: jsonValueSchema.optional(),
  longAr: jsonValueSchema.optional(),
});

const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  id: z.string().min(1),
});

function serviceTags(slug: string) {
  return [tags.service(slug), tags.services(), tags.search(), tags.global()];
}

export const createService = createAction({
  input: serviceCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => serviceTags(r.slug),
  audit: { action: "service.create", entityType: "service", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug("service", "en", input.slugEn ?? input.nameEn);
    const slugAr = await generateUniqueSlug(
      "service",
      "ar",
      input.slugAr ?? input.nameAr ?? input.nameEn,
    );
    return prisma.service.create({
      data: {
        slug,
        status: input.status ?? "DRAFT",
        isFeatured: input.isFeatured ?? false,
        iconName: input.iconName,
        categoryId: input.categoryId,
        turnaroundTime: input.turnaroundTime,
        startingPrice: input.startingPrice,
        imageId: input.imageId,
        heroImageId: input.heroImageId,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        translations: {
          create: [
            {
              locale: "EN",
              name: input.nameEn,
              slug,
              shortDescription: input.shortEn,
              longDescription: input.longEn ?? undefined,
            },
            {
              locale: "AR",
              name: input.nameAr ?? input.nameEn,
              slug: slugAr,
              shortDescription: input.shortAr ?? input.shortEn,
              longDescription: input.longAr ?? undefined,
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const updateService = createAction({
  input: serviceUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => serviceTags(r.slug),
  audit: { action: "service.update", entityType: "service", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.service.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        translations: { select: { locale: true, slug: true, name: true } },
      },
    });
    if (!existing) {
      notFound("Service");
    }
    const nextSlug =
      input.slugEn || input.nameEn
        ? await generateUniqueSlug(
            "service",
            "en",
            input.slugEn ?? input.nameEn ?? existing.slug,
            existing.id,
          )
        : existing.slug;
    const published = (input.status ?? existing.status) === "PUBLISHED";
    if (nextSlug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "service",
        oldSlug: existing.slug,
        newSlug: nextSlug,
        locale: "en",
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    let nextAr = ar?.slug;
    if (input.slugAr || input.nameAr) {
      nextAr = await generateUniqueSlug(
        "service",
        "ar",
        input.slugAr ?? input.nameAr ?? ar?.name ?? existing.slug,
        existing.id,
      );
      if (ar && nextAr !== ar.slug) {
        await redirectOnPublishedSlugChange({
          published,
          entityType: "service",
          oldSlug: ar.slug,
          newSlug: nextAr,
          locale: "ar",
        });
      }
    }
    const row = await prisma.service.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
        status: input.status,
        isFeatured: input.isFeatured,
        iconName: input.iconName,
        categoryId: input.categoryId,
        turnaroundTime: input.turnaroundTime,
        startingPrice: input.startingPrice,
        imageId: input.imageId,
        heroImageId: input.heroImageId,
        publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
      },
      select: { id: true, slug: true, status: true },
    });
    if (input.nameEn || input.shortEn || input.slugEn || input.longEn) {
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: existing.id, locale: "EN" } },
        create: {
          serviceId: existing.id,
          locale: "EN",
          name: input.nameEn ?? existing.slug,
          slug: nextSlug,
          shortDescription: input.shortEn,
          longDescription: input.longEn ?? undefined,
        },
        update: {
          name: input.nameEn,
          slug: nextSlug,
          shortDescription: input.shortEn,
          longDescription: input.longEn ?? undefined,
        },
      });
    }
    if (input.nameAr || input.shortAr || nextAr || input.longAr) {
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: existing.id, locale: "AR" } },
        create: {
          serviceId: existing.id,
          locale: "AR",
          name: input.nameAr ?? input.nameEn ?? existing.slug,
          slug: nextAr ?? nextSlug,
          shortDescription: input.shortAr,
          longDescription: input.longAr ?? undefined,
        },
        update: {
          name: input.nameAr,
          slug: nextAr,
          shortDescription: input.shortAr,
          longDescription: input.longAr ?? undefined,
        },
      });
    }
    return row;
  },
});

export const deleteService = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => serviceTags(r.slug),
  audit: { action: "service.delete", entityType: "service", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.service.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      notFound("Service");
    }
    return prisma.service.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const duplicateService = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => serviceTags(r.slug),
  audit: { action: "service.duplicate", entityType: "service", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.service.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Service");
    }
    const slug = await generateUniqueSlug("service", "en", copySuffix(existing.slug));
    const en = existing.translations.find((row) => row.locale === "EN");
    const ar = existing.translations.find((row) => row.locale === "AR");
    return prisma.service.create({
      data: {
        slug,
        status: "DRAFT",
        iconName: existing.iconName,
        categoryId: existing.categoryId,
        turnaroundTime: existing.turnaroundTime,
        startingPrice: existing.startingPrice,
        translations: {
          create: [
            { locale: "EN", name: `${en?.name ?? slug} (copy)`, slug },
            {
              locale: "AR",
              name: `${ar?.name ?? slug} (نسخة)`,
              slug: await generateUniqueSlug("service", "ar", copySuffix(ar?.slug ?? slug)),
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const toggleServiceStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => serviceTags(r.slug),
  audit: { action: "service.toggleStatus", entityType: "service", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.service.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, status: true },
    });
    if (!existing) {
      notFound("Service");
    }
    const status = nextStatus(existing.status);
    return prisma.service.update({
      where: { id: existing.id },
      data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const reorderServices = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.services(), tags.global()],
  audit: { action: "service.reorder", entityType: "service", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.service.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateServiceStatus = createAction({
  input: bulkStatusSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.services(), tags.global()],
  audit: { action: "service.bulkUpdateStatus", entityType: "service", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.service.updateMany({
      where: { id: { in: input.ids } },
      data: { status: input.status },
    });
    return { count: result.count };
  },
});

export const bulkDeleteServices = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.services(), tags.global()],
  audit: { action: "service.bulkDelete", entityType: "service", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.service.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "ARCHIVED" },
    });
    return { count: result.count };
  },
});
