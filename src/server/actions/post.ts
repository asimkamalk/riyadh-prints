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
} from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { ActionError, CONTENT_ROLES, createAction } from "./_helpers";
import { redirectOnPublishedSlugChange } from "./_redirects";
import { copySuffix, nextStatus, notFound } from "./_resource";
import { generateUniqueSlug } from "./_slug";

const postCreateSchema = z.object({
  titleEn: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().max(200).optional(),
  slugEn: z.string().trim().max(200).optional(),
  slugAr: z.string().trim().max(200).optional(),
  excerptEn: z.string().max(500).optional(),
  excerptAr: z.string().max(500).optional(),
  contentEn: jsonValueSchema.optional(),
  contentAr: jsonValueSchema.optional(),
  authorId: z.string().min(1),
  coverImageId: z.string().min(1).optional(),
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  readingMinutes: z.number().int().positive().optional(),
  categoryIds: z.array(z.string().min(1)).optional(),
});

const postUpdateSchema = postCreateSchema.partial().extend({
  id: z.string().min(1),
  authorId: z.string().min(1).optional(),
});

function postTags(slug: string) {
  return [tags.post(slug), tags.posts(), tags.search(), tags.global()];
}

export const createPost = createAction({
  input: postCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => postTags(r.slug),
  audit: { action: "post.create", entityType: "post", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug("post", "en", input.slugEn ?? input.titleEn);
    const slugAr = await generateUniqueSlug(
      "post",
      "ar",
      input.slugAr ?? input.titleAr ?? input.titleEn,
    );
    return prisma.post.create({
      data: {
        slug,
        authorId: input.authorId,
        coverImageId: input.coverImageId,
        status: input.status ?? "DRAFT",
        isFeatured: input.isFeatured ?? false,
        readingMinutes: input.readingMinutes,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        translations: {
          create: [
            {
              locale: "EN",
              title: input.titleEn,
              slug,
              excerpt: input.excerptEn,
              content: input.contentEn ?? undefined,
            },
            {
              locale: "AR",
              title: input.titleAr ?? input.titleEn,
              slug: slugAr,
              excerpt: input.excerptAr ?? input.excerptEn,
              content: input.contentAr ?? undefined,
            },
          ],
        },
        categories: input.categoryIds
          ? { create: input.categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const updatePost = createAction({
  input: postUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => postTags(r.slug),
  audit: { action: "post.update", entityType: "post", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.post.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        translations: { select: { locale: true, slug: true, title: true } },
      },
    });
    if (!existing) {
      notFound("Post");
    }
    const nextSlug =
      input.slugEn || input.titleEn
        ? await generateUniqueSlug(
            "post",
            "en",
            input.slugEn ?? input.titleEn ?? existing.slug,
            existing.id,
          )
        : existing.slug;
    const published = (input.status ?? existing.status) === "PUBLISHED";
    if (nextSlug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "post",
        oldSlug: existing.slug,
        newSlug: nextSlug,
        locale: "en",
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    let nextAr = ar?.slug;
    if (input.slugAr || input.titleAr) {
      nextAr = await generateUniqueSlug(
        "post",
        "ar",
        input.slugAr ?? input.titleAr ?? ar?.title ?? existing.slug,
        existing.id,
      );
      if (ar && nextAr !== ar.slug) {
        await redirectOnPublishedSlugChange({
          published,
          entityType: "post",
          oldSlug: ar.slug,
          newSlug: nextAr,
          locale: "ar",
        });
      }
    }
    const row = await prisma.post.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
        authorId: input.authorId,
        coverImageId: input.coverImageId,
        status: input.status,
        isFeatured: input.isFeatured,
        readingMinutes: input.readingMinutes,
        publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
      },
      select: { id: true, slug: true, status: true },
    });
    if (input.titleEn || input.excerptEn || input.slugEn || input.contentEn) {
      await prisma.postTranslation.upsert({
        where: { postId_locale: { postId: existing.id, locale: "EN" } },
        create: {
          postId: existing.id,
          locale: "EN",
          title: input.titleEn ?? existing.slug,
          slug: nextSlug,
          excerpt: input.excerptEn,
          content: input.contentEn ?? undefined,
        },
        update: {
          title: input.titleEn,
          slug: nextSlug,
          excerpt: input.excerptEn,
          content: input.contentEn ?? undefined,
        },
      });
    }
    if (input.titleAr || input.excerptAr || nextAr || input.contentAr) {
      await prisma.postTranslation.upsert({
        where: { postId_locale: { postId: existing.id, locale: "AR" } },
        create: {
          postId: existing.id,
          locale: "AR",
          title: input.titleAr ?? input.titleEn ?? existing.slug,
          slug: nextAr ?? nextSlug,
          excerpt: input.excerptAr,
          content: input.contentAr ?? undefined,
        },
        update: {
          title: input.titleAr,
          slug: nextAr,
          excerpt: input.excerptAr,
          content: input.contentAr ?? undefined,
        },
      });
    }
    if (input.categoryIds) {
      await prisma.postToCategory.deleteMany({ where: { postId: existing.id } });
      if (input.categoryIds.length) {
        await prisma.postToCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            postId: existing.id,
            categoryId,
          })),
        });
      }
    }
    return row;
  },
});

export const deletePost = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => postTags(r.slug),
  audit: { action: "post.delete", entityType: "post", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.post.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      notFound("Post");
    }
    return prisma.post.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const duplicatePost = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => postTags(r.slug),
  audit: { action: "post.duplicate", entityType: "post", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.post.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Post");
    }
    const slug = await generateUniqueSlug("post", "en", copySuffix(existing.slug));
    const en = existing.translations.find((row) => row.locale === "EN");
    const ar = existing.translations.find((row) => row.locale === "AR");
    return prisma.post.create({
      data: {
        slug,
        authorId: existing.authorId,
        coverImageId: existing.coverImageId,
        status: "DRAFT",
        readingMinutes: existing.readingMinutes,
        translations: {
          create: [
            { locale: "EN", title: `${en?.title ?? slug} (copy)`, slug },
            {
              locale: "AR",
              title: `${ar?.title ?? slug} (نسخة)`,
              slug: await generateUniqueSlug("post", "ar", copySuffix(ar?.slug ?? slug)),
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const togglePostStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => postTags(r.slug),
  audit: { action: "post.toggleStatus", entityType: "post", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.post.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, status: true },
    });
    if (!existing) {
      notFound("Post");
    }
    const status = nextStatus(existing.status);
    return prisma.post.update({
      where: { id: existing.id },
      data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const reorderPosts = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.posts(), tags.global()],
  audit: { action: "post.reorder", entityType: "post", entityId: () => "batch" },
  handler: async ({ input }) => {
    void input;
    throw new ActionError(
      "Posts are ordered by publish date and cannot be reordered.",
    );
  },
});

export const bulkUpdatePostStatus = createAction({
  input: bulkStatusSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.posts(), tags.global()],
  audit: { action: "post.bulkUpdateStatus", entityType: "post", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.post.updateMany({
      where: { id: { in: input.ids } },
      data: { status: input.status },
    });
    return { count: result.count };
  },
});

export const bulkDeletePosts = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.posts(), tags.global()],
  audit: { action: "post.bulkDelete", entityType: "post", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.post.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "ARCHIVED" },
    });
    return { count: result.count };
  },
});
