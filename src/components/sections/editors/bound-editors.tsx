"use client";

import { makeSectionEditor } from "@/components/sections/editors/generic-editor";
import {
  GalleryEditor,
  HeroEditor,
  ImageTextEditor,
} from "@/components/sections/editors/media-editors";
import {
  contactFields,
  ctaFields,
  headingFields,
  headingOnlyFields,
  pricingFields,
  richTextFields,
  stepsFields,
  uspFields,
  videoFields,
} from "@/lib/sections/schemas";
import type { SectionEditorProps, SectionType } from "@/lib/sections/types";
import type { ComponentType } from "react";

export { GalleryEditor, HeroEditor, ImageTextEditor };

export const UspGridEditor = makeSectionEditor(uspFields);
export const ServiceGridEditor = makeSectionEditor(headingFields);
export const CategoryGridEditor = makeSectionEditor(headingFields);
export const FeaturedProductsEditor = makeSectionEditor(headingFields);
export const RichTextEditor = makeSectionEditor(richTextFields);
export const StatsEditor = makeSectionEditor(headingOnlyFields);
export const TestimonialsEditor = makeSectionEditor(headingOnlyFields);
export const PartnersEditor = makeSectionEditor(headingOnlyFields);
export const CtaBannerEditor = makeSectionEditor(ctaFields);
export const FaqEditor = makeSectionEditor(headingOnlyFields);
export const PricingTableEditor = makeSectionEditor(pricingFields);
export const StepsEditor = makeSectionEditor(stepsFields);
export const VideoEditor = makeSectionEditor(videoFields);
export const ContactFormEditor = makeSectionEditor(contactFields);

export const sectionEditors = {
  HERO: HeroEditor,
  USP_GRID: UspGridEditor,
  SERVICE_GRID: ServiceGridEditor,
  CATEGORY_GRID: CategoryGridEditor,
  FEATURED_PRODUCTS: FeaturedProductsEditor,
  RICH_TEXT: RichTextEditor,
  IMAGE_TEXT: ImageTextEditor,
  STATS: StatsEditor,
  TESTIMONIALS: TestimonialsEditor,
  PARTNERS: PartnersEditor,
  CTA_BANNER: CtaBannerEditor,
  FAQ: FaqEditor,
  GALLERY: GalleryEditor,
  PRICING_TABLE: PricingTableEditor,
  STEPS: StepsEditor,
  VIDEO: VideoEditor,
  CONTACT_FORM: ContactFormEditor,
} as const satisfies Record<SectionType, ComponentType<SectionEditorProps>>;

export function getSectionEditor(type: SectionType): ComponentType<SectionEditorProps> {
  return sectionEditors[type];
}
