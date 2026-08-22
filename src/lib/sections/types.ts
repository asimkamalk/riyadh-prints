import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";

import type { SectionType } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/locales";
import type {
  CategoryTreeNode,
  FaqDto,
  MediaDto,
  PartnerDto,
  ProductCard,
  ServiceCard,
  StatDto,
  TestimonialDto,
} from "@/types/content";

export type { SectionType };

export type SectionRecord = Record<string, unknown>;

export type EditorFieldKind =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "boolean"
  | "enum"
  | "richtext"
  | "media"
  | "stringList";

export type EditorScalarField = {
  key: string;
  label: string;
  kind: EditorFieldKind;
  options?: { value: string; label: string }[];
};

export type EditorListField = {
  key: string;
  label: string;
  kind: "list";
  itemFields: EditorScalarField[];
  addLabel?: string;
};

export type EditorField = EditorScalarField | EditorListField;

export type SectionEditorProps = {
  data: SectionRecord;
  settings: SectionRecord;
  onChangeData: (data: SectionRecord) => void;
  onChangeSettings: (settings: SectionRecord) => void;
};

export type SectionResolvedData = {
  products: ProductCard[];
  categories: CategoryTreeNode[];
  services: ServiceCard[];
  stats: StatDto[];
  partners: PartnerDto[];
  testimonials: TestimonialDto[];
  faqs: FaqDto[];
  mediaById: Record<string, MediaDto>;
  pageId: string;
  quoteHref: string;
  whatsappUrl: string;
};

export type SectionRenderProps = {
  id: string;
  data: SectionRecord;
  settings: SectionRecord;
  locale: Locale;
  headingLevel: 1 | 2;
  resolved: SectionResolvedData;
};

export type SectionDefaults = {
  data: SectionRecord;
  settings: SectionRecord;
};

export type SectionCatalogEntry = {
  type: SectionType;
  label: string;
  description: string;
  icon: LucideIcon;
  schema: z.ZodType;
  settingsSchema: z.ZodType;
  defaults: SectionDefaults;
  editorFields: EditorField[];
  settingsFields: EditorField[];
  summarize: (data: unknown) => string;
};

export type SectionDefinition = SectionCatalogEntry & {
  Editor: ComponentType<SectionEditorProps>;
  Renderer: ComponentType<SectionRenderProps>;
};
