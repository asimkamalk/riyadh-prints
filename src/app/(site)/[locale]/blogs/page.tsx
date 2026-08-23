import type { Metadata } from "next";
import Link from "next/link";
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
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { getCategoryTree, getPosts } from "@/server/queries";

export const revalidate = 3600;

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
  return buildMetadata({
    locale,
    path: "/blogs",
    derivedTitle: pageText(locale, "blogs"),
    derivedDescription: pageText(locale, "blogsIntro"),
    page: parsePageParam((await searchParams).page),
  });
}

export default async function BlogsIndexPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const page = parsePageParam((await searchParams).page);
  const pathname = withLocalePath(locale, "/blogs");
  const [posts, categories] = await Promise.all([
    getPosts({ locale, page }),
    getCategoryTree(locale, "POST"),
  ]);

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "blogs") }]} />
      <JsonLd
        data={[
          collectionPage({
            name: pageText(locale, "blogs"),
            url: pathname,
            description: pageText(locale, "blogsIntro"),
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
      <ListingHeader title={pageText(locale, "blogs")} intro={pageText(locale, "blogsIntro")} />
      {categories.length ? (
        <ul className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={category.href as never}
                className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
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
