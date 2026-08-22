import type { Locale } from "@/i18n/locales";
import type {
  CategoryKind,
  FaqScope,
  MenuLocation,
  SectionType,
} from "@/generated/prisma/enums";

export type { Locale } from "@/i18n/locales";
export type { CategoryKind, FaqScope, MenuLocation, SectionType };

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type LocaleServeMeta = {
  servedLocale: Locale;
  isFallback: boolean;
};

export type SeoDto = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
  jsonLdOverride: JsonValue | null;
  focusKeyword: string | null;
};

export type MediaDto = LocaleServeMeta & {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
  title: string | null;
  blurDataUrl: string | null;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
};

export type ProductSort =
  | "featured"
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export type CategorySummary = LocaleServeMeta & {
  id: string;
  identitySlug: string;
  slug: string;
  kind: CategoryKind;
  name: string;
  href: string;
  iconName: string | null;
  isFeatured: boolean;
};

export type CategoryTreeNode = CategorySummary & {
  shortDescription: string | null;
  image: MediaDto | null;
  children: CategoryTreeNode[];
};

export type CategoryDetail = CategorySummary & {
  shortDescription: string | null;
  longDescription: string | null;
  heroHeading: string | null;
  heroSubheading: string | null;
  image: MediaDto | null;
  ancestors: CategorySummary[];
  children: CategorySummary[];
  seo: SeoDto;
};

export type ProductCard = LocaleServeMeta & {
  id: string;
  identitySlug: string;
  slug: string;
  href: string;
  name: string;
  shortDescription: string | null;
  sku: string | null;
  isFeatured: boolean;
  isNew: boolean;
  includesDesign: boolean;
  sameDayAvailable: boolean;
  minOrderQty: number | null;
  turnaroundDays: number | null;
  basePrice: string | null;
  priceUnit: string | null;
  primaryImage: MediaDto | null;
  category: CategorySummary | null;
};

export type ProductOptionValueDto = LocaleServeMeta & {
  id: string;
  value: string;
  label: string;
  priceModifier: string;
  sortOrder: number;
};

export type ProductOptionDto = LocaleServeMeta & {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  values: ProductOptionValueDto[];
};

export type ProductPriceTierDto = {
  minQty: number;
  maxQty: number | null;
  unitPrice: string;
};

export type ProductDetail = ProductCard & {
  longDescription: JsonValue | null;
  specifications: JsonValue | null;
  materials: JsonValue | null;
  useCases: JsonValue | null;
  images: MediaDto[];
  options: ProductOptionDto[];
  priceTiers: ProductPriceTierDto[];
  seo: SeoDto;
  publishedAt: string | null;
};

export type SitemapSlug = {
  identitySlug: string;
  slugs: { en: string; ar: string };
  updatedAt: string;
  changeFrequency: string | null;
  priority: number | null;
};

export type ServiceCard = LocaleServeMeta & {
  id: string;
  identitySlug: string;
  slug: string;
  href: string;
  name: string;
  shortDescription: string | null;
  iconName: string | null;
  isFeatured: boolean;
  turnaroundTime: string | null;
  startingPrice: string | null;
  image: MediaDto | null;
};

export type ServiceDetail = ServiceCard & {
  longDescription: JsonValue | null;
  benefits: JsonValue | null;
  processSteps: JsonValue | null;
  heroHeading: string | null;
  heroSubheading: string | null;
  ctaLabel: string | null;
  heroImage: MediaDto | null;
  seo: SeoDto;
};

export type PageSectionDto = LocaleServeMeta & {
  id: string;
  type: SectionType;
  sortOrder: number;
  settings: JsonValue;
  data: JsonValue;
};

export type PageDetail = LocaleServeMeta & {
  id: string;
  identitySlug: string;
  slug: string;
  href: string;
  path: string[];
  title: string;
  excerpt: string | null;
  content: JsonValue | null;
  template: string | null;
  sections: PageSectionDto[];
  seo: SeoDto;
  publishedAt: string | null;
};

export type AuthorDto = LocaleServeMeta & {
  id: string;
  identitySlug: string;
  slug: string;
  href: string;
  name: string;
  role: string | null;
};

export type PostCard = LocaleServeMeta & {
  id: string;
  identitySlug: string;
  slug: string;
  href: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  readingMinutes: number | null;
  isFeatured: boolean;
  coverImage: MediaDto | null;
  author: AuthorDto | null;
  categories: CategorySummary[];
};

export type PostDetail = PostCard & {
  content: JsonValue | null;
  tags: { slug: string; name: string }[];
  seo: SeoDto;
};

export type FaqDto = LocaleServeMeta & {
  id: string;
  question: string;
  answer: JsonValue;
  sortOrder: number;
  groupId: string | null;
  groupHeading: string | null;
};

export type MenuItemDto = LocaleServeMeta & {
  id: string;
  label: string;
  description: string | null;
  href: string;
  openInNewTab: boolean;
  iconName: string | null;
  isMegaMenu: boolean;
  highlight: boolean;
  image: MediaDto | null;
  children: MenuItemDto[];
};

export type LocationDto = LocaleServeMeta & {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  addressLine1: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  googleMapsUrl: string | null;
  hours: JsonValue | null;
};

export type SiteSettingsDto = LocaleServeMeta & {
  companyName: string;
  tagline: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  mapsUrl: string;
  hours: JsonValue | null;
  hoursLabel: string;
  social: {
    facebook: string | null;
    instagram: string | null;
    linkedin: string | null;
    pinterest: string | null;
    x: string | null;
  };
  metaTitleTemplate: string;
  defaultOgImageId: string | null;
  defaultOgImageUrl: string | null;
  ga4Id: string | null;
  whatsappDefaultMessage: string;
  location: LocationDto | null;
};

export type TestimonialDto = LocaleServeMeta & {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  rating: number | null;
  avatar: MediaDto | null;
};

export type PartnerDto = LocaleServeMeta & {
  id: string;
  name: string;
  websiteUrl: string | null;
  logo: MediaDto | null;
};

export type StatDto = LocaleServeMeta & {
  id: string;
  value: string;
  prefix: string | null;
  suffix: string | null;
  iconName: string | null;
  label: string;
};

export type ProjectCard = LocaleServeMeta & {
  id: string;
  identitySlug: string;
  slug: string;
  href: string;
  title: string;
  summary: string | null;
  clientName: string | null;
  completedAt: string | null;
  coverImage: MediaDto | null;
  category: CategorySummary | null;
};

export type ProjectDetail = ProjectCard & {
  content: JsonValue | null;
  challenge: string | null;
  solution: string | null;
  result: string | null;
  images: MediaDto[];
  seo: SeoDto;
};

export type BreadcrumbEntityType =
  | "product"
  | "category"
  | "service"
  | "page"
  | "post"
  | "project";

export type BreadcrumbItemDto = LocaleServeMeta & {
  href: string | null;
  label: string;
};

export type SearchHit = LocaleServeMeta & {
  entityType: "product" | "service" | "page" | "post" | "category" | "project";
  entityId: string;
  slug: string;
  title: string;
  excerpt: string;
  href: string;
};

export type PublishedProductsQuery = {
  locale: Locale;
  categorySlug?: string;
  page?: number;
  perPage?: number;
  sort?: ProductSort;
  featured?: boolean;
  search?: string;
};

export type PublishedPostsQuery = {
  locale: Locale;
  categorySlug?: string;
  tagSlug?: string;
  page?: number;
  perPage?: number;
  featured?: boolean;
};

export type FaqsQuery = {
  locale: Locale;
  scope: FaqScope;
  entityId?: string;
};
