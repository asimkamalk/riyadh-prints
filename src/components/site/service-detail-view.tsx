import Image from "next/image";

import { TiptapBody } from "@/components/sections/tiptap-body";
import { Breadcrumbs, type Crumb } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/site/content-chrome";
import { ProductGrid } from "@/components/site/content-grids";
import { DraftPreviewBanner } from "@/components/site/draft-preview-banner";
import { formatStartingPrice } from "@/components/site/format";
import { LazyGallery } from "@/components/site/lazy-gallery";
import { mediaToGalleryItem } from "@/components/site/gallery-types";
import { pageText } from "@/components/site/page-copy";
import { QuoteCta } from "@/components/site/quote-cta";
import type { Locale } from "@/i18n/locales";
import { parseProcessSteps, parseStringList } from "@/lib/catalogue-json";
import { serviceFromDetail } from "@/lib/seo/json-ld";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type { FaqDto, ProductCard, ServiceDetail } from "@/types/content";

export function ServiceDetailView({
  locale,
  service,
  faqs,
  related,
  crumbs,
  isPreview,
  quoteHref,
  whatsappHref,
}: {
  locale: Locale;
  service: ServiceDetail;
  faqs: FaqDto[];
  related: ProductCard[];
  crumbs: Crumb[];
  isPreview: boolean;
  quoteHref: string;
  whatsappHref: string;
}) {
  const benefits = parseStringList(service.benefits);
  const steps = parseProcessSteps(service.processSteps);
  const hero = service.heroImage ?? service.image;
  const gallery = [service.heroImage, service.image]
    .filter((image): image is NonNullable<typeof image> => Boolean(image))
    .filter((image, index, all) => all.findIndex((item) => item.url === image.url) === index)
    .map((image) => mediaToGalleryItem({ ...image, alt: image.alt || service.name }));
  const price = formatStartingPrice(locale, service.startingPrice);
  const hasLong = Boolean(tiptapToPlainText(service.longDescription));

  return (
    <article className="container-page py-xl">
      {isPreview ? <DraftPreviewBanner /> : null}
      <Breadcrumbs items={crumbs} />
      <JsonLd data={serviceFromDetail(service)} />
      {hero ? (
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
          <Image
            src={hero.url}
            alt={hero.alt || service.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            placeholder={hero.blurDataUrl ? "blur" : "empty"}
            blurDataURL={hero.blurDataUrl ?? undefined}
          />
        </div>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight">{service.heroHeading || service.name}</h1>
      {service.heroSubheading ? (
        <p className="mt-2 text-lg text-muted-foreground">{service.heroSubheading}</p>
      ) : null}
      {price ? <p className="mt-4 text-lg font-medium">{price}</p> : null}
      {service.turnaroundTime ? (
        <p className="text-sm text-muted-foreground">{service.turnaroundTime}</p>
      ) : null}
      {service.shortDescription ? (
        <p className="mt-4 text-muted-foreground">{service.shortDescription}</p>
      ) : null}
      {benefits.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">{pageText(locale, "benefits")}</h2>
          <ul className="grid list-disc gap-1 ps-5">
            {benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {steps.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">{pageText(locale, "process")}</h2>
          <ol className="grid gap-4">
            {steps.map((step, index) => (
              <li key={`${step.title}-${index}`}>
                <p className="font-medium">
                  {index + 1}. {step.title}
                </p>
                {step.description ? (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {gallery.length > 1 ? (
        <div className="mt-10">
          <LazyGallery items={gallery} locale={locale} />
        </div>
      ) : null}
      {hasLong ? (
        <div className="prose-rp mt-12">
          <TiptapBody value={service.longDescription} />
        </div>
      ) : null}
      {related.length ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">{pageText(locale, "related")}</h2>
          <ProductGrid products={related} locale={locale} />
        </section>
      ) : null}
      <FaqSection locale={locale} faqs={faqs} />
      <div className="mt-10">
        <QuoteCta locale={locale} quoteHref={quoteHref} whatsappHref={whatsappHref} quoteLabel={service.ctaLabel} />
      </div>
    </article>
  );
}
