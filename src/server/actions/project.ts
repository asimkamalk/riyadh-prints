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

import { CONTENT_ROLES, createAction } from "./_helpers";
import { redirectOnPublishedSlugChange } from "./_redirects";
import { copySuffix, nextStatus, notFound, reorderTransaction } from "./_resource";
import { generateUniqueSlug } from "./_slug";

const projectCreateSchema = z.object({
  titleEn: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().max(200).optional(),
  slugEn: z.string().trim().max(200).optional(),
  slugAr: z.string().trim().max(200).optional(),
  summaryEn: z.string().max(500).optional(),
  summaryAr: z.string().max(500).optional(),
  contentEn: jsonValueSchema.optional(),
  contentAr: jsonValueSchema.optional(),
  clientName: z.string().max(120).optional(),
  categoryId: z.string().min(1).optional(),
  coverImageId: z.string().min(1).optional(),
  status: contentStatusSchema.optional(),
  completedAt: z.string().datetime().optional(),
});

const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: z.string().min(1),
});

function projectTags(slug: string) {
  return [tags.project(slug), tags.projects(), tags.search(), tags.global()];
}

export const createProject = createAction({
  input: projectCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => projectTags(r.slug),
  audit: { action: "project.create", entityType: "project", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug("project", "en", input.slugEn ?? input.titleEn);
    const slugAr = await generateUniqueSlug(
      "project",
      "ar",
      input.slugAr ?? input.titleAr ?? input.titleEn,
    );
    return prisma.project.create({
      data: {
        slug,
        clientName: input.clientName,
        categoryId: input.categoryId,
        coverImageId: input.coverImageId,
        status: input.status ?? "DRAFT",
        completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        translations: {
          create: [
            {
              locale: "EN",
              title: input.titleEn,
              slug,
              summary: input.summaryEn,
              content: input.contentEn ?? undefined,
            },
            {
              locale: "AR",
              title: input.titleAr ?? input.titleEn,
              slug: slugAr,
              summary: input.summaryAr ?? input.summaryEn,
              content: input.contentAr ?? undefined,
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const updateProject = createAction({
  input: projectUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => projectTags(r.slug),
  audit: { action: "project.update", entityType: "project", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.project.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        translations: { select: { locale: true, slug: true, title: true } },
      },
    });
    if (!existing) {
      notFound("Project");
    }
    const nextSlug =
      input.slugEn || input.titleEn
        ? await generateUniqueSlug(
            "project",
            "en",
            input.slugEn ?? input.titleEn ?? existing.slug,
            existing.id,
          )
        : existing.slug;
    const published = (input.status ?? existing.status) === "PUBLISHED";
    if (nextSlug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "project",
        oldSlug: existing.slug,
        newSlug: nextSlug,
        locale: "en",
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    let nextAr = ar?.slug;
    if (input.slugAr || input.titleAr) {
      nextAr = await generateUniqueSlug(
        "project",
        "ar",
        input.slugAr ?? input.titleAr ?? ar?.title ?? existing.slug,
        existing.id,
      );
      if (ar && nextAr !== ar.slug) {
        await redirectOnPublishedSlugChange({
          published,
          entityType: "project",
          oldSlug: ar.slug,
          newSlug: nextAr,
          locale: "ar",
        });
      }
    }
    const row = await prisma.project.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
        clientName: input.clientName,
        categoryId: input.categoryId,
        coverImageId: input.coverImageId,
        status: input.status,
        completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
        publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
      },
      select: { id: true, slug: true, status: true },
    });
    if (input.titleEn || input.summaryEn || input.slugEn || input.contentEn) {
      await prisma.projectTranslation.upsert({
        where: { projectId_locale: { projectId: existing.id, locale: "EN" } },
        create: {
          projectId: existing.id,
          locale: "EN",
          title: input.titleEn ?? existing.slug,
          slug: nextSlug,
          summary: input.summaryEn,
          content: input.contentEn ?? undefined,
        },
        update: {
          title: input.titleEn,
          slug: nextSlug,
          summary: input.summaryEn,
          content: input.contentEn ?? undefined,
        },
      });
    }
    if (input.titleAr || input.summaryAr || nextAr || input.contentAr) {
      await prisma.projectTranslation.upsert({
        where: { projectId_locale: { projectId: existing.id, locale: "AR" } },
        create: {
          projectId: existing.id,
          locale: "AR",
          title: input.titleAr ?? input.titleEn ?? existing.slug,
          slug: nextAr ?? nextSlug,
          summary: input.summaryAr,
          content: input.contentAr ?? undefined,
        },
        update: {
          title: input.titleAr,
          slug: nextAr,
          summary: input.summaryAr,
          content: input.contentAr ?? undefined,
        },
      });
    }
    return row;
  },
});

export const deleteProject = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => projectTags(r.slug),
  audit: { action: "project.delete", entityType: "project", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.project.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      notFound("Project");
    }
    return prisma.project.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const duplicateProject = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => projectTags(r.slug),
  audit: { action: "project.duplicate", entityType: "project", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.project.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Project");
    }
    const slug = await generateUniqueSlug("project", "en", copySuffix(existing.slug));
    const en = existing.translations.find((row) => row.locale === "EN");
    const ar = existing.translations.find((row) => row.locale === "AR");
    return prisma.project.create({
      data: {
        slug,
        clientName: existing.clientName,
        categoryId: existing.categoryId,
        coverImageId: existing.coverImageId,
        status: "DRAFT",
        translations: {
          create: [
            { locale: "EN", title: `${en?.title ?? slug} (copy)`, slug },
            {
              locale: "AR",
              title: `${ar?.title ?? slug} (نسخة)`,
              slug: await generateUniqueSlug("project", "ar", copySuffix(ar?.slug ?? slug)),
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const toggleProjectStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => projectTags(r.slug),
  audit: { action: "project.toggleStatus", entityType: "project", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.project.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, status: true },
    });
    if (!existing) {
      notFound("Project");
    }
    const status = nextStatus(existing.status);
    return prisma.project.update({
      where: { id: existing.id },
      data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const reorderProjects = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.projects(), tags.global()],
  audit: { action: "project.reorder", entityType: "project", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.project.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateProjectStatus = createAction({
  input: bulkStatusSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.projects(), tags.global()],
  audit: { action: "project.bulkUpdateStatus", entityType: "project", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.project.updateMany({
      where: { id: { in: input.ids } },
      data: { status: input.status },
    });
    return { count: result.count };
  },
});

export const bulkDeleteProjects = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.projects(), tags.global()],
  audit: { action: "project.bulkDelete", entityType: "project", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.project.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "ARCHIVED" },
    });
    return { count: result.count };
  },
});
