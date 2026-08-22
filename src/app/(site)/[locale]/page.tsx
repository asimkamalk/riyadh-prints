import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageView } from "@/components/site/cms-page";
import { firstSearchParam } from "@/components/site/draft-preview-banner";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/utils/site-url";
import { resolveCmsPage } from "@/server/queries/page-preview";

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }
  const locale = rawLocale as Locale;
  const resolved = await resolveCmsPage([], locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return { title: "Riyadh Prints" };
  }
  const { entity, isPreview } = resolved;
  const title = entity.seo.metaTitle || entity.title;
  const description = entity.seo.metaDescription || entity.excerpt || undefined;
  return {
    title,
    description,
    robots: { index: !isPreview && !entity.seo.noIndex, follow: !entity.seo.noFollow },
    alternates: {
      canonical: entity.seo.canonicalUrl || absoluteUrl(withLocalePath(locale, "/")),
      languages: {
        en: absoluteUrl(withLocalePath("en", "/")),
        ar: absoluteUrl(withLocalePath("ar", "/")),
        "x-default": absoluteUrl(withLocalePath("en", "/")),
      },
    },
  };
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }
  const locale = rawLocale as Locale;
  const resolved = await resolveCmsPage([], locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  return <CmsPageView page={resolved.entity} locale={locale} isPreview={resolved.isPreview} />;
}
