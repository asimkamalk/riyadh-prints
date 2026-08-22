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
import { productSaveSchema } from "@/lib/validations/product";
import { emptyToNull, parsePublishedAt } from "@/server/catalogue/seo-write";
import {
  productTranslationData,
  syncProductNested,
} from "@/server/catalogue/product-sync";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { redirectOnPublishedSlugChange } from "./_redirects";
import { copySuffix, nextStatus, notFound, reorderTransaction } from "./_resource";
import { generateUniqueSlug } from "./_slug";

const productCreateSchema = translationCopySchema.extend({
  sku: z.string().trim().max(80).optional(),
  categoryId: z.string().min(1).optional(),
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  includesDesign: z.boolean().optional(),
  sameDayAvailable: z.boolean().optional(),
  minOrderQty: z.number().int().positive().optional(),
  turnaroundDays: z.number().int().nonnegative().optional(),
  basePrice: z.string().optional(),
  priceUnit: z.string().max(40).optional(),
});

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().min(1),
});

function productTags(slug: string) {
  return [tags.product(slug), tags.products(), tags.search(), tags.global()];
}

export const createProduct = createAction({
  input: productCreateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_input, result) => productTags(result.slug),
  audit: {
    action: "product.create",
    entityType: "product",
    entityId: (_input, result) => result.id,
  },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug(
      "product",
      "en",
      input.slugEn ?? input.nameEn,
    );
    const slugAr = await generateUniqueSlug(
      "product",
      "ar",
      input.slugAr ?? input.nameAr ?? input.nameEn,
    );
    return prisma.product.create({
      data: {
        slug,
        sku: input.sku,
        categoryId: input.categoryId,
        status: input.status ?? "DRAFT",
        isFeatured: input.isFeatured ?? false,
        isNew: input.isNew ?? false,
        includesDesign: input.includesDesign ?? false,
        sameDayAvailable: input.sameDayAvailable ?? false,
        minOrderQty: input.minOrderQty,
        turnaroundDays: input.turnaroundDays,
        basePrice: input.basePrice,
        priceUnit: input.priceUnit,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
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
      select: { id: true, slug: true, status: true },
    });
  },
});

export const updateProduct = createAction({
  input: productUpdateSchema,
  roles: CONTENT_ROLES,
  revalidate: (_input, result) => productTags(result.slug),
  audit: {
    action: "product.update",
    entityType: "product",
    entityId: (input) => input.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        translations: { select: { locale: true, slug: true, name: true } },
      },
    });
    if (!existing) {
      notFound("Product");
    }
    const en = existing.translations.find((row) => row.locale === "EN");
    const ar = existing.translations.find((row) => row.locale === "AR");
    const nextIdentity =
      input.slugEn || input.nameEn
        ? await generateUniqueSlug(
            "product",
            "en",
            input.slugEn ?? input.nameEn ?? existing.slug,
            existing.id,
          )
        : existing.slug;
    const published = (input.status ?? existing.status) === "PUBLISHED";

    if (nextIdentity !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "product",
        oldSlug: existing.slug,
        newSlug: nextIdentity,
        locale: "en",
      });
      const oldEn = en?.slug ?? existing.slug;
      if (oldEn !== nextIdentity) {
        await redirectOnPublishedSlugChange({
          published,
          entityType: "product",
          oldSlug: oldEn,
          newSlug: nextIdentity,
          locale: "en",
        });
      }
    }

    let nextAr = ar?.slug;
    if (input.slugAr || input.nameAr) {
      nextAr = await generateUniqueSlug(
        "product",
        "ar",
        input.slugAr ?? input.nameAr ?? ar?.name ?? existing.slug,
        existing.id,
      );
      if (ar && nextAr !== ar.slug) {
        await redirectOnPublishedSlugChange({
          published,
          entityType: "product",
          oldSlug: ar.slug,
          newSlug: nextAr,
          locale: "ar",
        });
      }
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        slug: nextIdentity,
        sku: input.sku,
        categoryId: input.categoryId,
        status: input.status,
        isFeatured: input.isFeatured,
        isNew: input.isNew,
        includesDesign: input.includesDesign,
        sameDayAvailable: input.sameDayAvailable,
        minOrderQty: input.minOrderQty,
        turnaroundDays: input.turnaroundDays,
        basePrice: input.basePrice,
        priceUnit: input.priceUnit,
        publishedAt:
          input.status === "PUBLISHED" ? new Date() : input.status === "DRAFT" ? null : undefined,
      },
      select: { id: true, slug: true, status: true },
    });

    if (input.nameEn || input.shortEn || input.slugEn) {
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: existing.id, locale: "EN" } },
        create: {
          productId: existing.id,
          locale: "EN",
          name: input.nameEn ?? en?.name ?? existing.slug,
          slug: nextIdentity,
          shortDescription: input.shortEn,
        },
        update: {
          name: input.nameEn,
          slug: nextIdentity,
          shortDescription: input.shortEn,
        },
      });
    }
    if (input.nameAr || input.shortAr || input.slugAr || nextAr) {
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: existing.id, locale: "AR" } },
        create: {
          productId: existing.id,
          locale: "AR",
          name: input.nameAr ?? input.nameEn ?? existing.slug,
          slug: nextAr ?? nextIdentity,
          shortDescription: input.shortAr,
        },
        update: {
          name: input.nameAr,
          slug: nextAr,
          shortDescription: input.shortAr,
        },
      });
    }

    return product;
  },
});

export const deleteProduct = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_input, result) => productTags(result.slug),
  audit: {
    action: "product.delete",
    entityType: "product",
    entityId: (input) => input.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      notFound("Product");
    }
    return prisma.product.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const duplicateProduct = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_input, result) => productTags(result.slug),
  audit: {
    action: "product.duplicate",
    entityType: "product",
    entityId: (_input, result) => result.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      include: {
        translations: true,
        images: true,
        priceTiers: true,
        options: {
          include: {
            translations: true,
            values: { include: { translations: true } },
          },
        },
        relationsFrom: true,
      },
    });
    if (!existing) {
      notFound("Product");
    }
    const slug = await generateUniqueSlug("product", "en", copySuffix(existing.slug));
    const slugAr = await generateUniqueSlug(
      "product",
      "ar",
      copySuffix(existing.translations.find((row) => row.locale === "AR")?.slug ?? slug),
    );
    const en = existing.translations.find((row) => row.locale === "EN");
    const ar = existing.translations.find((row) => row.locale === "AR");
    return prisma.product.create({
      data: {
        slug,
        sku: existing.sku ? `${existing.sku}-COPY` : null,
        categoryId: existing.categoryId,
        status: "DRAFT",
        isFeatured: false,
        isNew: existing.isNew,
        includesDesign: existing.includesDesign,
        sameDayAvailable: existing.sameDayAvailable,
        minOrderQty: existing.minOrderQty,
        turnaroundDays: existing.turnaroundDays,
        basePrice: existing.basePrice,
        priceUnit: existing.priceUnit,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            name:
              row.locale === "AR"
                ? `${ar?.name ?? en?.name ?? existing.slug} (نسخة)`
                : `${en?.name ?? existing.slug} (copy)`,
            slug: row.locale === "AR" ? slugAr : slug,
            shortDescription: row.shortDescription,
            longDescription: row.longDescription ?? undefined,
            specifications: row.specifications ?? undefined,
            materials: row.materials ?? undefined,
            useCases: row.useCases ?? undefined,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            ogTitle: row.ogTitle,
            ogDescription: row.ogDescription,
            ogImageId: row.ogImageId,
            canonicalUrl: row.canonicalUrl,
            noIndex: row.noIndex,
            noFollow: row.noFollow,
            focusKeyword: row.focusKeyword,
          })),
        },
        images: {
          create: existing.images.map((image) => ({
            mediaId: image.mediaId,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          })),
        },
        priceTiers: {
          create: existing.priceTiers.map((tier) => ({
            minQty: tier.minQty,
            maxQty: tier.maxQty,
            unitPrice: tier.unitPrice,
          })),
        },
        options: {
          create: existing.options.map((option) => ({
            key: option.key,
            sortOrder: option.sortOrder,
            translations: {
              create: option.translations.map((row) => ({
                locale: row.locale,
                label: row.label,
              })),
            },
            values: {
              create: option.values.map((value) => ({
                value: value.value,
                priceModifier: value.priceModifier,
                sortOrder: value.sortOrder,
                translations: {
                  create: value.translations.map((row) => ({
                    locale: row.locale,
                    label: row.label,
                  })),
                },
              })),
            },
          })),
        },
        relationsFrom: {
          create: existing.relationsFrom.map((rel) => ({
            relatedProductId: rel.relatedProductId,
            sortOrder: rel.sortOrder,
          })),
        },
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const toggleProductStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_input, result) => productTags(result.slug),
  audit: {
    action: "product.toggleStatus",
    entityType: "product",
    entityId: (input) => input.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, status: true },
    });
    if (!existing) {
      notFound("Product");
    }
    const status = nextStatus(existing.status);
    return prisma.product.update({
      where: { id: existing.id },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true, slug: true, status: true },
    });
  },
});

export const reorderProducts = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.products(), tags.global()],
  audit: {
    action: "product.reorder",
    entityType: "product",
    entityId: () => "batch",
  },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.product.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkUpdateProductStatus = createAction({
  input: bulkStatusSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.products(), tags.global(), tags.search()],
  audit: {
    action: "product.bulkUpdateStatus",
    entityType: "product",
    entityId: () => "batch",
  },
  handler: async ({ input }) => {
    const result = await prisma.product.updateMany({
      where: { id: { in: input.ids } },
      data: {
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
      },
    });
    return { count: result.count };
  },
});

export const bulkDeleteProducts = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.products(), tags.global(), tags.search()],
  audit: {
    action: "product.bulkDelete",
    entityType: "product",
    entityId: () => "batch",
  },
  handler: async ({ input }) => {
    const result = await prisma.product.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "ARCHIVED" },
    });
    return { count: result.count };
  },
});

export const toggleProductFeatured = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => productTags(r.slug),
  audit: {
    action: "product.toggleFeatured",
    entityType: "product",
    entityId: (i) => i.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: { id: true, slug: true, isFeatured: true },
    });
    if (!existing) {
      notFound("Product");
    }
    return prisma.product.update({
      where: { id: existing.id },
      data: { isFeatured: !existing.isFeatured },
      select: { id: true, slug: true, isFeatured: true },
    });
  },
});

export const saveProduct = createAction({
  input: productSaveSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => productTags(r.slug),
  audit: {
    action: "product.save",
    entityType: "product",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug(
      "product",
      "en",
      input.slugEn || input.nameEn,
      input.id,
    );
    const slugAr = await generateUniqueSlug(
      "product",
      "ar",
      input.slugAr || input.nameAr || input.nameEn,
      input.id,
    );
    const status = input.status ?? "DRAFT";
    const publishedAt =
      parsePublishedAt(input.publishedAt) ?? (status === "PUBLISHED" ? new Date() : null);
    const core = {
      slug,
      sku: emptyToNull(input.sku),
      categoryId: input.categoryId === undefined ? undefined : input.categoryId,
      status,
      isFeatured: input.isFeatured ?? false,
      isNew: input.isNew ?? false,
      includesDesign: input.includesDesign ?? false,
      sameDayAvailable: input.sameDayAvailable ?? false,
      minOrderQty: input.minOrderQty === undefined ? undefined : input.minOrderQty,
      turnaroundDays: input.turnaroundDays === undefined ? undefined : input.turnaroundDays,
      basePrice: emptyToNull(input.basePrice),
      priceUnit: emptyToNull(input.priceUnit),
      publishedAt,
    };

    if (!input.id) {
      const created = await prisma.product.create({
        data: {
          ...core,
          translations: {
            create: [
              { locale: "EN", ...productTranslationData(input, "EN", slug) },
              { locale: "AR", ...productTranslationData(input, "AR", slugAr) },
            ],
          },
        },
        select: { id: true, slug: true, status: true },
      });
      await syncProductNested(created.id, input);
      return created;
    }

    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        slug: true,
        status: true,
        translations: { select: { locale: true, slug: true } },
      },
    });
    if (!existing) {
      notFound("Product");
    }
    const published = status === "PUBLISHED";
    if (slug !== existing.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "product",
        oldSlug: existing.slug,
        newSlug: slug,
        locale: "en",
      });
    }
    const ar = existing.translations.find((row) => row.locale === "AR");
    if (ar && slugAr !== ar.slug) {
      await redirectOnPublishedSlugChange({
        published,
        entityType: "product",
        oldSlug: ar.slug,
        newSlug: slugAr,
        locale: "ar",
      });
    }
    const row = await prisma.product.update({
      where: { id: existing.id },
      data: core,
      select: { id: true, slug: true, status: true },
    });
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: existing.id, locale: "EN" } },
      create: { productId: existing.id, locale: "EN", ...productTranslationData(input, "EN", slug) },
      update: productTranslationData(input, "EN", slug),
    });
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: existing.id, locale: "AR" } },
      create: {
        productId: existing.id,
        locale: "AR",
        ...productTranslationData(input, "AR", slugAr),
      },
      update: productTranslationData(input, "AR", slugAr),
    });
    await syncProductNested(existing.id, input);
    return row;
  },
});

