import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { firstSearchParam } from "@/components/site/draft-preview-banner";
import { pageText } from "@/components/site/page-copy";
import { ProductDetailView } from "@/components/site/product-detail-view";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { buildMetadata, contentMetadata, homeCrumb, localePairPaths } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  getFaqsFor,
  getProductSlugsForSitemap,
  getRelatedProducts,
  getSiteSettings,
  resolveProductPage,
} from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const rows = await getProductSlugsForSitemap();
  return rows.map((row) => ({ slug: row.identitySlug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const resolved = await resolveProductPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return buildMetadata({ locale, path: `/product/${slug}`, derivedTitle: "Product", noIndex: true });
  }
  const { entity, isPreview } = resolved;
  return contentMetadata({
    locale,
    ...localePairPaths(locale, "/product", entity.slugs),
    seo: entity.seo,
    derivedTitle: entity.name,
    derivedDescription: entity.shortDescription,
    ogImage: entity.images[0]?.url ?? entity.primaryImage?.url,
    type: "product",
    noIndex: isPreview,
  });
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const resolved = await resolveProductPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  const { entity, isPreview } = resolved;
  const [faqs, related, settings] = await Promise.all([
    getFaqsFor({ locale, scope: "PRODUCT", entityId: entity.id }),
    getRelatedProducts(entity.identitySlug, locale),
    getSiteSettings(locale),
  ]);
  const quoteHref = `${withLocalePath(locale, "/request-a-quote")}?productId=${encodeURIComponent(entity.id)}`;
  const whatsappHref = whatsappUrl(
    settings.whatsapp || settings.phone,
    `${settings.whatsappDefaultMessage} ${entity.name}`.trim(),
  );
  const crumbs = [
    homeCrumb(locale),
    { href: withLocalePath(locale, "/shop"), label: pageText(locale, "shop") },
    ...(entity.category ? [{ href: entity.category.href, label: entity.category.name }] : []),
    { label: entity.name },
  ];

  return (
    <ProductDetailView
      locale={locale}
      product={entity}
      faqs={faqs}
      related={related}
      crumbs={crumbs}
      isPreview={isPreview}
      quoteHref={quoteHref}
      whatsappHref={whatsappHref}
    />
  );
}
