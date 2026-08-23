import Link from "next/link";

import { FaqAccordion } from "@/components/site/faq-accordion";
import { pageText } from "@/components/site/page-copy";
import { JsonLd } from "@/components/seo/json-ld";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { faqPage } from "@/lib/seo/json-ld";
import type { TocItem } from "@/lib/tiptap-toc";
import type { AuthorDto, FaqDto } from "@/types/content";

export function ListingHeader({ title, intro }: { title: string; intro?: string | null }) {
  return (
    <header className="mb-10 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {intro ? <p className="mt-3 text-lg text-muted-foreground">{intro}</p> : null}
    </header>
  );
}

export function FaqSection({ locale, faqs }: { locale: Locale; faqs: FaqDto[] }) {
  if (faqs.length === 0) {
    return null;
  }
  return (
    <section className="mt-16 rounded-3xl bg-muted/50 px-4 py-10 sm:px-8" aria-labelledby="page-faqs">
      <h2 id="page-faqs" className="mb-6 text-2xl font-semibold tracking-tight">
        {pageText(locale, "faqs")}
      </h2>
      <FaqAccordion faqs={faqs} appearance="pills" />
      <JsonLd data={faqPage(faqs)} />
    </section>
  );
}

export function AuthorBox({ author }: { author: AuthorDto }) {
  return (
    <aside className="rounded-xl border p-4">
      <p className="font-medium">{author.name}</p>
      {author.role ? <p className="text-sm text-muted-foreground">{author.role}</p> : null}
    </aside>
  );
}

export function PostToc({ items, locale }: { items: TocItem[]; locale: Locale }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <nav aria-label={pageText(locale, "toc")} className="rounded-xl border p-4">
      <p className="mb-3 text-sm font-medium">{pageText(locale, "toc")}</p>
      <ol className="grid gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ps-4" : undefined}>
            <a href={`#${item.id}`} className="text-muted-foreground hover:text-foreground">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TagList({
  tags,
  locale,
}: {
  tags: { slug: string; name: string }[];
  locale: Locale;
}) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link
            href={withLocalePath(locale, `/blogs/tag/${tag.slug}`) as never}
            className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
          >
            {tag.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
