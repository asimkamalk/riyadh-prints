import Link from "next/link";

import { SiteImage } from "@/components/site/site-image";
import type { Locale } from "@/i18n/locales";
import type { PostCard as PostCardDto } from "@/types/content";

export function PostCard({ post, locale }: { post: PostCardDto; locale: Locale }) {
  const date = post.publishedAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : null;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-elevate-1">
      <Link href={post.href as never} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        {post.coverImage ? (
          <SiteImage
            media={post.coverImage}
            alt={post.coverImage.alt || post.title}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
          />
        ) : null}
      </Link>
      <div className="grid flex-1 gap-2 p-5">
        {date ? <p className="text-xs text-muted-foreground">{date}</p> : null}
        <h3 className="font-medium">
          <Link href={post.href as never} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
