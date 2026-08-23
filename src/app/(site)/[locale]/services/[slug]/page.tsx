import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { firstSearchParam } from "@/components/site/draft-preview-banner";
import { pageText } from "@/components/site/page-copy";
import { ServiceDetailView } from "@/components/site/service-detail-view";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { buildMetadata, contentMetadata, homeCrumb, localePairPaths } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  getFaqsFor,
  getPublishedProducts,
  getServiceSlugsForSitemap,
  getSiteSettings,
  resolveServicePage,
} from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const rows = await getServiceSlugsForSitemap();
  return rows.map((row) => ({ slug: row.identitySlug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const resolved = await resolveServicePage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return buildMetadata({
      locale,
      path: `/services/${slug}`,
      derivedTitle: "Service",
      noIndex: true,
    });
  }
  const { entity, isPreview } = resolved;
  return contentMetadata({
    locale,
    ...localePairPaths(locale, "/services", entity.slugs),
    seo: entity.seo,
    derivedTitle: entity.name,
    derivedDescription: entity.shortDescription,
    ogImage: entity.heroImage?.url ?? entity.image?.url,
    noIndex: isPreview,
  });
}

export default async function ServicePage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const resolved = await resolveServicePage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  const { entity, isPreview } = resolved;
  const [faqs, related, settings] = await Promise.all([
    getFaqsFor({ locale, scope: "SERVICE", entityId: entity.id }),
    getPublishedProducts({ locale, featured: true, perPage: 4 }),
    getSiteSettings(locale),
  ]);
  const quoteHref = `${withLocalePath(locale, "/request-a-quote")}?serviceId=${encodeURIComponent(entity.id)}`;
  const whatsappHref = whatsappUrl(
    settings.whatsapp || settings.phone,
    `${settings.whatsappDefaultMessage} ${entity.name}`.trim(),
  );
  const crumbs = [
    homeCrumb(locale),
    { href: withLocalePath(locale, "/services"), label: pageText(locale, "services") },
    { label: entity.name },
  ];

  return (
    <ServiceDetailView
      locale={locale}
      service={entity}
      faqs={faqs}
      related={related.items}
      crumbs={crumbs}
      isPreview={isPreview}
      quoteHref={quoteHref}
      whatsappHref={whatsappHref}
    />
  );
}
