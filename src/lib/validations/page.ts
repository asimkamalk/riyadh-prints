import { z } from "zod";

import { jsonValueSchema } from "@/lib/validations/common";
import { contentStatusSchema, localeSeoSchema } from "@/lib/validations/catalogue";

export const pageSaveSchema = z.object({
  id: z.string().min(1).optional(),
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
  sortOrder: z.number().int().optional(),
  showInSitemap: z.boolean().optional(),
  priority: z.number().min(0).max(1).nullable().optional(),
  changeFrequency: z.string().max(40).optional(),
  publishedAt: z.string().optional(),
  seoEn: localeSeoSchema.optional(),
  seoAr: localeSeoSchema.optional(),
});

export type PageSaveInput = z.infer<typeof pageSaveSchema>;
