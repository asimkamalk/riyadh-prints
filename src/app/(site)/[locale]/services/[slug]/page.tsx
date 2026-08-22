import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { DraftPreviewBanner, firstSearchParam } from "@/components/site/draft-preview-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { parseProcessSteps, parseStringList } from "@/lib/catalogue-json";
import { serviceJsonLd } from "@/lib/seo/catalogue-jsonld";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import { absoluteUrl } from "@/lib/utils/site-url";
import { resolveServicePage } from "@/server/queries/catalogue-preview";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const resolved = await resolveServicePage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return { title: "Service" };
  }
  const { entity, isPreview } = resolved;
  const path = `/services/${entity.identitySlug}`;
  return {
    title: entity.seo.metaTitle || entity.name,
    description: entity.seo.metaDescription || entity.shortDescription || undefined,
    robots: { index: !isPreview && !entity.seo.noIndex, follow: !entity.seo.noFollow },
    alternates: {
      canonical: entity.seo.canonicalUrl || absoluteUrl(withLocalePath(locale, path)),
      languages: {
        en: absoluteUrl(withLocalePath("en", path)),
        ar: absoluteUrl(withLocalePath("ar", path)),
        "x-default": absoluteUrl(withLocalePath("en", path)),
      },
    },
  };
}

export default async function ServicePage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const resolved = await resolveServicePage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  const { entity, isPreview } = resolved;
  const benefits = parseStringList(entity.benefits);
  const steps = parseProcessSteps(entity.processSteps);
  const hero = entity.heroImage ?? entity.image;
  const crumbs = [
    { href: withLocalePath(locale, "/"), label: locale === "ar" ? "الرئيسية" : "Home" },
    { href: withLocalePath(locale, "/services"), label: locale === "ar" ? "الخدمات" : "Services" },
    { label: entity.name },
  ];

  return (
    <article className="container-page py-xl">
      {isPreview ? <DraftPreviewBanner /> : null}
      <Breadcrumbs items={crumbs} />
      <JsonLd data={serviceJsonLd(entity)} />
      {hero ? (
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
          <Image
            src={hero.url}
            alt={hero.alt || entity.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight">
        {entity.heroHeading || entity.name}
      </h1>
      {entity.heroSubheading ? (
        <p className="mt-2 text-lg text-muted-foreground">{entity.heroSubheading}</p>
      ) : null}
      {entity.startingPrice ? (
        <p className="mt-4 text-lg font-medium">From {entity.startingPrice} SAR</p>
      ) : null}
      {entity.turnaroundTime ? (
        <p className="text-sm text-muted-foreground">Turnaround: {entity.turnaroundTime}</p>
      ) : null}
      {entity.shortDescription ? (
        <p className="mt-4 text-muted-foreground">{entity.shortDescription}</p>
      ) : null}
      {tiptapToPlainText(entity.longDescription) ? (
        <p className="mt-4">{tiptapToPlainText(entity.longDescription)}</p>
      ) : null}
      {benefits.length ? (
        <ul className="mt-6 grid list-disc gap-1 ps-5">
          {benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {steps.length ? (
        <ol className="mt-8 grid gap-4">
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
      ) : null}
    </article>
  );
}
