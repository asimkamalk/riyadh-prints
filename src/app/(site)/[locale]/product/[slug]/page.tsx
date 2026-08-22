import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { DraftPreviewBanner, firstSearchParam } from "@/components/site/draft-preview-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { productJsonLd } from "@/lib/seo/catalogue-jsonld";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import { parseKvRows, parseStringList } from "@/lib/catalogue-json";
import { absoluteUrl } from "@/lib/utils/site-url";
import { resolveProductPage } from "@/server/queries/catalogue-preview";

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
  const resolved = await resolveProductPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return { title: "Product" };
  }
  const { entity, isPreview } = resolved;
  const title = entity.seo.metaTitle || entity.name;
  const description = entity.seo.metaDescription || entity.shortDescription || undefined;
  const path = `/product/${entity.identitySlug}`;
  const canonical = entity.seo.canonicalUrl || absoluteUrl(withLocalePath(locale, path));
  return {
    title,
    description,
    robots: {
      index: !isPreview && !entity.seo.noIndex,
      follow: !entity.seo.noFollow,
    },
    alternates: {
      canonical,
      languages: {
        en: absoluteUrl(withLocalePath("en", path)),
        ar: absoluteUrl(withLocalePath("ar", path)),
        "x-default": absoluteUrl(withLocalePath("en", path)),
      },
    },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const resolved = await resolveProductPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  const { entity, isPreview } = resolved;
  const specs = parseKvRows(entity.specifications);
  const materials = parseStringList(entity.materials);
  const primary = entity.images[0] ?? entity.primaryImage;
  const crumbs = [
    { href: withLocalePath(locale, "/"), label: locale === "ar" ? "الرئيسية" : "Home" },
    ...(entity.category
      ? [{ href: entity.category.href, label: entity.category.name }]
      : []),
    { label: entity.name },
  ];

  return (
    <main className="container-page py-xl">
      {isPreview ? <DraftPreviewBanner /> : null}
      <Breadcrumbs items={crumbs} />
      <JsonLd data={productJsonLd(entity)} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {primary ? (
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image
                src={primary.url}
                alt={primary.alt || entity.name}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          ) : null}
        </div>
        <div className="grid gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{entity.name}</h1>
          {entity.shortDescription ? (
            <p className="text-muted-foreground">{entity.shortDescription}</p>
          ) : null}
          {entity.basePrice ? (
            <p className="text-lg font-medium">
              {entity.basePrice} SAR{entity.priceUnit ? ` / ${entity.priceUnit}` : ""}
            </p>
          ) : null}
          {tiptapToPlainText(entity.longDescription) ? (
            <p>{tiptapToPlainText(entity.longDescription)}</p>
          ) : null}
          {specs.length ? (
            <dl className="grid gap-2">
              {specs.map((row) => (
                <div key={row.key} className="flex justify-between gap-4 text-sm">
                  <dt className="text-muted-foreground">{row.key}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {materials.length ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Materials: </span>
              {materials.join(", ")}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
