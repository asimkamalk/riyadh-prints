import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageView } from "@/components/site/cms-page";
import { firstSearchParam } from "@/components/site/draft-preview-banner";
import { isLocale, type Locale } from "@/i18n/locales";
import { verifyPreviewToken } from "@/lib/preview-token";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPageByIdUncached } from "@/server/queries/pages";

type DraftPreviewProps = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    locale: "en",
    path: "/preview",
    title: "Draft preview",
    noIndex: true,
    noFollow: true,
  });
}

export default async function DraftPagePreviewPage({ params, searchParams }: DraftPreviewProps) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const token = firstSearchParam((await searchParams).preview);
  const payload = verifyPreviewToken(token);
  if (!payload || payload.type !== "page" || payload.id !== id) {
    notFound();
  }
  const page = await getPageByIdUncached(id, locale);
  if (!page) {
    notFound();
  }
  return <CmsPageView page={page} locale={locale} isPreview />;
}
