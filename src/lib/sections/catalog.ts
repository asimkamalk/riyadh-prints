import {
  AlignLeft,
  CircleHelp,
  FolderTree,
  ImageIcon,
  Images,
  LayoutGrid,
  LineChart,
  ListOrdered,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Package,
  PanelTop,
  Play,
  Puzzle,
  Share2,
  Table,
} from "lucide-react";
import { z } from "zod";

import { emptyTiptap } from "@/lib/catalogue-json";
import { defaultLayout, sectionLayoutSchema } from "@/lib/sections/layout";
import { asRecord, headingOf, summarizeHeading, summarizeItems } from "@/lib/sections/parse";
import { SECTION_TYPES } from "@/lib/sections/section-types";
import {
  categoryGridSettingsSchema,
  categorySettingsFields,
  contactFields,
  contactFormContentSchema,
  contactFormSettingsSchema,
  contactSettingsFields,
  ctaBannerContentSchema,
  ctaBannerSettingsSchema,
  ctaFields,
  ctaSettingsFields,
  faqContentSchema,
  faqSettingsFields,
  faqSettingsSchema,
  featuredProductsSettingsSchema,
  galleryContentSchema,
  galleryFields,
  gallerySettingsFields,
  gallerySettingsSchema,
  headingContentSchema,
  headingFields,
  headingOnlyFields,
  heroContentSchema,
  heroFields,
  heroSettingsFields,
  heroSettingsSchema,
  imageTextContentSchema,
  imageTextFields,
  imageTextSettingsFields,
  imageTextSettingsSchema,
  limitSettingsFields,
  partnersContentSchema,
  pricingContentSchema,
  pricingFields,
  richTextContentSchema,
  richTextFields,
  serviceGridSettingsSchema,
  serviceSettingsFields,
  statsContentSchema,
  stepsContentSchema,
  stepsFields,
  testimonialsContentSchema,
  testimonialsSettingsSchema,
  uspContentSchema,
  uspFields,
  uspSettingsFields,
  uspSettingsSchema,
  videoContentSchema,
  videoFields,
} from "@/lib/sections/schemas";
import type { SectionCatalogEntry, SectionDefaults, SectionType } from "@/lib/sections/types";

export { SECTION_TYPES, isSectionType } from "@/lib/sections/section-types";

export const sectionTypeSchema = z.enum(SECTION_TYPES);

function parsed<T>(schema: z.ZodType<T>, fallback: unknown): T {
  const result = schema.safeParse({});
  return result.success ? result.data : (fallback as T);
}

function bundle(data: unknown, settings: unknown): SectionDefaults {
  return {
    data: asRecord(data),
    settings: { ...defaultLayout(), ...asRecord(settings) },
  };
}

export const sectionCatalog = {
  HERO: {
    type: "HERO",
    label: "Hero",
    description: "Headline, supporting line, and primary CTAs.",
    icon: PanelTop,
    schema: heroContentSchema,
    settingsSchema: heroSettingsSchema,
    defaults: bundle(
      parsed(heroContentSchema, {
        eyebrow: "",
        heading: "",
        subheading: "",
        primaryCta: "",
        secondaryCta: "",
        primaryHref: "",
        secondaryHref: "",
        slides: [],
      }),
      parsed(heroSettingsSchema, {}),
    ),
    editorFields: heroFields,
    settingsFields: heroSettingsFields,
    summarize: (data) => headingOf(data) || "Hero",
  },
  USP_GRID: {
    type: "USP_GRID",
    label: "USP grid",
    description: "Short selling points in a column grid.",
    icon: LayoutGrid,
    schema: uspContentSchema,
    settingsSchema: uspSettingsSchema,
    defaults: bundle(
      parsed(uspContentSchema, { eyebrow: "", heading: "", body: "", cta: "", href: "", items: [] }),
      parsed(uspSettingsSchema, { columns: 4, appearance: "cards" }),
    ),
    editorFields: uspFields,
    settingsFields: uspSettingsFields,
    summarize: (data) => summarizeItems(data, "USP grid"),
  },
  SERVICE_GRID: {
    type: "SERVICE_GRID",
    label: "Service grid",
    description: "Cards from published services.",
    icon: Puzzle,
    schema: headingContentSchema,
    settingsSchema: serviceGridSettingsSchema,
    defaults: bundle(
      parsed(headingContentSchema, { heading: "", subheading: "" }),
      parsed(serviceGridSettingsSchema, {}),
    ),
    editorFields: headingFields,
    settingsFields: serviceSettingsFields,
    summarize: (data) => summarizeHeading(data, "Services"),
  },
  CATEGORY_GRID: {
    type: "CATEGORY_GRID",
    label: "Category grid",
    description: "Catalogue categories as a shop-by grid.",
    icon: FolderTree,
    schema: headingContentSchema,
    settingsSchema: categoryGridSettingsSchema,
    defaults: bundle(
      parsed(headingContentSchema, { heading: "", subheading: "" }),
      parsed(categoryGridSettingsSchema, {}),
    ),
    editorFields: headingFields,
    settingsFields: categorySettingsFields,
    summarize: (data) => summarizeHeading(data, "Categories"),
  },
  FEATURED_PRODUCTS: {
    type: "FEATURED_PRODUCTS",
    label: "Featured products",
    description: "Featured catalogue products with starting prices.",
    icon: Package,
    schema: headingContentSchema,
    settingsSchema: featuredProductsSettingsSchema,
    defaults: bundle(
      parsed(headingContentSchema, { heading: "", subheading: "" }),
      parsed(featuredProductsSettingsSchema, {}),
    ),
    editorFields: headingFields,
    settingsFields: limitSettingsFields,
    summarize: (data) => summarizeHeading(data, "Featured products"),
  },
  RICH_TEXT: {
    type: "RICH_TEXT",
    label: "Rich text",
    description: "Long-form copy for policies and articles.",
    icon: AlignLeft,
    schema: richTextContentSchema,
    settingsSchema: sectionLayoutSchema,
    defaults: bundle({ heading: "", body: emptyTiptap }, {}),
    editorFields: richTextFields,
    settingsFields: [],
    summarize: (data) => summarizeHeading(data, "Rich text"),
  },
  IMAGE_TEXT: {
    type: "IMAGE_TEXT",
    label: "Image + text",
    description: "Split block with an image beside copy.",
    icon: ImageIcon,
    schema: imageTextContentSchema,
    settingsSchema: imageTextSettingsSchema,
    defaults: bundle(
      parsed(imageTextContentSchema, {
        eyebrow: "",
        heading: "",
        body: "",
        cta: "",
        href: "",
        statValue: "",
        statLabel: "",
        items: [],
      }),
      parsed(imageTextSettingsSchema, {}),
    ),
    editorFields: imageTextFields,
    settingsFields: imageTextSettingsFields,
    summarize: (data) => summarizeHeading(data, "Image + text"),
  },
  STATS: {
    type: "STATS",
    label: "Stats",
    description: "Key numbers from the stats library.",
    icon: LineChart,
    schema: statsContentSchema,
    settingsSchema: sectionLayoutSchema,
    defaults: bundle(parsed(statsContentSchema, { heading: "" }), {}),
    editorFields: headingOnlyFields,
    settingsFields: [],
    summarize: (data) => summarizeHeading(data, "Stats"),
  },
  TESTIMONIALS: {
    type: "TESTIMONIALS",
    label: "Testimonials",
    description: "Published client quotes.",
    icon: MessageSquareQuote,
    schema: testimonialsContentSchema,
    settingsSchema: testimonialsSettingsSchema,
    defaults: bundle(parsed(testimonialsContentSchema, { heading: "" }), parsed(testimonialsSettingsSchema, {})),
    editorFields: headingOnlyFields,
    settingsFields: limitSettingsFields,
    summarize: (data) => summarizeHeading(data, "Testimonials"),
  },
  PARTNERS: {
    type: "PARTNERS",
    label: "Partners",
    description: "Logo strip from the partners library.",
    icon: Share2,
    schema: partnersContentSchema,
    settingsSchema: sectionLayoutSchema,
    defaults: bundle(parsed(partnersContentSchema, { heading: "" }), {}),
    editorFields: headingOnlyFields,
    settingsFields: [],
    summarize: (data) => summarizeHeading(data, "Partners"),
  },
  CTA_BANNER: {
    type: "CTA_BANNER",
    label: "CTA banner",
    description: "Full-width call to request a quote or WhatsApp.",
    icon: Megaphone,
    schema: ctaBannerContentSchema,
    settingsSchema: ctaBannerSettingsSchema,
    defaults: bundle(
      parsed(ctaBannerContentSchema, { heading: "", cta: "", secondary: "", href: "" }),
      parsed(ctaBannerSettingsSchema, {}),
    ),
    editorFields: ctaFields,
    settingsFields: ctaSettingsFields,
    summarize: (data) => summarizeHeading(data, "CTA banner"),
  },
  FAQ: {
    type: "FAQ",
    label: "FAQ",
    description: "Accordion from global or page FAQs.",
    icon: CircleHelp,
    schema: faqContentSchema,
    settingsSchema: faqSettingsSchema,
    defaults: bundle(parsed(faqContentSchema, { heading: "" }), parsed(faqSettingsSchema, {})),
    editorFields: headingOnlyFields,
    settingsFields: faqSettingsFields,
    summarize: (data) => summarizeHeading(data, "FAQ"),
  },
  GALLERY: {
    type: "GALLERY",
    label: "Gallery",
    description: "Image grid from the media library.",
    icon: Images,
    schema: galleryContentSchema,
    settingsSchema: gallerySettingsSchema,
    defaults: bundle(
      parsed(galleryContentSchema, { eyebrow: "", heading: "", items: [] }),
      parsed(gallerySettingsSchema, {}),
    ),
    editorFields: galleryFields,
    settingsFields: gallerySettingsFields,
    summarize: (data) => summarizeItems(data, "Gallery"),
  },
  PRICING_TABLE: {
    type: "PRICING_TABLE",
    label: "Pricing table",
    description: "Named plans with prices and feature lists.",
    icon: Table,
    schema: pricingContentSchema,
    settingsSchema: sectionLayoutSchema,
    defaults: bundle(parsed(pricingContentSchema, { heading: "", subheading: "", plans: [] }), {}),
    editorFields: pricingFields,
    settingsFields: [],
    summarize: (data) => summarizeHeading(data, "Pricing"),
  },
  STEPS: {
    type: "STEPS",
    label: "Steps",
    description: "Numbered process or how-it-works.",
    icon: ListOrdered,
    schema: stepsContentSchema,
    settingsSchema: sectionLayoutSchema,
    defaults: bundle(parsed(stepsContentSchema, { heading: "", subheading: "", steps: [] }), {}),
    editorFields: stepsFields,
    settingsFields: [],
    summarize: (data) => summarizeHeading(data, "Steps"),
  },
  VIDEO: {
    type: "VIDEO",
    label: "Video",
    description: "YouTube or Vimeo embed with reserved aspect ratio.",
    icon: Play,
    schema: videoContentSchema,
    settingsSchema: sectionLayoutSchema,
    defaults: bundle(parsed(videoContentSchema, { heading: "", url: "", caption: "" }), {}),
    editorFields: videoFields,
    settingsFields: [],
    summarize: (data) => summarizeHeading(data, "Video"),
  },
  CONTACT_FORM: {
    type: "CONTACT_FORM",
    label: "Contact form",
    description: "Contact or quote-request form.",
    icon: Mail,
    schema: contactFormContentSchema,
    settingsSchema: contactFormSettingsSchema,
    defaults: bundle(
      parsed(contactFormContentSchema, { heading: "", submit: "" }),
      parsed(contactFormSettingsSchema, {}),
    ),
    editorFields: contactFields,
    settingsFields: contactSettingsFields,
    summarize: (data) => summarizeHeading(data, "Contact form"),
  },
} as const satisfies Record<SectionType, SectionCatalogEntry>;

export function getSectionCatalog(type: SectionType): SectionCatalogEntry {
  return sectionCatalog[type];
}

export function listSectionCatalog(): SectionCatalogEntry[] {
  return Object.values(sectionCatalog);
}

export function defaultsFor(type: SectionType): SectionDefaults {
  return sectionCatalog[type].defaults;
}

export const sectionDefaults: Record<SectionType, SectionDefaults> = Object.fromEntries(
  SECTION_TYPES.map((type) => [type, sectionCatalog[type].defaults]),
) as Record<SectionType, SectionDefaults>;

export function parseSectionData(type: SectionType, data: unknown) {
  const entry = sectionCatalog[type];
  const parsedResult = entry.schema.safeParse({
    ...entry.defaults.data,
    ...asRecord(data),
  });
  return parsedResult.success ? (parsedResult.data as Record<string, unknown>) : entry.defaults.data;
}

export function parseSectionSettings(type: SectionType, settings: unknown) {
  const entry = sectionCatalog[type];
  const parsedResult = entry.settingsSchema.safeParse({
    ...entry.defaults.settings,
    ...asRecord(settings),
  });
  return parsedResult.success ? (parsedResult.data as Record<string, unknown>) : entry.defaults.settings;
}
