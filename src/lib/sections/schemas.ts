import { z } from "zod";

import { sectionLayoutSchema } from "@/lib/sections/layout";
import type { EditorField } from "@/lib/sections/types";

const text = (max = 200) => z.string().trim().max(max).default("");
const longText = (max = 4000) => z.string().trim().max(max).default("");
const optionalId = z.string().min(1).optional().nullable();

const itemSchema = z.object({
  title: text(120),
  body: longText(500),
});

const mediaItemSchema = z.object({
  mediaId: z.string().min(1).default(""),
  alt: text(200),
});

const planSchema = z.object({
  name: text(80),
  price: text(40),
  unit: text(40),
  features: z.array(z.string().trim().max(200)).default([]),
  cta: text(80),
});

const stepSchema = z.object({
  title: text(120),
  body: longText(500),
});

export const heroContentSchema = z.object({
  heading: text(180),
  subheading: longText(400),
  primaryCta: text(80),
  secondaryCta: text(80),
  primaryHref: z.string().trim().max(300).default(""),
  secondaryHref: z.string().trim().max(300).default(""),
});

export const heroSettingsSchema = sectionLayoutSchema.extend({
  layout: z.enum(["split", "stack", "overlay"]).default("split"),
  cta: z.enum(["quote", "whatsapp", "none"]).default("quote"),
  imageId: optionalId,
});

export const uspContentSchema = z.object({
  heading: text(120),
  items: z.array(itemSchema).default([]),
});

export const uspSettingsSchema = sectionLayoutSchema.extend({
  columns: z.number().int().min(1).max(6).default(4),
});

export const headingContentSchema = z.object({
  heading: text(120),
  subheading: longText(300),
});

export const serviceGridSettingsSchema = sectionLayoutSchema.extend({
  featuredOnly: z.boolean().default(true),
  limit: z.number().int().min(1).max(24).default(6),
});

export const categoryGridSettingsSchema = sectionLayoutSchema.extend({
  kind: z.enum(["PRODUCT", "POST", "PORTFOLIO", "SERVICE", "PAGE"]).default("PRODUCT"),
  limit: z.number().int().min(1).max(30).default(15),
});

export const featuredProductsSettingsSchema = sectionLayoutSchema.extend({
  limit: z.number().int().min(1).max(24).default(8),
});

export const richTextContentSchema = z.object({
  heading: text(120),
  body: z.unknown().optional(),
});

export const imageTextContentSchema = z.object({
  heading: text(160),
  body: longText(2000),
  cta: text(80),
  href: z.string().trim().max(300).default(""),
});

export const imageTextSettingsSchema = sectionLayoutSchema.extend({
  mediaSide: z.enum(["start", "end"]).default("end"),
  imageId: optionalId,
});

export const statsContentSchema = z.object({
  heading: text(160),
});

export const partnersContentSchema = z.object({
  heading: text(160),
});

export const testimonialsContentSchema = z.object({
  heading: text(160),
});

export const testimonialsSettingsSchema = sectionLayoutSchema.extend({
  limit: z.number().int().min(1).max(12).default(6),
});

export const ctaBannerContentSchema = z.object({
  heading: text(180),
  cta: text(80),
  secondary: text(160),
  href: z.string().trim().max(300).default(""),
});

export const ctaBannerSettingsSchema = sectionLayoutSchema.extend({
  variant: z.enum(["accent", "inverse", "muted"]).default("accent"),
});

export const faqContentSchema = z.object({
  heading: text(160),
});

export const faqSettingsSchema = sectionLayoutSchema.extend({
  scope: z.enum(["GLOBAL", "PAGE", "PRODUCT", "CATEGORY", "SERVICE", "POST", "PROJECT"]).default("GLOBAL"),
});

export const galleryContentSchema = z.object({
  heading: text(160),
  items: z.array(mediaItemSchema).default([]),
});

export const pricingContentSchema = z.object({
  heading: text(160),
  subheading: longText(300),
  plans: z.array(planSchema).default([]),
});

export const stepsContentSchema = z.object({
  heading: text(160),
  steps: z.array(stepSchema).default([]),
});

export const videoContentSchema = z.object({
  heading: text(160),
  url: z.string().trim().max(500).default(""),
  caption: longText(300),
});

export const contactFormContentSchema = z.object({
  heading: text(160),
  submit: text(80),
});

export const contactFormSettingsSchema = sectionLayoutSchema.extend({
  variant: z.enum(["contact", "quote"]).default("contact"),
});

export const heroFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "subheading", label: "Subheading", kind: "textarea" },
  { key: "primaryCta", label: "Primary CTA label", kind: "text" },
  { key: "secondaryCta", label: "Secondary CTA label", kind: "text" },
  { key: "primaryHref", label: "Primary CTA URL", kind: "url" },
  { key: "secondaryHref", label: "Secondary CTA URL", kind: "url" },
];

export const uspFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  {
    key: "items",
    label: "Items",
    kind: "list",
    addLabel: "Add USP",
    itemFields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
];

export const headingFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "subheading", label: "Subheading", kind: "textarea" },
];

export const headingOnlyFields: EditorField[] = [{ key: "heading", label: "Heading", kind: "text" }];

export const richTextFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "body", label: "Body", kind: "richtext" },
];

export const imageTextFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "body", label: "Body", kind: "textarea" },
  { key: "cta", label: "CTA label", kind: "text" },
  { key: "href", label: "CTA URL", kind: "url" },
];

export const ctaFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "cta", label: "CTA label", kind: "text" },
  { key: "secondary", label: "Secondary line", kind: "text" },
  { key: "href", label: "CTA URL", kind: "url" },
];

export const galleryFields: EditorField[] = [{ key: "heading", label: "Heading", kind: "text" }];

export const pricingFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "subheading", label: "Subheading", kind: "textarea" },
  {
    key: "plans",
    label: "Plans",
    kind: "list",
    addLabel: "Add plan",
    itemFields: [
      { key: "name", label: "Name", kind: "text" },
      { key: "price", label: "Price", kind: "text" },
      { key: "unit", label: "Unit", kind: "text" },
      { key: "cta", label: "CTA", kind: "text" },
      { key: "features", label: "Features (one per line)", kind: "stringList" },
    ],
  },
];

export const stepsFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  {
    key: "steps",
    label: "Steps",
    kind: "list",
    addLabel: "Add step",
    itemFields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
];

export const videoFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "url", label: "Video URL", kind: "url" },
  { key: "caption", label: "Caption", kind: "textarea" },
];

export const contactFields: EditorField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "submit", label: "Submit label", kind: "text" },
];

export const serviceSettingsFields: EditorField[] = [
  { key: "featuredOnly", label: "Featured only", kind: "boolean" },
  { key: "limit", label: "Limit", kind: "number" },
];

export const categorySettingsFields: EditorField[] = [
  {
    key: "kind",
    label: "Category kind",
    kind: "enum",
    options: [
      { value: "PRODUCT", label: "Product" },
      { value: "SERVICE", label: "Service" },
      { value: "POST", label: "Blog" },
      { value: "PORTFOLIO", label: "Portfolio" },
    ],
  },
  { key: "limit", label: "Limit", kind: "number" },
];

export const limitSettingsFields: EditorField[] = [{ key: "limit", label: "Limit", kind: "number" }];

export const columnsSettingsFields: EditorField[] = [{ key: "columns", label: "Columns", kind: "number" }];

export const heroSettingsFields: EditorField[] = [
  {
    key: "layout",
    label: "Layout",
    kind: "enum",
    options: [
      { value: "split", label: "Split" },
      { value: "stack", label: "Stack" },
      { value: "overlay", label: "Overlay" },
    ],
  },
  {
    key: "cta",
    label: "Default CTA pair",
    kind: "enum",
    options: [
      { value: "quote", label: "Quote + WhatsApp" },
      { value: "whatsapp", label: "WhatsApp only" },
      { value: "none", label: "None" },
    ],
  },
];

export const imageTextSettingsFields: EditorField[] = [
  {
    key: "mediaSide",
    label: "Image side",
    kind: "enum",
    options: [
      { value: "start", label: "Start" },
      { value: "end", label: "End" },
    ],
  },
];

export const ctaSettingsFields: EditorField[] = [
  {
    key: "variant",
    label: "Variant",
    kind: "enum",
    options: [
      { value: "accent", label: "Accent" },
      { value: "inverse", label: "Inverse" },
      { value: "muted", label: "Muted" },
    ],
  },
];

export const faqSettingsFields: EditorField[] = [
  {
    key: "scope",
    label: "FAQ source",
    kind: "enum",
    options: [
      { value: "GLOBAL", label: "Global FAQs" },
      { value: "PAGE", label: "This page" },
    ],
  },
];

export const contactSettingsFields: EditorField[] = [
  {
    key: "variant",
    label: "Form variant",
    kind: "enum",
    options: [
      { value: "contact", label: "Contact" },
      { value: "quote", label: "Quote request" },
    ],
  },
];
