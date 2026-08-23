import { z } from "zod";

import { translationCopySchema } from "@/lib/validations/common";
import { localeSeoSchema } from "@/lib/validations/catalogue";

export const teamSkillSchema = z.object({
  label: z.string().trim().min(1).max(120),
  percent: z.number().int().min(0).max(100),
});

export const teamSocialsSchema = z.object({
  linkedin: z.url().optional().or(z.literal("")),
  facebook: z.url().optional().or(z.literal("")),
  twitter: z.url().optional().or(z.literal("")),
});

export const teamMemberSaveSchema = translationCopySchema.extend({
  id: z.string().min(1).optional(),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  phone: z.string().trim().max(30).optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  avatarId: z.string().min(1).nullable().optional(),
  socials: teamSocialsSchema.optional(),
  roleEn: z.string().max(120).optional(),
  roleAr: z.string().max(120).optional(),
  secondaryRoleEn: z.string().max(120).optional(),
  secondaryRoleAr: z.string().max(120).optional(),
  bioEn: z.string().max(8000).optional(),
  bioAr: z.string().max(8000).optional(),
  experienceEn: z.string().max(12000).optional(),
  experienceAr: z.string().max(12000).optional(),
  awardsEn: z.string().max(12000).optional(),
  awardsAr: z.string().max(12000).optional(),
  skillsEn: z.array(teamSkillSchema).optional(),
  skillsAr: z.array(teamSkillSchema).optional(),
  seoEn: localeSeoSchema.optional(),
  seoAr: localeSeoSchema.optional(),
});

export type TeamMemberSaveInput = z.infer<typeof teamMemberSaveSchema>;
