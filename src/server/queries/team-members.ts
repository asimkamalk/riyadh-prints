import { tags } from "@/lib/cache-tags";
import { parseTeamSkills, parseTeamSocials } from "@/lib/team-json";
import { prisma } from "@/server/db";
import type { SitemapSlug, TeamMemberCard, TeamMemberDetail } from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  ALL_TRANSLATION_LOCALES,
  cachedQuery,
  mapMedia,
  mapSeo,
  mediaSelect,
  pickTranslation,
  seoSelect,
  slugsFromTranslations,
  teamMemberHref,
  translationLocales,
} from "./_shared";

function teamCardSelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    sortOrder: true,
    avatar: { select: mediaSelect(locale) },
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: {
        locale: true,
        name: true,
        slug: true,
        role: true,
        secondaryRole: true,
      },
    },
  } as const;
}

type TeamCardRow = {
  id: string;
  slug: string;
  sortOrder: number;
  avatar: Parameters<typeof mapMedia>[0];
  translations: {
    locale: "EN" | "AR";
    name: string;
    slug: string;
    role: string | null;
    secondaryRole: string | null;
  }[];
};

function mapTeamCard(row: TeamCardRow, locale: Locale): TeamMemberCard | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  const role = [picked.value.role, picked.value.secondaryRole].filter(Boolean).join(" / ");
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: teamMemberHref(locale, slug),
    name: picked.value.name,
    role: role || null,
    avatar: mapMedia(row.avatar, locale),
    sortOrder: row.sortOrder,
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

function teamDetailSelect(locale: Locale) {
  return {
    ...teamCardSelect(locale),
    email: true,
    phone: true,
    socials: true,
    translations: {
      where: { locale: { in: ALL_TRANSLATION_LOCALES } },
      select: {
        locale: true,
        name: true,
        slug: true,
        role: true,
        secondaryRole: true,
        bio: true,
        experience: true,
        awards: true,
        skills: true,
        ...seoSelect,
      },
    },
  };
}

function mapTeamDetail(row: {
  id: string;
  slug: string;
  sortOrder: number;
  email: string | null;
  phone: string | null;
  socials: unknown;
  avatar: Parameters<typeof mapMedia>[0];
  translations: {
    locale: "EN" | "AR";
    name: string;
    slug: string;
    role: string | null;
    secondaryRole: string | null;
    bio: string | null;
    experience: string | null;
    awards: string | null;
    skills: unknown;
    metaTitle: string | null;
    metaDescription: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageId: string | null;
    canonicalUrl: string | null;
    noIndex: boolean;
    noFollow: boolean;
    jsonLdOverride: unknown;
    focusKeyword: string | null;
  }[];
}, locale: Locale): TeamMemberDetail | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  const roleLine = [picked.value.role, picked.value.secondaryRole].filter(Boolean).join(" / ");
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: teamMemberHref(locale, slug),
    name: picked.value.name,
    role: picked.value.role,
    secondaryRole: picked.value.secondaryRole,
    bio: picked.value.bio,
    experience: picked.value.experience,
    awards: picked.value.awards,
    skills: parseTeamSkills(picked.value.skills),
    email: row.email,
    phone: row.phone,
    socials: parseTeamSocials(row.socials),
    avatar: mapMedia(row.avatar, locale),
    sortOrder: row.sortOrder,
    seo: mapSeo(picked.value),
    slugs: slugsFromTranslations(row.translations, row.slug),
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

/**
 * About page team grid and profile cards.
 * Cache tags: `team-members`.
 */
export async function getVisibleTeamMembers(locale: Locale): Promise<TeamMemberCard[]> {
  return cachedQuery({
    key: ["visible-team-members", locale],
    tags: [tags.teamMembers()],
    fn: async () => {
      const rows = await prisma.teamMember.findMany({
        where: {
          isVisible: true,
          translations: { some: { locale: "EN" } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: teamCardSelect(locale),
      });
      return rows
        .map((row) => mapTeamCard(row, locale))
        .filter((row): row is TeamMemberCard => row !== null);
    },
  });
}

/**
 * Team profile `/about/[slug]`.
 * Cache tags: `team-member:{slug}`, `team-members`.
 */
export async function getTeamMemberBySlug(
  slug: string,
  locale: Locale,
): Promise<TeamMemberDetail | null> {
  return cachedQuery({
    key: ["team-member-by-slug", slug, locale],
    tags: [tags.teamMember(slug), tags.teamMembers()],
    fn: async () => {
      const row = await prisma.teamMember.findFirst({
        where: {
          isVisible: true,
          OR: [{ slug }, { translations: { some: { slug } } }],
        },
        select: teamDetailSelect(locale),
      });
      if (!row) {
        return null;
      }
      return mapTeamDetail(row, locale);
    },
  });
}

export async function getTeamMemberByIdUncached(
  id: string,
  locale: Locale,
): Promise<TeamMemberDetail | null> {
  const row = await prisma.teamMember.findUnique({
    where: { id },
    select: teamDetailSelect(locale),
  });
  if (!row) {
    return null;
  }
  return mapTeamDetail(row, locale);
}

export async function getTeamMemberSlugsForSitemap(): Promise<SitemapSlug[]> {
  return cachedQuery({
    key: ["team-member-slugs-sitemap"],
    tags: [tags.sitemap(), tags.teamMembers()],
    fn: async () => {
      const rows = await prisma.teamMember.findMany({
        where: { isVisible: true },
        select: {
          slug: true,
          updatedAt: true,
          translations: { select: { locale: true, slug: true } },
        },
      });
      return rows.map((row) => ({
        identitySlug: row.slug,
        slugs: slugsFromTranslations(row.translations, row.slug),
        updatedAt: row.updatedAt.toISOString(),
        changeFrequency: null,
        priority: null,
      }));
    },
  });
}

export async function getTeamMemberStaticParams(): Promise<{ memberSlug: string }[]> {
  const rows = await prisma.teamMember.findMany({
    where: { isVisible: true },
    select: { slug: true },
  });
  return rows.map((row) => ({ memberSlug: row.slug }));
}
