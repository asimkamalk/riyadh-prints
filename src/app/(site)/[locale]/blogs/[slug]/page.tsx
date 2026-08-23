import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostDetailView } from "@/components/site/post-detail-view";
import { pageText } from "@/components/site/page-copy";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { buildMetadata, contentMetadata, homeCrumb, localePairPaths } from "@/lib/seo/metadata";
import { getFaqsFor, getPostBySlug, getPostSlugsForSitemap, getRelatedPosts } from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const rows = await getPostSlugsForSitemap();
  return rows.map((row) => ({ slug: row.identitySlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || slug === "category" || slug === "tag") {
    return {};
  }
  const locale = raw as Locale;
  const post = await getPostBySlug(slug, locale);
  if (!post) {
    return buildMetadata({
      locale,
      path: `/blogs/${slug}`,
      derivedTitle: "Article",
      noIndex: true,
    });
  }
  return contentMetadata({
    locale,
    ...localePairPaths(locale, "/blogs", post.slugs),
    seo: post.seo,
    derivedTitle: post.title,
    derivedDescription: post.excerpt,
    ogImage: post.coverImage?.url,
    type: "article",
    publishedTime: post.publishedAt,
    authors: post.author?.name ? [post.author.name] : undefined,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || slug === "category" || slug === "tag") {
    notFound();
  }
  const locale = raw as Locale;
  const post = await getPostBySlug(slug, locale);
  if (!post) {
    notFound();
  }
  const [faqs, related] = await Promise.all([
    getFaqsFor({ locale, scope: "POST", entityId: post.id }),
    getRelatedPosts(post.identitySlug, locale),
  ]);
  const crumbs = [
    homeCrumb(locale),
    { href: withLocalePath(locale, "/blogs"), label: pageText(locale, "blogs") },
    { label: post.title },
  ];

  return <PostDetailView locale={locale} post={post} faqs={faqs} related={related} crumbs={crumbs} />;
}
