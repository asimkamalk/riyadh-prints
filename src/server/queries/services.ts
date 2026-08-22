import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type { ServiceCard, ServiceDetail, SitemapSlug } from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  decimalToString,
  mapMedia,
  mapSeo,
  mediaSelect,
  pickTranslation,
  published,
  seoSelect,
  serviceHref,
  toIso,
  toJson,
  translationLocales,
} from "./_shared";

function serviceCardSelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    iconName: true,
    isFeatured: true,
    turnaroundTime: true,
    startingPrice: true,
    sortOrder: true,
    image: { select: mediaSelect(locale) },
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: {
        locale: true,
        name: true,
        slug: true,
        shortDescription: true,
      },
    },
  } as const;
}

type ServiceCardRow = {
  id: string;
  slug: string;
  iconName: string | null;
  isFeatured: boolean;
  turnaroundTime: string | null;
  startingPrice: unknown;
  image: Parameters<typeof mapMedia>[0];
  translations: {
    locale: "EN" | "AR";
    name: string;
    slug: string;
    shortDescription: string | null;
  }[];
};

function mapServiceCard(row: ServiceCardRow, locale: Locale): ServiceCard | null {
  const picked = pickTranslation(row.translations, locale);
  if (!picked) {
    return null;
  }
  const slug = picked.value.slug;
  return {
    id: row.id,
    identitySlug: row.slug,
    slug,
    href: serviceHref(locale, slug),
    name: picked.value.name,
    shortDescription: picked.value.shortDescription,
    iconName: row.iconName,
    isFeatured: row.isFeatured,
    turnaroundTime: row.turnaroundTime,
    startingPrice: decimalToString(row.startingPrice),
    image: mapMedia(row.image, locale),
    servedLocale: picked.servedLocale,
    isFallback: picked.isFallback,
  };
}

/**
 * Home `SERVICE_GRID` and `/services` index.
 * Cache tags: `services`.
 */
export async function getAllServices(
  locale: Locale,
  featuredOnly = false,
): Promise<ServiceCard[]> {
  return cachedQuery({
    key: ["all-services", locale, featuredOnly ? "featured" : "all"],
    tags: [tags.services()],
    fn: async () => {
      const rows = await prisma.service.findMany({
        where: {
          ...published,
          translations: { some: { locale: "EN" } },
          ...(featuredOnly ? { isFeatured: true } : {}),
        },
        orderBy: { sortOrder: "asc" },
        select: serviceCardSelect(locale),
      });
      return rows
        .map((row) => mapServiceCard(row, locale))
        .filter((row): row is ServiceCard => row !== null);
    },
  });
}

/**
 * Service landing `/services/[slug]`.
 * Cache tags: `service:{slug}`, `services`.
 */
function serviceDetailSelect(locale: Locale) {
  return {
    ...serviceCardSelect(locale),
    heroImage: { select: mediaSelect(locale) },
    translations: {
      where: { locale: { in: translationLocales(locale) } },
      select: {
        locale: true,
        name: true,
        slug: true,
        shortDescription: true,
        longDescription: true,
        benefits: true,
        processSteps: true,
        heroHeading: true,
        heroSubheading: true,
        ctaLabel: true,
        ...seoSelect,
      },
    },
  };
}

function mapServiceDetail(
  row: {
    heroImage: Parameters<typeof mapMedia>[0];
    translations: {
      locale: "EN" | "AR";
      name: string;
      slug: string;
      shortDescription: string | null;
      longDescription: unknown;
      benefits: unknown;
      processSteps: unknown;
      heroHeading: string | null;
      heroSubheading: string | null;
      ctaLabel: string | null;
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
  } & ServiceCardRow,
  locale: Locale,
): ServiceDetail | null {
  const card = mapServiceCard(row, locale);
  const picked = pickTranslation(row.translations, locale);
  if (!card || !picked) {
    return null;
  }
  return {
    ...card,
    longDescription: toJson(picked.value.longDescription),
    benefits: toJson(picked.value.benefits),
    processSteps: toJson(picked.value.processSteps),
    heroHeading: picked.value.heroHeading,
    heroSubheading: picked.value.heroSubheading,
    ctaLabel: picked.value.ctaLabel,
    heroImage: mapMedia(row.heroImage, locale),
    seo: mapSeo(picked.value),
  };
}

export async function getServiceBySlug(
  slug: string,
  locale: Locale,
): Promise<ServiceDetail | null> {
  return cachedQuery({
    key: ["service-by-slug", slug, locale],
    tags: [tags.service(slug), tags.services()],
    fn: async () => {
      const row = await prisma.service.findFirst({
        where: {
          ...published,
          OR: [{ slug }, { translations: { some: { slug } } }],
        },
        select: serviceDetailSelect(locale),
      });
      if (!row) {
        return null;
      }
      return mapServiceDetail(row, locale);
    },
  });
}

export async function getServiceByIdUncached(
  id: string,
  locale: Locale,
): Promise<ServiceDetail | null> {
  const row = await prisma.service.findFirst({
    where: { id },
    select: serviceDetailSelect(locale),
  });
  if (!row) {
    return null;
  }
  return mapServiceDetail(row, locale);
}

/**
 * `app/sitemap.ts` service URLs.
 * Cache tags: `sitemap`, `services`.
 */
export async function getServiceSlugsForSitemap(): Promise<SitemapSlug[]> {
  return cachedQuery({
    key: ["service-slugs-sitemap"],
    tags: [tags.sitemap(), tags.services()],
    fn: async () => {
      const rows = await prisma.service.findMany({
        where: { ...published, showInSitemap: true },
        select: {
          slug: true,
          updatedAt: true,
          changeFrequency: true,
          priority: true,
          translations: { select: { locale: true, slug: true } },
        },
      });
      return rows.map((row) => ({
        identitySlug: row.slug,
        slugs: {
          en: row.translations.find((t) => t.locale === "EN")?.slug ?? row.slug,
          ar: row.translations.find((t) => t.locale === "AR")?.slug ?? row.slug,
        },
        updatedAt: toIso(row.updatedAt) ?? new Date(0).toISOString(),
        changeFrequency: row.changeFrequency,
        priority: row.priority,
      }));
    },
  });
}
