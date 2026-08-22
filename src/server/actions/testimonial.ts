"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import {
  bulkIdsSchema,
  bulkStatusSchema,
  contentStatusSchema,
  idSchema,
  reorderSchema,
} from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { nextStatus, notFound, reorderTransaction } from "./_resource";

const testimonialCreateSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  authorRole: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  avatarId: z.string().min(1).optional(),
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  quoteEn: z.string().trim().min(1).max(2000),
  quoteAr: z.string().trim().max(2000).optional(),
  authorNameAr: z.string().max(120).optional(),
  authorRoleAr: z.string().max(120).optional(),
});

const testimonialUpdateSchema = testimonialCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const createTestimonial = createAction({
  input: testimonialCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: { action: "testimonial.create", entityType: "testimonial", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    return prisma.testimonial.create({
      data: {
        authorName: input.authorName,
        authorRole: input.authorRole,
        company: input.company,
        rating: input.rating,
        avatarId: input.avatarId,
        status: input.status ?? "DRAFT",
        isFeatured: input.isFeatured ?? false,
        translations: {
          create: [
            {
              locale: "EN",
              quote: input.quoteEn,
              authorName: input.authorName,
              authorRole: input.authorRole,
            },
            {
              locale: "AR",
              quote: input.quoteAr ?? input.quoteEn,
              authorName: input.authorNameAr ?? input.authorName,
              authorRole: input.authorRoleAr ?? input.authorRole,
            },
          ],
        },
      },
      select: { id: true, status: true },
    });
  },
});

export const updateTestimonial = createAction({
  input: testimonialUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: { action: "testimonial.update", entityType: "testimonial", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.testimonial.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Testimonial");
    }
    const row = await prisma.testimonial.update({
      where: { id: existing.id },
      data: {
        authorName: input.authorName,
        authorRole: input.authorRole,
        company: input.company,
        rating: input.rating,
        avatarId: input.avatarId,
        status: input.status,
        isFeatured: input.isFeatured,
      },
      select: { id: true, status: true },
    });
    if (input.quoteEn || input.authorRole) {
      await prisma.testimonialTranslation.upsert({
        where: { testimonialId_locale: { testimonialId: existing.id, locale: "EN" } },
        create: {
          testimonialId: existing.id,
          locale: "EN",
          quote: input.quoteEn ?? "",
          authorName: input.authorName,
          authorRole: input.authorRole,
        },
        update: {
          quote: input.quoteEn,
          authorName: input.authorName,
          authorRole: input.authorRole,
        },
      });
    }
    if (input.quoteAr || input.authorNameAr || input.authorRoleAr) {
      await prisma.testimonialTranslation.upsert({
        where: { testimonialId_locale: { testimonialId: existing.id, locale: "AR" } },
        create: {
          testimonialId: existing.id,
          locale: "AR",
          quote: input.quoteAr ?? input.quoteEn ?? "",
          authorName: input.authorNameAr,
          authorRole: input.authorRoleAr,
        },
        update: {
          quote: input.quoteAr,
          authorName: input.authorNameAr,
          authorRole: input.authorRoleAr,
        },
      });
    }
    return row;
  },
});

export const deleteTestimonial = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: { action: "testimonial.delete", entityType: "testimonial", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.testimonial.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Testimonial");
    }
    return prisma.testimonial.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      select: { id: true, status: true },
    });
  },
});

export const duplicateTestimonial = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: { action: "testimonial.duplicate", entityType: "testimonial", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.testimonial.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Testimonial");
    }
    return prisma.testimonial.create({
      data: {
        authorName: existing.authorName,
        authorRole: existing.authorRole,
        company: existing.company,
        rating: existing.rating,
        status: "DRAFT",
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            quote: row.quote,
            authorName: row.authorName,
            authorRole: row.authorRole,
          })),
        },
      },
      select: { id: true, status: true },
    });
  },
});

export const toggleTestimonialStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: { action: "testimonial.toggleStatus", entityType: "testimonial", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.testimonial.findUnique({
      where: { id: input.id },
      select: { id: true, status: true },
    });
    if (!existing) {
      notFound("Testimonial");
    }
    return prisma.testimonial.update({
      where: { id: existing.id },
      data: { status: nextStatus(existing.status) },
      select: { id: true, status: true },
    });
  },
});

export const reorderTestimonials = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: { action: "testimonial.reorder", entityType: "testimonial", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.testimonial.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateTestimonialStatus = createAction({
  input: bulkStatusSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: {
    action: "testimonial.bulkUpdateStatus",
    entityType: "testimonial",
    entityId: () => "batch",
  },
  handler: async ({ input }) => {
    const result = await prisma.testimonial.updateMany({
      where: { id: { in: input.ids } },
      data: { status: input.status },
    });
    return { count: result.count };
  },
});

export const bulkDeleteTestimonials = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.testimonials(), tags.global()],
  audit: { action: "testimonial.bulkDelete", entityType: "testimonial", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.testimonial.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "ARCHIVED" },
    });
    return { count: result.count };
  },
});
