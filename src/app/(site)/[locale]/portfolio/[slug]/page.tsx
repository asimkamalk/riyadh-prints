import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageText } from "@/components/site/page-copy";
import { ProjectDetailView } from "@/components/site/project-detail-view";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { buildMetadata, contentMetadata, homeCrumb, localePairPaths } from "@/lib/seo/metadata";
import { getFaqsFor, getProjectBySlug, getProjectSlugsForSitemap } from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const rows = await getProjectSlugsForSitemap();
  return rows.map((row) => ({ slug: row.identitySlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const project = await getProjectBySlug(slug, locale);
  if (!project) {
    return buildMetadata({
      locale,
      path: `/portfolio/${slug}`,
      derivedTitle: pageText(locale, "portfolio"),
      noIndex: true,
    });
  }
  return contentMetadata({
    locale,
    ...localePairPaths(locale, "/portfolio", project.slugs),
    seo: project.seo,
    derivedTitle: project.title,
    derivedDescription: project.summary,
    ogImage: project.coverImage?.url,
  });
}

export default async function PortfolioProjectPage({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const project = await getProjectBySlug(slug, locale);
  if (!project) {
    notFound();
  }
  const faqs = await getFaqsFor({ locale, scope: "PROJECT", entityId: project.id });
  const crumbs = [
    homeCrumb(locale),
    { href: withLocalePath(locale, "/portfolio"), label: pageText(locale, "portfolio") },
    { label: project.title },
  ];

  return <ProjectDetailView locale={locale} project={project} faqs={faqs} crumbs={crumbs} />;
}
