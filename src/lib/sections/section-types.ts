import type { SectionType } from "@/generated/prisma/enums";

export const SECTION_TYPES = [
  "HERO",
  "USP_GRID",
  "SERVICE_GRID",
  "CATEGORY_GRID",
  "FEATURED_PRODUCTS",
  "RICH_TEXT",
  "IMAGE_TEXT",
  "STATS",
  "TESTIMONIALS",
  "PARTNERS",
  "CTA_BANNER",
  "FAQ",
  "GALLERY",
  "PRICING_TABLE",
  "STEPS",
  "VIDEO",
  "CONTACT_FORM",
] as const satisfies readonly SectionType[];

export function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPES as readonly string[]).includes(value);
}
