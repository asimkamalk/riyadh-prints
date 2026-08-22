"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction } from "./_resource";

const bannerCreateSchema = z.object({
  placement: z.string().trim().min(1).max(80),
  imageId: z.string().min(1).optional(),
  mobileImageId: z.string().min(1).optional(),
  linkUrl: z.string().url().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  sortOrder: z.number().int().optional(),
  headingEn: z.string().max(200).optional(),
  headingAr: z.string().max(200).optional(),
  subheadingEn: z.string().max(300).optional(),
  subheadingAr: z.string().max(300).optional(),
  ctaLabelEn: z.string().max(80).optional(),
  ctaLabelAr: z.string().max(80).optional(),
});

const bannerUpdateSchema = bannerCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const createBanner = createAction({
  input: bannerCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.create", entityType: "banner", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    return prisma.banner.create({
      data: {
        placement: input.placement,
        imageId: input.imageId,
        mobileImageId: input.mobileImageId,
        linkUrl: input.linkUrl,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
        sortOrder: input.sortOrder ?? 0,
        translations: {
          create: [
            {
              locale: "EN",
              heading: input.headingEn,
              subheading: input.subheadingEn,
              ctaLabel: input.ctaLabelEn,
            },
            {
              locale: "AR",
              heading: input.headingAr ?? input.headingEn,
              subheading: input.subheadingAr ?? input.subheadingEn,
              ctaLabel: input.ctaLabelAr ?? input.ctaLabelEn,
            },
          ],
        },
      },
      select: { id: true, placement: true, isActive: true },
    });
  },
});

export const updateBanner = createAction({
  input: bannerUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.update", entityType: "banner", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.banner.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Banner");
    }
    const row = await prisma.banner.update({
      where: { id: existing.id },
      data: {
        placement: input.placement,
        imageId: input.imageId,
        mobileImageId: input.mobileImageId,
        linkUrl: input.linkUrl,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
        sortOrder: input.sortOrder,
      },
      select: { id: true, placement: true, isActive: true },
    });
    if (input.headingEn || input.subheadingEn || input.ctaLabelEn) {
      await prisma.bannerTranslation.upsert({
        where: { bannerId_locale: { bannerId: existing.id, locale: "EN" } },
        create: {
          bannerId: existing.id,
          locale: "EN",
          heading: input.headingEn,
          subheading: input.subheadingEn,
          ctaLabel: input.ctaLabelEn,
        },
        update: {
          heading: input.headingEn,
          subheading: input.subheadingEn,
          ctaLabel: input.ctaLabelEn,
        },
      });
    }
    if (input.headingAr || input.subheadingAr || input.ctaLabelAr) {
      await prisma.bannerTranslation.upsert({
        where: { bannerId_locale: { bannerId: existing.id, locale: "AR" } },
        create: {
          bannerId: existing.id,
          locale: "AR",
          heading: input.headingAr,
          subheading: input.subheadingAr,
          ctaLabel: input.ctaLabelAr,
        },
        update: {
          heading: input.headingAr,
          subheading: input.subheadingAr,
          ctaLabel: input.ctaLabelAr,
        },
      });
    }
    return row;
  },
});

export const deleteBanner = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.delete", entityType: "banner", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.banner.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Banner");
    }
    return prisma.banner.update({
      where: { id: existing.id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  },
});

export const duplicateBanner = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.duplicate", entityType: "banner", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.banner.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Banner");
    }
    return prisma.banner.create({
      data: {
        placement: existing.placement,
        imageId: existing.imageId,
        mobileImageId: existing.mobileImageId,
        linkUrl: existing.linkUrl,
        sortOrder: existing.sortOrder + 1,
        isActive: false,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            heading: row.heading,
            subheading: row.subheading,
            ctaLabel: row.ctaLabel,
          })),
        },
      },
      select: { id: true, placement: true, isActive: true },
    });
  },
});

export const toggleBannerStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.toggleStatus", entityType: "banner", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.banner.findUnique({
      where: { id: input.id },
      select: { id: true, isActive: true },
    });
    if (!existing) {
      notFound("Banner");
    }
    return prisma.banner.update({
      where: { id: existing.id },
      data: { isActive: !existing.isActive },
      select: { id: true, isActive: true },
    });
  },
});

export const reorderBanners = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.reorder", entityType: "banner", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.banner.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateBannerStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    isActive: z.boolean(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.bulkUpdateStatus", entityType: "banner", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.banner.updateMany({
      where: { id: { in: input.ids } },
      data: { isActive: input.isActive },
    });
    return { count: result.count };
  },
});

export const bulkDeleteBanners = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "banner.bulkDelete", entityType: "banner", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.banner.updateMany({
      where: { id: { in: input.ids } },
      data: { isActive: false },
    });
    return { count: result.count };
  },
});
