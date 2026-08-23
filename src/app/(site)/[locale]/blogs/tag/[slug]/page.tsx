import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ListingHeader } from "@/components/site/content-chrome";
import { PostGrid } from "@/components/site/content-grids";
import { pageText } from "@/components/site/page-copy";
import { Pagination, pageSearchHref } from "@/components/site/pagination";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { parsePageParam } from "@/lib/search-params";
import { collectionPage, itemList } from "@/lib/seo/json-ld";
import { buildMetadata, homeCrumb, localePairPaths } from "@/lib/seo/metadata";
import { getPosts, getPostTagSlugs, getTagBySlug } from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  const slugs = await getPostTagSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const tag = await getTagBySlug(slug, locale);
  if (!tag) {
    return buildMetadata({
      locale,
      path: `/blogs/tag/${slug}`,
      derivedTitle: pageText(locale, "blogs"),
      noIndex: true,
    });
  }
  return buildMetadata({
    locale,
    ...localePairPaths(locale, "/blogs/tag", tag.slugs),
    derivedTitle: tag.name,
    derivedDescription: tag.description,
    page: parsePageParam((await searchParams).page),
  });
}

export default async function BlogTagPage({ params, searchParams }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const tag = await getTagBySlug(slug, locale);
  if (!tag) {
    notFound();
  }
  const page = parsePageParam((await searchParams).page);
  const pathname = withLocalePath(locale, `/blogs/tag/${tag.slug}`);
  const posts = await getPosts({ locale, tagSlug: tag.slug, page });

  return (
    <div className="container-page py-xl">
      <Breadcrumbs
        items={[
          homeCrumb(locale),
          { href: withLocalePath(locale, "/blogs"), label: pageText(locale, "blogs") },
          { label: tag.name },
        ]}
      />
      <JsonLd
        data={[
          collectionPage({ name: tag.name, url: pathname, description: tag.description }),
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
      <ListingHeader title={tag.name} intro={tag.description} />
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
    </div>
  );
}
