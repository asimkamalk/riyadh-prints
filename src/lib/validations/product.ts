import { z } from "zod";

import { jsonValueSchema, translationCopySchema } from "@/lib/validations/common";
import {
  contentStatusSchema,
  galleryImageSchema,
  kvRowSchema,
  localeSeoSchema,
  moneyStringSchema,
  optionInputSchema,
  priceTierInputSchema,
} from "@/lib/validations/catalogue";

export const productSaveSchema = translationCopySchema.extend({
  id: z.string().min(1).optional(),
  sku: z.string().trim().max(80).optional(),
  categoryId: z.string().min(1).nullable().optional(),
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  includesDesign: z.boolean().optional(),
  sameDayAvailable: z.boolean().optional(),
  minOrderQty: z.number().int().positive().nullable().optional(),
  turnaroundDays: z.number().int().nonnegative().nullable().optional(),
  basePrice: moneyStringSchema,
  priceUnit: z.string().max(40).optional(),
  publishedAt: z.string().optional(),
  longEn: jsonValueSchema.optional(),
  longAr: jsonValueSchema.optional(),
  specificationsEn: z.array(kvRowSchema).optional(),
  specificationsAr: z.array(kvRowSchema).optional(),
  materialsEn: z.array(z.string()).optional(),
  materialsAr: z.array(z.string()).optional(),
  useCasesEn: z.array(z.string()).optional(),
  useCasesAr: z.array(z.string()).optional(),
  seoEn: localeSeoSchema.optional(),
  seoAr: localeSeoSchema.optional(),
  images: z.array(galleryImageSchema).max(40).optional(),
  priceTiers: z.array(priceTierInputSchema).max(30).optional(),
  options: z.array(optionInputSchema).max(20).optional(),
  relatedProductIds: z.array(z.string().min(1)).max(40).optional(),
});

export type ProductSaveInput = z.infer<typeof productSaveSchema>;
