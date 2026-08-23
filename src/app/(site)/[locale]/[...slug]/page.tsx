import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageView } from "@/components/site/cms-page";
import { firstSearchParam } from "@/components/site/draft-preview-banner";
import { isLocale, type Locale } from "@/i18n/locales";
import { stripLocalePrefix } from "@/i18n/routing";
import { isReservedSiteSegment } from "@/lib/site-path";
import { buildMetadata, contentMetadata } from "@/lib/seo/metadata";
import { getAlternateLocaleHref, getPublishedPagePaths, resolveCmsPage } from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const paths = await getPublishedPagePaths();
  return paths.map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || slug.length === 0 || isReservedSiteSegment(slug[0] ?? "")) {
    return {};
  }
  const locale = raw as Locale;
  const resolved = await resolveCmsPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return buildMetadata({
      locale,
      path: `/${slug.join("/")}`,
      derivedTitle: "Page",
      noIndex: true,
    });
  }
  const { entity, isPreview } = resolved;
  const alternateHref = await getAlternateLocaleHref(entity.href, locale);
  return contentMetadata({
    locale,
    path: stripLocalePrefix(entity.href),
    alternatePath: stripLocalePrefix(alternateHref),
    seo: entity.seo,
    derivedTitle: entity.title,
    derivedDescription: entity.excerpt,
    noIndex: isPreview,
  });
}

export default async function CmsCatchAllPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || slug.length === 0 || isReservedSiteSegment(slug[0] ?? "")) {
    notFound();
  }
  const locale = raw as Locale;
  const resolved = await resolveCmsPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  return <CmsPageView page={resolved.entity} locale={locale} isPreview={resolved.isPreview} />;
}
