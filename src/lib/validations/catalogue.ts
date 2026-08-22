import { z } from "zod";

import { contentStatusSchema, seoInputSchema } from "@/lib/validations/common";

export const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount.")
  .optional()
  .or(z.literal(""));

export const signedMoneyStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d{1,2})?$/, "Enter a valid amount.")
  .optional()
  .or(z.literal(""));

export const kvRowSchema = z.object({
  key: z.string().trim().max(120),
  value: z.string().trim().max(500),
});

export const processStepSchema = z.object({
  icon: z.string().trim().max(60).optional(),
  title: z.string().trim().max(200),
  description: z.string().trim().max(1000),
});

export const localeSeoSchema = seoInputSchema.omit({ canonicalUrl: true }).extend({
  ogImageId: z.string().min(1).nullable().optional(),
  canonicalUrl: z
    .union([z.string().url(), z.literal("")])
    .optional(),
});

export const galleryImageSchema = z.object({
  mediaId: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  isPrimary: z.boolean(),
});

export const priceTierInputSchema = z.object({
  minQty: z.number().int().positive(),
  maxQty: z.number().int().positive().nullable().optional(),
  unitPrice: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount."),
});

export const optionValueInputSchema = z.object({
  id: z.string().min(1).optional(),
  value: z.string().trim().min(1).max(80),
  priceModifier: signedMoneyStringSchema,
  sortOrder: z.number().int().nonnegative(),
  labelEn: z.string().trim().min(1).max(120),
  labelAr: z.string().trim().max(120).optional(),
});

export const optionInputSchema = z.object({
  id: z.string().min(1).optional(),
  key: z.string().trim().min(1).max(80),
  sortOrder: z.number().int().nonnegative(),
  labelEn: z.string().trim().min(1).max(120),
  labelAr: z.string().trim().max(120).optional(),
  values: z.array(optionValueInputSchema).max(50),
});

export { contentStatusSchema };
