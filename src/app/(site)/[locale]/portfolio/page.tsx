import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ListingHeader } from "@/components/site/content-chrome";
import { ProjectGrid } from "@/components/site/content-grids";
import { pageText } from "@/components/site/page-copy";
import { Pagination, pageSearchHref } from "@/components/site/pagination";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { parsePageParam } from "@/lib/search-params";
import { collectionPage, itemList } from "@/lib/seo/json-ld";
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { getPublishedProjects } from "@/server/queries";

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
    path: "/portfolio",
    derivedTitle: pageText(locale, "portfolio"),
    derivedDescription: pageText(locale, "portfolioIntro"),
    page: parsePageParam((await searchParams).page),
  });
}

export default async function PortfolioIndexPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const page = parsePageParam((await searchParams).page);
  const pathname = withLocalePath(locale, "/portfolio");
  const projects = await getPublishedProjects({ locale, page });

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "portfolio") }]} />
      <JsonLd
        data={[
          collectionPage({
            name: pageText(locale, "portfolio"),
            url: pathname,
            description: pageText(locale, "portfolioIntro"),
          }),
          ...(projects.items.length
            ? [
                itemList(
                  projects.items.map((project) => ({
                    name: project.title,
                    url: project.href,
                    image: project.coverImage?.url,
                  })),
                ),
              ]
            : []),
        ]}
      />
      <ListingHeader title={pageText(locale, "portfolio")} intro={pageText(locale, "portfolioIntro")} />
      {projects.items.length ? (
        <ProjectGrid projects={projects.items} />
      ) : (
        <p className="text-muted-foreground">{pageText(locale, "emptyProjects")}</p>
      )}
      <Pagination
        locale={locale}
        page={projects.page}
        totalPages={projects.totalPages}
        hrefForPage={(next) => pageSearchHref(pathname, next)}
      />
    </div>
  );
}
