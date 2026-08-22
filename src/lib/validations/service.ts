import { z } from "zod";

import { jsonValueSchema, translationCopySchema } from "@/lib/validations/common";
import {
  contentStatusSchema,
  localeSeoSchema,
  moneyStringSchema,
  processStepSchema,
} from "@/lib/validations/catalogue";

export const serviceSaveSchema = translationCopySchema.extend({
  id: z.string().min(1).optional(),
  status: contentStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  iconName: z.string().max(60).nullable().optional(),
  categoryId: z.string().min(1).nullable().optional(),
  turnaroundTime: z.string().max(80).optional(),
  startingPrice: moneyStringSchema,
  imageId: z.string().min(1).nullable().optional(),
  heroImageId: z.string().min(1).nullable().optional(),
  publishedAt: z.string().optional(),
  ctaLabelEn: z.string().max(80).optional(),
  ctaLabelAr: z.string().max(80).optional(),
  heroHeadingEn: z.string().max(200).optional(),
  heroHeadingAr: z.string().max(200).optional(),
  heroSubheadingEn: z.string().max(400).optional(),
  heroSubheadingAr: z.string().max(400).optional(),
  longEn: jsonValueSchema.optional(),
  longAr: jsonValueSchema.optional(),
  benefitsEn: z.array(z.string()).optional(),
  benefitsAr: z.array(z.string()).optional(),
  processStepsEn: z.array(processStepSchema).optional(),
  processStepsAr: z.array(processStepSchema).optional(),
  seoEn: localeSeoSchema.optional(),
  seoAr: localeSeoSchema.optional(),
});

export type ServiceSaveInput = z.infer<typeof serviceSaveSchema>;
