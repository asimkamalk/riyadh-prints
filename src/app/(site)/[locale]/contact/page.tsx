import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ListingHeader } from "@/components/site/content-chrome";
import { ContactCards, HoursCard } from "@/components/site/contact-cards";
import { MapFacade } from "@/components/site/map-facade";
import { pageText } from "@/components/site/page-copy";
import { QuoteRequestForm } from "@/components/site/quote-request-form";
import { isLocale, type Locale } from "@/i18n/locales";
import { mapsEmbedSrc } from "@/lib/maps-embed";
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import { getAllServices, getPublishedProducts, getSiteSettings } from "@/server/queries";

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
    path: "/contact",
    derivedTitle: pageText(locale, "contact"),
    derivedDescription: pageText(locale, "contactIntro"),
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const [settings, services, products] = await Promise.all([
    getSiteSettings(locale),
    getAllServices(locale),
    getPublishedProducts({ locale, perPage: 100 }),
  ]);
  const whatsappHref = whatsappUrl(settings.whatsapp || settings.phone, settings.whatsappDefaultMessage);
  const embedSrc = mapsEmbedSrc(settings.mapsUrl);

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "contact") }]} />
      <ListingHeader title={pageText(locale, "contact")} intro={pageText(locale, "contactIntro")} />
      <div className="grid gap-12 lg:grid-cols-2">
        <QuoteRequestForm
          locale={locale}
          whatsappHref={whatsappHref}
          services={services.map((service) => ({ id: service.id, name: service.name }))}
          products={products.items.map((product) => ({ id: product.id, name: product.name }))}
        />
        <div className="grid gap-6 self-start">
          <ContactCards locale={locale} settings={settings} whatsappHref={whatsappHref} />
          <HoursCard locale={locale} hours={settings.hours} hoursLabel={settings.hoursLabel} />
          {embedSrc ? (
            <MapFacade locale={locale} embedSrc={embedSrc} address={settings.address} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
