import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageView } from "@/components/site/cms-page";
import { firstSearchParam } from "@/components/site/draft-preview-banner";
import { isLocale, type Locale } from "@/i18n/locales";
import { buildMetadata, contentMetadata } from "@/lib/seo/metadata";
import { resolveCmsPage } from "@/server/queries/page-preview";

export const revalidate = 60;

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
    return buildMetadata({ locale, path: "/", derivedTitle: "Riyadh Prints", noIndex: true });
  }
  const { entity, isPreview } = resolved;
  return contentMetadata({
    locale,
    path: "/",
    seo: entity.seo,
    derivedTitle: entity.title,
    derivedDescription: entity.excerpt,
    noIndex: isPreview,
  });
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
