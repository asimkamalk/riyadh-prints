"use server";

import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, jsonValueSchema, reorderSchema } from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction, toInputJson } from "./_resource";

const faqScopeSchema = z.enum([
  "GLOBAL",
  "PAGE",
  "PRODUCT",
  "CATEGORY",
  "SERVICE",
  "POST",
  "PROJECT",
]);

const faqCreateSchema = z.object({
  scope: faqScopeSchema,
  groupId: z.string().min(1).optional(),
  pageId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  postId: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  questionEn: z.string().trim().min(1).max(300),
  questionAr: z.string().trim().max(300).optional(),
  answerEn: jsonValueSchema,
  answerAr: jsonValueSchema.optional(),
});

const faqUpdateSchema = faqCreateSchema.partial().extend({
  id: z.string().min(1),
});

function faqTags(scope: string, entityId?: string) {
  return [tags.faqs(scope, entityId), tags.global()];
}

export const createFaq = createAction({
  input: faqCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (input) => faqTags(input.scope, input.productId ?? input.serviceId ?? input.pageId),
  audit: { action: "faq.create", entityType: "faq", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    return prisma.faqItem.create({
      data: {
        scope: input.scope,
        groupId: input.groupId,
        pageId: input.pageId,
        productId: input.productId,
        categoryId: input.categoryId,
        serviceId: input.serviceId,
        postId: input.postId,
        projectId: input.projectId,
        sortOrder: input.sortOrder ?? 0,
        translations: {
          create: [
            { locale: "EN", question: input.questionEn, answer: input.answerEn ?? {} },
            {
              locale: "AR",
              question: input.questionAr ?? input.questionEn,
              answer: input.answerAr ?? input.answerEn ?? {},
            },
          ],
        },
      },
      select: { id: true, scope: true },
    });
  },
});

export const updateFaq = createAction({
  input: faqUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "faq.update", entityType: "faq", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.faqItem.findUnique({
      where: { id: input.id },
      select: { id: true, scope: true },
    });
    if (!existing) {
      notFound("FAQ");
    }
    const row = await prisma.faqItem.update({
      where: { id: existing.id },
      data: {
        scope: input.scope,
        groupId: input.groupId,
        pageId: input.pageId,
        productId: input.productId,
        categoryId: input.categoryId,
        serviceId: input.serviceId,
        postId: input.postId,
        projectId: input.projectId,
        sortOrder: input.sortOrder,
      },
      select: { id: true, scope: true },
    });
    if (input.questionEn || input.answerEn !== undefined) {
      await prisma.faqItemTranslation.upsert({
        where: { faqItemId_locale: { faqItemId: existing.id, locale: "EN" } },
        create: {
          faqItemId: existing.id,
          locale: "EN",
          question: input.questionEn ?? "",
          answer: input.answerEn ?? {},
        },
        update: {
          question: input.questionEn,
          answer: input.answerEn ?? undefined,
        },
      });
    }
    if (input.questionAr || input.answerAr !== undefined) {
      await prisma.faqItemTranslation.upsert({
        where: { faqItemId_locale: { faqItemId: existing.id, locale: "AR" } },
        create: {
          faqItemId: existing.id,
          locale: "AR",
          question: input.questionAr ?? input.questionEn ?? "",
          answer: input.answerAr ?? input.answerEn ?? {},
        },
        update: {
          question: input.questionAr,
          answer: input.answerAr ?? undefined,
        },
      });
    }
    return row;
  },
});

export const deleteFaq = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "faq.delete", entityType: "faq", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.faqItem.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("FAQ");
    }
    return prisma.faqItem.update({
      where: { id: existing.id },
      data: { isVisible: false },
      select: { id: true, isVisible: true },
    });
  },
});

export const duplicateFaq = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "faq.duplicate", entityType: "faq", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.faqItem.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("FAQ");
    }
    return prisma.faqItem.create({
      data: {
        scope: existing.scope,
        groupId: existing.groupId,
        pageId: existing.pageId,
        productId: existing.productId,
        categoryId: existing.categoryId,
        serviceId: existing.serviceId,
        postId: existing.postId,
        projectId: existing.projectId,
        sortOrder: existing.sortOrder + 1,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            question: `${row.question} (copy)`,
            answer: toInputJson(row.answer),
          })),
        },
      },
      select: { id: true, scope: true },
    });
  },
});

export const toggleFaqStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "faq.toggleStatus", entityType: "faq", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.faqItem.findUnique({
      where: { id: input.id },
      select: { id: true, isVisible: true },
    });
    if (!existing) {
      notFound("FAQ");
    }
    return prisma.faqItem.update({
      where: { id: existing.id },
      data: { isVisible: !existing.isVisible },
      select: { id: true, isVisible: true },
    });
  },
});

export const reorderFaqs = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "faq.reorder", entityType: "faq", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.faqItem.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateFaqStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1),
    isVisible: z.boolean(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "faq.bulkUpdateStatus", entityType: "faq", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.faqItem.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: input.isVisible },
    });
    return { count: result.count };
  },
});

export const bulkDeleteFaqs = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "faq.bulkDelete", entityType: "faq", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.faqItem.updateMany({
      where: { id: { in: input.ids } },
      data: { isVisible: false },
    });
    return { count: result.count };
  },
});
