import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageView } from "@/components/site/cms-page";
import { firstSearchParam } from "@/components/site/draft-preview-banner";
import { isLocale, type Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/lib/utils/site-url";
import { pageHref } from "@/server/queries/_shared";
import { resolveCmsPage } from "@/server/queries/page-preview";

type PageProps = {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug = [] } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const resolved = await resolveCmsPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return { title: "Page" };
  }
  const { entity, isPreview } = resolved;
  const en = pageHref("en", entity.path);
  const ar = pageHref("ar", entity.path);
  return {
    title: entity.seo.metaTitle || entity.title,
    description: entity.seo.metaDescription || entity.excerpt || undefined,
    robots: { index: !isPreview && !entity.seo.noIndex, follow: !entity.seo.noFollow },
    alternates: {
      canonical: entity.seo.canonicalUrl || absoluteUrl(entity.href),
      languages: {
        en: absoluteUrl(en),
        ar: absoluteUrl(ar),
        "x-default": absoluteUrl(en),
      },
    },
  };
}

export default async function CmsCatchAllPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug = [] } = await params;
  if (!isLocale(raw) || slug.length === 0) {
    notFound();
  }
  const locale = raw as Locale;
  const resolved = await resolveCmsPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  return <CmsPageView page={resolved.entity} locale={locale} isPreview={resolved.isPreview} />;
}
