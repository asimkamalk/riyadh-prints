import { z } from "zod";

import { translationCopySchema } from "@/lib/validations/common";
import { contentStatusSchema, localeSeoSchema } from "@/lib/validations/catalogue";

export const categoryKindSchema = z.enum([
  "PRODUCT",
  "POST",
  "PORTFOLIO",
  "SERVICE",
  "PAGE",
]);

export const categorySaveSchema = translationCopySchema.extend({
  id: z.string().min(1).optional(),
  kind: categoryKindSchema.optional(),
  parentId: z.string().min(1).nullable().optional(),
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  iconName: z.string().max(60).nullable().optional(),
  imageId: z.string().min(1).nullable().optional(),
  sortOrder: z.number().int().optional(),
  longEn: z.string().max(20_000).optional(),
  longAr: z.string().max(20_000).optional(),
  heroHeadingEn: z.string().max(200).optional(),
  heroHeadingAr: z.string().max(200).optional(),
  heroSubheadingEn: z.string().max(400).optional(),
  heroSubheadingAr: z.string().max(400).optional(),
  seoEn: localeSeoSchema.optional(),
  seoAr: localeSeoSchema.optional(),
});

export const categoryMoveSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().min(1).nullable(),
  sortOrder: z.number().int(),
});

export type CategorySaveInput = z.infer<typeof categorySaveSchema>;
