import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { CategoryCard } from "@/components/site/category-card";
import { DraftPreviewBanner, firstSearchParam } from "@/components/site/draft-preview-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { categoryJsonLd } from "@/lib/seo/catalogue-jsonld";
import { absoluteUrl } from "@/lib/utils/site-url";
import { resolveCategoryPage } from "@/server/queries/catalogue-preview";

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
  const resolved = await resolveCategoryPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    return { title: "Category" };
  }
  const { entity, isPreview } = resolved;
  const path = `/product-category/${entity.identitySlug}`;
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

export default async function ProductCategoryPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const resolved = await resolveCategoryPage(slug, locale, firstSearchParam((await searchParams).preview));
  if (!resolved) {
    notFound();
  }
  const { entity, isPreview } = resolved;
  const crumbs = [
    { href: withLocalePath(locale, "/"), label: locale === "ar" ? "الرئيسية" : "Home" },
    ...entity.ancestors.map((item) => ({ href: item.href, label: item.name })),
    { label: entity.name },
  ];

  return (
    <article className="container-page py-xl">
      {isPreview ? <DraftPreviewBanner /> : null}
      <Breadcrumbs items={crumbs} />
      <JsonLd data={categoryJsonLd(entity)} />
      {entity.image ? (
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
          <Image
            src={entity.image.url}
            alt={entity.image.alt || entity.name}
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
      {entity.shortDescription ? (
        <p className="mt-4 text-muted-foreground">{entity.shortDescription}</p>
      ) : null}
      {entity.longDescription ? <p className="mt-4">{entity.longDescription}</p> : null}
      {entity.children.length ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entity.children.map((child) => (
            <li key={child.id}>
              <CategoryCard category={child} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
