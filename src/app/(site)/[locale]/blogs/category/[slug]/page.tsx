import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection, ListingHeader } from "@/components/site/content-chrome";
import { PostGrid } from "@/components/site/content-grids";
import { pageText } from "@/components/site/page-copy";
import { Pagination, pageSearchHref } from "@/components/site/pagination";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { parsePageParam } from "@/lib/search-params";
import { collectionPage, itemList } from "@/lib/seo/json-ld";
import { buildMetadata, contentMetadata, homeCrumb, localePairPaths } from "@/lib/seo/metadata";
import {
  getCategoryBySlug,
  getCategoryIdentitySlugs,
  getFaqsFor,
  getPosts,
} from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const slugs = await getCategoryIdentitySlugs("POST");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const category = await getCategoryBySlug(slug, locale, "POST");
  if (!category) {
    return buildMetadata({
      locale,
      path: `/blogs/category/${slug}`,
      derivedTitle: pageText(locale, "blogs"),
      noIndex: true,
    });
  }
  return contentMetadata({
    locale,
    ...localePairPaths(locale, "/blogs/category", category.slugs),
    seo: category.seo,
    derivedTitle: category.name,
    derivedDescription: category.shortDescription,
    page: parsePageParam((await searchParams).page),
  });
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const category = await getCategoryBySlug(slug, locale, "POST");
  if (!category) {
    notFound();
  }
  const page = parsePageParam((await searchParams).page);
  const pathname = withLocalePath(locale, `/blogs/category/${category.slug}`);
  const [posts, faqs] = await Promise.all([
    getPosts({ locale, categorySlug: category.slug, page }),
    getFaqsFor({ locale, scope: "CATEGORY", entityId: category.id }),
  ]);

  return (
    <div className="container-page py-xl">
      <Breadcrumbs
        items={[
          homeCrumb(locale),
          { href: withLocalePath(locale, "/blogs"), label: pageText(locale, "blogs") },
          { label: category.name },
        ]}
      />
      <JsonLd
        data={[
          collectionPage({
            name: category.name,
            url: pathname,
            description: category.shortDescription,
          }),
          ...(posts.items.length
            ? [
                itemList(
                  posts.items.map((post) => ({
                    name: post.title,
                    url: post.href,
                    image: post.coverImage?.url,
                  })),
                ),
              ]
            : []),
        ]}
      />
      <ListingHeader title={category.name} intro={category.shortDescription} />
      {posts.items.length ? (
        <PostGrid posts={posts.items} locale={locale} />
      ) : (
        <p className="text-muted-foreground">{pageText(locale, "emptyPosts")}</p>
      )}
      <Pagination
        locale={locale}
        page={posts.page}
        totalPages={posts.totalPages}
        hrefForPage={(next) => pageSearchHref(pathname, next)}
      />
      {category.longDescription ? (
        <div className="prose-rp mt-16">
          <p>{category.longDescription}</p>
        </div>
      ) : null}
      <FaqSection locale={locale} faqs={faqs} />
    </div>
  );
}
