import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { RenderPageSections } from "@/components/sections/render-page-sections";
import { pageText } from "@/components/site/page-copy";
import { ShopCatalog } from "@/components/site/shop-catalog";
import { flattenCategoryTree, parseShopFilters } from "@/components/site/shop-query";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { firstParam, parsePageParam } from "@/lib/search-params";
import { collectionPage, itemListFromProducts } from "@/lib/seo/json-ld";
import { buildMetadata, contentMetadata, homeCrumb } from "@/lib/seo/metadata";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import {
  getCategoryTree,
  getPageBySlugPath,
  getProductTags,
  getPublishedProducts,
} from "@/server/queries";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim();
  const page = parsePageParam(sp.page);
  const cms = await getPageBySlugPath(["shop"], locale);
  if (cms) {
    return contentMetadata({
      locale,
      path: "/shop",
      seo: cms.seo,
      derivedTitle: cms.title,
      derivedDescription: cms.excerpt || tiptapToPlainText(cms.content) || pageText(locale, "shopIntro"),
      noIndex: Boolean(q),
      page,
    });
  }
  return buildMetadata({
    locale,
    path: "/shop",
    derivedTitle: pageText(locale, "shop"),
    derivedDescription: pageText(locale, "shopIntro"),
    noIndex: Boolean(q),
    page,
  });
}

export default async function ShopPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const filters = parseShopFilters(await searchParams);
  const pathname = withLocalePath(locale, "/shop");
  const [cms, tree, products, tags, recent] = await Promise.all([
    getPageBySlugPath(["shop"], locale),
    getCategoryTree(locale, "PRODUCT"),
    getPublishedProducts({
      locale,
      tagSlug: filters.tag,
      sort: filters.sort,
      search: filters.q,
      page: filters.page,
    }),
    getProductTags(locale),
    getPublishedProducts({ locale, sort: "newest", perPage: 5 }),
  ]);
  const title = cms?.title || pageText(locale, "shop");

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: title }]} />
      <JsonLd
        data={[
          collectionPage({
            name: title,
            url: pathname,
            description: cms?.excerpt || pageText(locale, "shopIntro"),
          }),
          ...(products.items.length ? [itemListFromProducts(products.items)] : []),
        ]}
      />
      <h1 className="sr-only">{title}</h1>
      <ShopCatalog
        locale={locale}
        pathname={pathname}
        shopPathname={pathname}
        categories={flattenCategoryTree(tree)}
        tags={tags}
        recent={recent.items}
        filters={filters}
        products={products}
      />
      {cms?.sections.length ? (
        <RenderPageSections
          sections={cms.sections}
          locale={locale}
          pageId={cms.id}
          pageHasH1
        />
      ) : null}
    </div>
  );
}
