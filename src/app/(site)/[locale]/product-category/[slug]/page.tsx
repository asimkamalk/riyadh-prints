import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/site/content-chrome";
import { CategoryGrid } from "@/components/site/content-grids";
import { DraftPreviewBanner, firstSearchParam } from "@/components/site/draft-preview-banner";
import { pageText } from "@/components/site/page-copy";
import { ShopCatalog } from "@/components/site/shop-catalog";
import { flattenCategoryTree, parseShopFilters } from "@/components/site/shop-query";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { firstParam, parsePageParam } from "@/lib/search-params";
import { collectionFromCategory, itemListFromProducts } from "@/lib/seo/json-ld";
import { buildMetadata, contentMetadata, homeCrumb, localePairPaths } from "@/lib/seo/metadata";
import {
  getCategoryIdentitySlugs,
  getCategoryTree,
  getFaqsFor,
  getProductTags,
  getPublishedProducts,
  resolveCategoryPage,
} from "@/server/queries";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const slugs = await getCategoryIdentitySlugs("PRODUCT");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const sp = await searchParams;
  const resolved = await resolveCategoryPage(slug, locale, firstSearchParam(sp.preview));
  if (!resolved) {
    return buildMetadata({
      locale,
      path: `/product-category/${slug}`,
      derivedTitle: "Category",
      noIndex: true,
    });
  }
  const { entity, isPreview } = resolved;
  const page = parsePageParam(sp.page);
  const q = firstParam(sp.q)?.trim();
  return contentMetadata({
    locale,
    ...localePairPaths(locale, "/product-category", entity.slugs),
    seo: entity.seo,
    derivedTitle: entity.name,
    derivedDescription: entity.shortDescription,
    ogImage: entity.image?.url,
    noIndex: isPreview || Boolean(q),
    page,
  });
}

export default async function ProductCategoryPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const sp = await searchParams;
  const resolved = await resolveCategoryPage(slug, locale, firstSearchParam(sp.preview));
  if (!resolved) {
    notFound();
  }
  const { entity, isPreview } = resolved;
  const filters = parseShopFilters(sp);
  const pathname = withLocalePath(locale, `/product-category/${entity.slug}`);
  const shopPathname = withLocalePath(locale, "/shop");
  const [products, faqs, tree, tags, recent] = await Promise.all([
    getPublishedProducts({
      locale,
      categorySlug: entity.identitySlug,
      tagSlug: filters.tag,
      sort: filters.sort,
      search: filters.q,
      page: filters.page,
    }),
    getFaqsFor({ locale, scope: "CATEGORY", entityId: entity.id }),
    getCategoryTree(locale, "PRODUCT"),
    getProductTags(locale),
    getPublishedProducts({ locale, sort: "newest", perPage: 5 }),
  ]);
  const crumbs = [
    homeCrumb(locale),
    { href: shopPathname, label: pageText(locale, "shop") },
    ...entity.ancestors.map((item) => ({ href: item.href, label: item.name })),
    { label: entity.name },
  ];

  return (
    <article className="container-page py-xl">
      {isPreview ? <DraftPreviewBanner /> : null}
      <Breadcrumbs items={crumbs} />
      <JsonLd
        data={[
          collectionFromCategory(entity),
          ...(products.items.length ? [itemListFromProducts(products.items)] : []),
        ]}
      />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{entity.heroHeading || entity.name}</h1>
        {entity.heroSubheading ? (
          <p className="mt-2 text-lg text-muted-foreground">{entity.heroSubheading}</p>
        ) : null}
        {entity.shortDescription ? (
          <p className="mt-3 text-muted-foreground">{entity.shortDescription}</p>
        ) : null}
      </header>
      <ShopCatalog
        locale={locale}
        pathname={pathname}
        shopPathname={shopPathname}
        activeCategorySlug={entity.slug}
        categories={flattenCategoryTree(tree)}
        tags={tags}
        recent={recent.items}
        filters={filters}
        products={products}
      />
      {entity.longDescription ? (
        <div className="prose-rp prose-rp-wide mt-16">
          <p>{entity.longDescription}</p>
        </div>
      ) : null}
      {entity.children.length ? (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-semibold">{pageText(locale, "subcategories")}</h2>
          <CategoryGrid categories={entity.children} />
        </section>
      ) : null}
      <FaqSection locale={locale} faqs={faqs} />
    </article>
  );
}
