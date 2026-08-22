import type { Locale } from "@/i18n/locales";
import {
  slugFromTitle,
  transliterateArabic,
  type SlugModel,
} from "@/lib/slug";
import { toPrismaLocale } from "@/server/queries/_shared";
import { prisma } from "@/server/db";

import { ActionError } from "./_helpers";

export { slugFromTitle, transliterateArabic, type SlugModel };

export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "_next",
  "shop",
  "sitemap.xml",
  "robots.txt",
  "sitemapxml",
  "sitemap-xml",
  "robotstxt",
  "robots-txt",
]);

export function isReservedSlug(slug: string): boolean {
  const normalized = slug.toLowerCase();
  return RESERVED_SLUGS.has(normalized);
}

async function slugTaken(
  model: SlugModel,
  locale: Locale,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const prismaLocale = toPrismaLocale(locale);

  switch (model) {
    case "product":
      return Boolean(
        (await prisma.product.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.productTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { productId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "category":
      return Boolean(
        (await prisma.category.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.categoryTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { categoryId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "service":
      return Boolean(
        (await prisma.service.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.serviceTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { serviceId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "page":
      return Boolean(
        (await prisma.page.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.pageTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { pageId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "post":
      return Boolean(
        (await prisma.post.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.postTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { postId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "project":
      return Boolean(
        (await prisma.project.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.projectTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { projectId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "author":
      return Boolean(
        (await prisma.author.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.authorTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { authorId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "teamMember":
      return Boolean(
        (await prisma.teamMember.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.teamMemberTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { teamMemberId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    case "location":
      return Boolean(
        await prisma.locationTranslation.findFirst({
          where: {
            slug,
            locale: prismaLocale,
            ...(excludeId ? { locationId: { not: excludeId } } : {}),
          },
          select: { id: true },
        }),
      );
    case "tag":
      return Boolean(
        (await prisma.tag.findFirst({
          where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
          select: { id: true },
        })) ||
          (await prisma.tagTranslation.findFirst({
            where: {
              slug,
              locale: prismaLocale,
              ...(excludeId ? { tagId: { not: excludeId } } : {}),
            },
            select: { id: true },
          })),
      );
    default: {
      const _exhaustive: never = model;
      return _exhaustive;
    }
  }
}

export async function generateUniqueSlug(
  model: SlugModel,
  locale: Locale,
  title: string,
  excludeId?: string,
): Promise<string> {
  let base = slugFromTitle(title);
  if (isReservedSlug(base)) {
    base = `${base}-page`;
  }

  let candidate = base;
  let n = 2;
  while (await slugTaken(model, locale, candidate, excludeId)) {
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 1000) {
      throw new ActionError("Could not generate a unique slug.", "CONFLICT");
    }
  }
  return candidate;
}

export async function isSlugAvailable(
  model: SlugModel,
  locale: Locale,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const normalized = slugFromTitle(slug);
  if (isReservedSlug(normalized)) {
    return false;
  }
  return !(await slugTaken(model, locale, normalized, excludeId));
}
