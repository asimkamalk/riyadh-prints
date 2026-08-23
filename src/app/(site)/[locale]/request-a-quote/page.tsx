import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ListingHeader } from "@/components/site/content-chrome";
import { pageText } from "@/components/site/page-copy";
import { QuoteRequestForm } from "@/components/site/quote-request-form";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { firstParam } from "@/lib/search-params";
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import { getAllServices, getPublishedProducts, getSiteSettings } from "@/server/queries";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  return buildMetadata({
    locale,
    path: "/request-a-quote",
    derivedTitle: pageText(locale, "quote"),
    derivedDescription: pageText(locale, "quoteIntro"),
  });
}

export default async function QuotePage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const sp = await searchParams;
  const [settings, services, products] = await Promise.all([
    getSiteSettings(locale),
    getAllServices(locale),
    getPublishedProducts({ locale, perPage: 100 }),
  ]);
  const whatsappHref = whatsappUrl(settings.whatsapp || settings.phone, settings.whatsappDefaultMessage);

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "quote") }]} />
      <ListingHeader title={pageText(locale, "quote")} intro={pageText(locale, "quoteIntro")} />
      <div className="max-w-2xl">
        <QuoteRequestForm
          locale={locale}
          whatsappHref={whatsappHref}
          services={services.map((service) => ({ id: service.id, name: service.name }))}
          products={products.items.map((product) => ({ id: product.id, name: product.name }))}
          defaultProductId={firstParam(sp.productId)}
          defaultServiceId={firstParam(sp.serviceId)}
        />
      </div>
    </div>
  );
}
