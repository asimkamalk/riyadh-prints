import { z } from "zod";

import { MEDIA_TYPE_FILTERS } from "@/lib/media-types";

export const mediaTypeFilterSchema = z.enum(MEDIA_TYPE_FILTERS);

export const mediaViewSchema = z.enum(["grid", "list"]);

const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

export const mediaListQuerySchema = z.object({
  query: z.string().trim().max(120).optional(),
  folder: z.string().trim().max(80).optional(),
  type: mediaTypeFilterSchema.optional(),
  from: dateParam.optional(),
  to: dateParam.optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
});

export const mediaCreateSchema = z.object({
  url: z.string().url(),
  pathname: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(120),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  folder: z.string().max(80).optional(),
  altEn: z.string().trim().min(1).max(200),
  altAr: z.string().trim().max(200).optional(),
  titleEn: z.string().max(200).optional(),
  titleAr: z.string().max(200).optional(),
  captionEn: z.string().max(500).optional(),
  captionAr: z.string().max(500).optional(),
});

export const mediaUpdateSchema = mediaCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const mediaMoveSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  folder: z.string().min(1).max(80),
});

export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;
