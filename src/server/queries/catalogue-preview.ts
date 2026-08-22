import { verifyPreviewToken, type PreviewEntityType } from "@/lib/preview-token";
import type { Locale } from "@/i18n/locales";
import type { CategoryDetail, ProductDetail, ServiceDetail } from "@/types/content";
import { getCategoryByIdUncached, getCategoryBySlug } from "@/server/queries/categories";
import { getProductByIdUncached, getProductBySlug } from "@/server/queries/products";
import { getServiceByIdUncached, getServiceBySlug } from "@/server/queries/services";

export type CataloguePageResult<T> = {
  entity: T;
  isPreview: boolean;
};

function slugMatches(entity: { slug: string; identitySlug: string }, slug: string): boolean {
  return entity.slug === slug || entity.identitySlug === slug;
}

export async function resolveProductPage(
  slug: string,
  locale: Locale,
  preview: string | undefined,
): Promise<CataloguePageResult<ProductDetail> | null> {
  const live = await getProductBySlug(slug, locale);
  if (live) {
    return { entity: live, isPreview: false };
  }
  const payload = verifyPreviewToken(preview);
  if (!payload || payload.type !== "product") {
    return null;
  }
  const draft = await getProductByIdUncached(payload.id, locale);
  if (!draft || !slugMatches(draft, slug)) {
    return null;
  }
  return { entity: draft, isPreview: true };
}

export async function resolveCategoryPage(
  slug: string,
  locale: Locale,
  preview: string | undefined,
): Promise<CataloguePageResult<CategoryDetail> | null> {
  const live = await getCategoryBySlug(slug, locale, "PRODUCT");
  if (live) {
    return { entity: live, isPreview: false };
  }
  const payload = verifyPreviewToken(preview);
  if (!payload || payload.type !== "category") {
    return null;
  }
  const draft = await getCategoryByIdUncached(payload.id, locale);
  if (!draft || !slugMatches(draft, slug)) {
    return null;
  }
  return { entity: draft, isPreview: true };
}

export async function resolveServicePage(
  slug: string,
  locale: Locale,
  preview: string | undefined,
): Promise<CataloguePageResult<ServiceDetail> | null> {
  const live = await getServiceBySlug(slug, locale);
  if (live) {
    return { entity: live, isPreview: false };
  }
  const payload = verifyPreviewToken(preview);
  if (!payload || payload.type !== "service") {
    return null;
  }
  const draft = await getServiceByIdUncached(payload.id, locale);
  if (!draft || !slugMatches(draft, slug)) {
    return null;
  }
  return { entity: draft, isPreview: true };
}

export type { PreviewEntityType };
