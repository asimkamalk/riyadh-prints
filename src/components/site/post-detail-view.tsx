import Image from "next/image";
import Link from "next/link";

import { TiptapBody } from "@/components/sections/tiptap-body";
import { Breadcrumbs, type Crumb } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { AuthorBox, FaqSection, PostToc, TagList } from "@/components/site/content-chrome";
import { PostGrid } from "@/components/site/content-grids";
import { pageText } from "@/components/site/page-copy";
import { ShareButtons } from "@/components/site/share-buttons";
import type { Locale } from "@/i18n/locales";
import { articleFromPost } from "@/lib/seo/json-ld";
import { tiptapToc } from "@/lib/tiptap-toc";
import { absoluteUrl } from "@/lib/utils/site-url";
import type { FaqDto, PostCard, PostDetail } from "@/types/content";

export function PostDetailView({
  locale,
  post,
  faqs,
  related,
  crumbs,
}: {
  locale: Locale;
  post: PostDetail;
  faqs: FaqDto[];
  related: PostCard[];
  crumbs: Crumb[];
}) {
  const toc = tiptapToc(post.content);
  const date = post.publishedAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : null;

  return (
    <article className="container-page py-xl">
      <Breadcrumbs items={crumbs} />
      <JsonLd data={articleFromPost(post)} />
      {post.coverImage ? (
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            placeholder={post.coverImage.blurDataUrl ? "blur" : "empty"}
            blurDataURL={post.coverImage.blurDataUrl ?? undefined}
          />
        </div>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{post.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {date ? <time dateTime={post.publishedAt ?? undefined}>{date}</time> : null}
        {post.readingMinutes ? (
          <span>
            {post.readingMinutes} {pageText(locale, "minRead")}
          </span>
        ) : null}
      </div>
      {post.categories.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.categories.map((category) => (
            <li key={category.id}>
              <Link href={category.href as never} className="text-sm text-primary hover:underline">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_16rem]">
        <div className="prose-rp min-w-0">
          <TiptapBody value={post.content} />
        </div>
        <div className="grid gap-6 self-start lg:sticky lg:top-28">
          <PostToc items={toc} locale={locale} />
          {post.author ? <AuthorBox author={post.author} /> : null}
          <ShareButtons locale={locale} url={absoluteUrl(post.href)} title={post.title} />
        </div>
      </div>
      <div className="mt-10">
        <TagList tags={post.tags} locale={locale} />
      </div>
      <FaqSection locale={locale} faqs={faqs} />
      {related.length ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            {pageText(locale, "relatedPosts")}
          </h2>
          <PostGrid posts={related} locale={locale} />
        </section>
      ) : null}
    </article>
  );
}
