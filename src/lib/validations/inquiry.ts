import { z } from "zod";

import { appLocaleSchema } from "./common";

export const submitInquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().min(8).max(30),
  company: z.string().trim().max(120).optional(),
  serviceInterest: z.string().trim().max(200).optional(),
  productId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  quantity: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
  locale: appLocaleSchema.default("en"),
  /** Honeypot — must stay empty. */
  website: z.string().max(200).optional(),
  honeypot: z.string().max(200).optional(),
  /** Client clock when the form was rendered (unix ms). */
  formStartedAt: z.number().int().positive(),
});

export const updateInquirySchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "WON", "LOST", "SPAM"]).optional(),
  adminNotes: z.string().max(5000).optional(),
  assignedToId: z.string().min(1).nullable().optional(),
});
