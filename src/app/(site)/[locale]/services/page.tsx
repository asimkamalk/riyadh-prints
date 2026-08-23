import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ListingHeader } from "@/components/site/content-chrome";
import { ServiceGrid } from "@/components/site/content-grids";
import { pageText } from "@/components/site/page-copy";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { collectionPage, itemListFromServices } from "@/lib/seo/json-ld";
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { getAllServices } from "@/server/queries";

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
    path: "/services",
    derivedTitle: pageText(locale, "services"),
    derivedDescription: pageText(locale, "servicesIntro"),
  });
}

export default async function ServicesIndexPage({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const pathname = withLocalePath(locale, "/services");
  const services = await getAllServices(locale);

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "services") }]} />
      <JsonLd
        data={[
          collectionPage({
            name: pageText(locale, "services"),
            url: pathname,
            description: pageText(locale, "servicesIntro"),
          }),
          ...(services.length ? [itemListFromServices(services)] : []),
        ]}
      />
      <ListingHeader title={pageText(locale, "services")} intro={pageText(locale, "servicesIntro")} />
      <ServiceGrid services={services} locale={locale} />
    </div>
  );
}
