import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ListingHeader } from "@/components/site/content-chrome";
import { chromeText } from "@/components/site/copy";
import { pageText } from "@/components/site/page-copy";
import { SiteSearchForm } from "@/components/site/site-search-form";
import { isLocale, type Locale } from "@/i18n/locales";
import { firstParam } from "@/lib/search-params";
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { searchAll } from "@/server/queries";
import type { SearchHit } from "@/types/content";

export const revalidate = 3600;

const GROUP_ORDER = ["product", "service", "category", "page", "post", "project"] as const;

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
  const q = firstParam((await searchParams).q)?.trim();
  return buildMetadata({
    locale,
    path: "/search",
    derivedTitle: q ? `${pageText(locale, "searchTitle")}: ${q}` : pageText(locale, "searchTitle"),
    derivedDescription: pageText(locale, "searchIntro"),
    noIndex: true,
  });
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const q = firstParam((await searchParams).q)?.trim() ?? "";
  const hits = q.length >= 2 ? await searchAll(q, locale) : [];
  const grouped = groupHits(hits);

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "searchTitle") }]} />
      <ListingHeader title={pageText(locale, "searchTitle")} intro={pageText(locale, "searchIntro")} />
      <SiteSearchForm locale={locale} defaultQuery={q} />
      {q.length > 0 && q.length < 2 ? (
        <p className="mt-8 text-muted-foreground">{pageText(locale, "minChars")}</p>
      ) : null}
      {q.length >= 2 && hits.length === 0 ? (
        <p className="mt-8 text-muted-foreground">{pageText(locale, "emptySearch")}</p>
      ) : null}
      <div className="mt-10 grid gap-10">
        {GROUP_ORDER.map((type) => {
          const items = grouped.get(type);
          if (!items?.length) {
            return null;
          }
          return (
            <section key={type}>
              <h2 className="mb-4 text-lg font-medium">{groupLabel(locale, type)}</h2>
              <ul className="grid gap-3">
                {items.map((hit) => (
                  <li key={`${hit.entityType}-${hit.entityId}`}>
                    <Link href={hit.href as never} className="block rounded-xl border p-4 hover:bg-muted/40">
                      <p className="font-medium">{hit.title}</p>
                      {hit.excerpt ? (
                        <p className="mt-1 text-sm text-muted-foreground">{hit.excerpt}</p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function groupHits(hits: SearchHit[]) {
  const map = new Map<(typeof GROUP_ORDER)[number], SearchHit[]>();
  for (const hit of hits) {
    const list = map.get(hit.entityType) ?? [];
    list.push(hit);
    map.set(hit.entityType, list);
  }
  return map;
}

function groupLabel(locale: Locale, type: (typeof GROUP_ORDER)[number]): string {
  switch (type) {
    case "product":
      return chromeText(locale, "searchGroupProduct");
    case "service":
      return chromeText(locale, "searchGroupService");
    case "category":
      return chromeText(locale, "searchGroupCategory");
    case "page":
      return chromeText(locale, "searchGroupPage");
    case "post":
      return chromeText(locale, "searchGroupPost");
    case "project":
      return chromeText(locale, "searchGroupProject");
  }
}
