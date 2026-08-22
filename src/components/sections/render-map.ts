import {
  CategoryGridRenderer,
  FeaturedProductsRenderer,
  ServiceGridRenderer,
  UspGridRenderer,
} from "@/components/sections/catalogue-grids";
import { ContactFormRenderer } from "@/components/sections/contact-form";
import {
  GalleryRenderer,
  ImageTextRenderer,
  PricingTableRenderer,
  RichTextRenderer,
  StepsRenderer,
  VideoRenderer,
} from "@/components/sections/content-blocks";
import { FaqRenderer } from "@/components/sections/faq";
import { HeroRenderer } from "@/components/sections/hero";
import {
  CtaBannerRenderer,
  PartnersRenderer,
  StatsRenderer,
  TestimonialsRenderer,
} from "@/components/sections/social-proof";
import type { SectionRenderProps, SectionType } from "@/lib/sections/types";
import type { ComponentType } from "react";

export const sectionRenderers = {
  HERO: HeroRenderer,
  USP_GRID: UspGridRenderer,
  SERVICE_GRID: ServiceGridRenderer,
  CATEGORY_GRID: CategoryGridRenderer,
  FEATURED_PRODUCTS: FeaturedProductsRenderer,
  RICH_TEXT: RichTextRenderer,
  IMAGE_TEXT: ImageTextRenderer,
  STATS: StatsRenderer,
  TESTIMONIALS: TestimonialsRenderer,
  PARTNERS: PartnersRenderer,
  CTA_BANNER: CtaBannerRenderer,
  FAQ: FaqRenderer,
  GALLERY: GalleryRenderer,
  PRICING_TABLE: PricingTableRenderer,
  STEPS: StepsRenderer,
  VIDEO: VideoRenderer,
  CONTACT_FORM: ContactFormRenderer,
} as const satisfies Record<SectionType, ComponentType<SectionRenderProps>>;

export function getSectionRenderer(type: SectionType): ComponentType<SectionRenderProps> {
  return sectionRenderers[type];
}
