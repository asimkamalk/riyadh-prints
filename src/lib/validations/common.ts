import { z } from "zod";

export const contentStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const inquiryStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUOTED",
  "WON",
  "LOST",
  "SPAM",
]);

export const userRoleSchema = z.enum(["ADMIN", "EDITOR", "VIEWER"]);

export const appLocaleSchema = z.enum(["en", "ar"]);

export const idSchema = z.object({
  id: z.string().min(1),
});

export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int(),
      }),
    )
    .min(1),
});

export const bulkIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  status: contentStatusSchema,
});

export const jsonValueSchema = z.unknown();

export const seoInputSchema = z.object({
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(180).optional(),
  ogTitle: z.string().max(70).optional(),
  ogDescription: z.string().max(180).optional(),
  canonicalUrl: z.string().url().optional(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
  focusKeyword: z.string().max(80).optional(),
});

export const translationCopySchema = z.object({
  nameEn: z.string().trim().min(1).max(200),
  nameAr: z.string().trim().max(200).optional(),
  slugEn: z.string().trim().max(200).optional(),
  slugAr: z.string().trim().max(200).optional(),
  shortEn: z.string().max(500).optional(),
  shortAr: z.string().max(500).optional(),
});
