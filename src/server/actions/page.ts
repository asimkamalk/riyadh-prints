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
import { pageSaveSchema } from "@/lib/validations/page";
import { emptyToNull, parsePublishedAt } from "@/server/catalogue/seo-write";
import { pageParentWouldCycle, pageTranslationData } from "@/server/catalogue/page-write";
import { prisma } from "@/server/db";

import { ActionError, CONTENT_ROLES, createAction } from "./_helpers";
import { redirectOnPublishedSlugChange } from "./_redirects";
import { copySuffix, nextStatus, notFound, reorderTransaction } from "./_resource";
import { generateUniqueSlug } from "./_slug";

const pageCreateSchema = z.object({
  titleEn: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().max(200).optional(),
  slugEn: z.string().trim().max(200).optional(),
  slugAr: z.string().trim().max(200).optional(),
  excerptEn: z.string().max(500).optional(),
  excerptAr: z.string().max(500).optional(),
  contentEn: jsonValueSchema.optional(),
  contentAr: jsonValueSchema.optional(),
  parentId: z.string().min(1).nullable().optional(),
  template: z.string().max(60).optional(),
  status: contentStatusSchema.optional(),
});

const pageUpdateSchema = pageCreateSchema.partial().extend({
  id: z.string().min(1),
});

function pageTags(slug: string) {
  return [tags.page(slug), tags.pages(), tags.search(), tags.global()];
}

async function ancestorSlugs(parentId: string | null): Promise<string[]> {
  const slugs: string[] = [];
  let current = parentId;
  while (current) {
    const parent = await prisma.page.findUnique({
      where: { id: current },
      select: { parentId: true, slug: true },
    });
    if (!parent) {
      break;
    }
    slugs.unshift(parent.slug);
    current = parent.parentId;
  }
  return slugs;
}

export const createPage = createAction({
  input: pageCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => pageTags(r.slug),
  audit: { action: "page.create", entityType: "page", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug("page", "en", input.slugEn ?? input.titleEn);
    const slugAr = await generateUniqueSlug(
      "page",
      "ar",
      input.slugAr ?? input.titleAr ?? input.titleEn,
    );
    return prisma.page.create({
      data: {
        slug,
        parentId: input.parentId ?? undefined,
        template: input.template,
        status: input.status ?? "DRAFT",
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
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const updatePage = createAction({
  input: pageUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => pageTags(r.slug),
  audit: { action: "page.update", entityType: "page", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.page.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        parentId: true,
        translations: { select: { locale: true, slug: true, title: true } },
      },
    });
    if (!existing) {
      notFound("Page");
    }
    const nextSlug =
      input.slugEn || input.titleEn
        ? await generateUniqueSlug(
            "page",
            "en",
            input.slugEn ?? input.titleEn ?? existing.slug,
            existing.id,
          )
        : existing.slug;
    const published = (input.status ?? existing.status) === "PUBLISHED";
    const ancestors = await ancestorSlugs(existing.parentId);
    if (nextSlug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "page",
        oldSlug: existing.slug,
        newSlug: nextSlug,
        locale: "en",
        pageSegmentsOld: [...ancestors, existing.slug],
        pageSegmentsNew: [...ancestors, nextSlug],
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    let nextAr = ar?.slug;
    if (input.slugAr || input.titleAr) {
      nextAr = await generateUniqueSlug(
        "page",
        "ar",
        input.slugAr ?? input.titleAr ?? ar?.title ?? existing.slug,
        existing.id,
      );
      if (ar && nextAr !== ar.slug) {
        await redirectOnPublishedSlugChange({
          published,
          entityType: "page",
          oldSlug: ar.slug,
          newSlug: nextAr,
          locale: "ar",
          pageSegmentsOld: [...ancestors, ar.slug],
          pageSegmentsNew: [...ancestors, nextAr],
        });
      }
    }
    const row = await prisma.page.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
        parentId: input.parentId,
        template: input.template,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
      },
      select: { id: true, slug: true, status: true },
    });
    if (input.titleEn || input.excerptEn || input.slugEn || input.contentEn) {
      await prisma.pageTranslation.upsert({
        where: { pageId_locale: { pageId: existing.id, locale: "EN" } },
        create: {
          pageId: existing.id,
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
      await prisma.pageTranslation.upsert({
        where: { pageId_locale: { pageId: existing.id, locale: "AR" } },
        create: {
          pageId: existing.id,
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
    return row;
  },
});

export const deletePage = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => pageTags(r.slug),
  audit: { action: "page.delete", entityType: "page", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.page.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      notFound("Page");
    }
    return prisma.page.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const duplicatePage = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => pageTags(r.slug),
  audit: { action: "page.duplicate", entityType: "page", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.page.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Page");
    }
    const slug = await generateUniqueSlug("page", "en", copySuffix(existing.slug));
    const en = existing.translations.find((row) => row.locale === "EN");
    const ar = existing.translations.find((row) => row.locale === "AR");
    return prisma.page.create({
      data: {
        slug,
        parentId: existing.parentId,
        template: existing.template,
        status: "DRAFT",
        translations: {
          create: [
            { locale: "EN", title: `${en?.title ?? slug} (copy)`, slug },
            {
              locale: "AR",
              title: `${ar?.title ?? slug} (نسخة)`,
              slug: await generateUniqueSlug("page", "ar", copySuffix(ar?.slug ?? slug)),
            },
          ],
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const togglePageStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => pageTags(r.slug),
  audit: { action: "page.toggleStatus", entityType: "page", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.page.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, status: true },
    });
    if (!existing) {
      notFound("Page");
    }
    const status = nextStatus(existing.status);
    return prisma.page.update({
      where: { id: existing.id },
      data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const reorderPages = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "page.reorder", entityType: "page", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.page.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdatePageStatus = createAction({
  input: bulkStatusSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "page.bulkUpdateStatus", entityType: "page", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.page.updateMany({
      where: { id: { in: input.ids } },
      data: { status: input.status },
    });
    return { count: result.count };
  },
});

export const bulkDeletePages = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.pages(), tags.global()],
  audit: { action: "page.bulkDelete", entityType: "page", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.page.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "ARCHIVED" },
    });
    return { count: result.count };
  },
});

export const savePage = createAction({
  input: pageSaveSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => pageTags(r.slug),
  audit: { action: "page.save", entityType: "page", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    if (input.id && (await pageParentWouldCycle(input.id, input.parentId ?? null))) {
      throw new ActionError("A page cannot be nested under itself.");
    }
    const pinned = input.id
      ? await prisma.page.findUnique({
          where: { id: input.id },
          select: { slug: true, translations: { select: { locale: true, slug: true } } },
        })
      : null;
    const keepPinned = pinned?.slug === "home" || pinned?.slug === "shop";
    const slug = keepPinned && pinned
      ? pinned.slug
      : await generateUniqueSlug("page", "en", input.slugEn ?? input.titleEn, input.id);
    const slugAr = keepPinned && pinned
      ? (pinned.translations.find((row) => row.locale === "AR")?.slug ?? pinned.slug)
      : await generateUniqueSlug(
          "page",
          "ar",
          input.slugAr ?? input.titleAr ?? input.titleEn,
          input.id,
        );
    const status = input.status ?? "DRAFT";
    const publishedAt = parsePublishedAt(input.publishedAt);
    const core = {
      slug,
      parentId: input.parentId ?? null,
      template: emptyToNull(input.template) ?? null,
      status,
      sortOrder: input.sortOrder ?? 0,
      showInSitemap: input.showInSitemap ?? true,
      changeFrequency: emptyToNull(input.changeFrequency) ?? null,
      publishedAt: status === "PUBLISHED" ? (publishedAt ?? new Date()) : publishedAt,
      priority: input.priority ?? null,
    };

    if (!input.id) {
      return prisma.page.create({
        data: {
          ...core,
          translations: {
            create: [
              { locale: "EN", ...pageTranslationData(input, "EN", slug) },
              { locale: "AR", ...pageTranslationData(input, "AR", slugAr) },
            ],
          },
        },
        select: { id: true, slug: true, status: true },
      });
    }

    const existing = await prisma.page.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        parentId: true,
        translations: { select: { locale: true, slug: true } },
      },
    });
    if (!existing) {
      notFound("Page");
    }
    const published = status === "PUBLISHED";
    const ancestors = await ancestorSlugs(input.parentId ?? existing.parentId);
    if (slug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "page",
        oldSlug: existing.slug,
        newSlug: slug,
        locale: "en",
        pageSegmentsOld: [...(await ancestorSlugs(existing.parentId)), existing.slug],
        pageSegmentsNew: [...ancestors, slug],
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    if (ar && slugAr !== ar.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "page",
        oldSlug: ar.slug,
        newSlug: slugAr,
        locale: "ar",
        pageSegmentsOld: [...(await ancestorSlugs(existing.parentId)), ar.slug],
        pageSegmentsNew: [...ancestors, slugAr],
      });
    }
    const row = await prisma.page.update({
      where: { id: existing.id },
      data: core,
      select: { id: true, slug: true, status: true },
    });
    await prisma.pageTranslation.upsert({
      where: { pageId_locale: { pageId: existing.id, locale: "EN" } },
      create: { pageId: existing.id, locale: "EN", ...pageTranslationData(input, "EN", slug) },
      update: pageTranslationData(input, "EN", slug),
    });
    await prisma.pageTranslation.upsert({
      where: { pageId_locale: { pageId: existing.id, locale: "AR" } },
      create: { pageId: existing.id, locale: "AR", ...pageTranslationData(input, "AR", slugAr) },
      update: pageTranslationData(input, "AR", slugAr),
    });
    return row;
  },
});
