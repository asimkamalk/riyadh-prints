import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TeamProfileView } from "@/components/site/team-profile-view";
import { isLocale, type Locale } from "@/i18n/locales";
import { stripLocalePrefix } from "@/i18n/routing";
import { buildMetadata, contentMetadata } from "@/lib/seo/metadata";
import {
  getAlternateLocaleHref,
  getBreadcrumbTrail,
  getTeamMemberBySlug,
  getTeamMemberStaticParams,
} from "@/server/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; memberSlug: string }>;
};

export async function generateStaticParams() {
  return getTeamMemberStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, memberSlug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const locale = raw as Locale;
  const member = await getTeamMemberBySlug(memberSlug, locale);
  if (!member) {
    return buildMetadata({
      locale,
      path: `/about/${memberSlug}`,
      derivedTitle: "Team member",
      noIndex: true,
    });
  }
  const alternateHref = await getAlternateLocaleHref(member.href, locale);
  return contentMetadata({
    locale,
    path: stripLocalePrefix(member.href),
    alternatePath: stripLocalePrefix(alternateHref),
    alternateSlug: member.slugs[locale === "ar" ? "en" : "ar"],
    seo: member.seo,
    derivedTitle: member.name,
    derivedDescription: member.bio,
    type: "profile",
  });
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { locale: raw, memberSlug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const member = await getTeamMemberBySlug(memberSlug, locale);
  if (!member) {
    notFound();
  }
  const trail = await getBreadcrumbTrail("teamMember", member.slug, locale);
  const crumbs = trail.map((item) =>
    item.href ? { href: item.href, label: item.label } : { label: item.label },
  );
  return <TeamProfileView locale={locale} member={member} crumbs={crumbs} />;
}
