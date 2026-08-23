import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ListingHeader } from "@/components/site/content-chrome";
import { FaqBrowser } from "@/components/site/faq-browser";
import { pageText } from "@/components/site/page-copy";
import { isLocale, type Locale } from "@/i18n/locales";
import { faqPage } from "@/lib/seo/json-ld";
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { getFaqsFor } from "@/server/queries";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  return buildMetadata({
    locale,
    path: "/faqs",
    derivedTitle: pageText(locale, "faqs"),
    derivedDescription: pageText(locale, "faqs"),
  });
}

export default async function FaqsPage({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const faqs = await getFaqsFor({ locale, scope: "GLOBAL" });

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "faqs") }]} />
      {faqs.length ? <JsonLd data={faqPage(faqs)} /> : null}
      <ListingHeader title={pageText(locale, "faqs")} />
      <FaqBrowser locale={locale} faqs={faqs} />
    </div>
  );
}
