import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type {
  LocationDto,
  PartnerDto,
  SiteSettingsDto,
  StatDto,
} from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  mapMedia,
  mediaSelect,
  pickTranslation,
  toJson,
  translationLocales,
} from "./_shared";

const SETTINGS_TTL_SECONDS = 60 * 60 * 6;

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function bilingual(
  value: unknown,
  locale: Locale,
): { text: string; servedLocale: Locale; isFallback: boolean } {
  if (typeof value === "string") {
    return { text: value, servedLocale: locale, isFallback: false };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as { en?: unknown; ar?: unknown };
    const en = typeof record.en === "string" ? record.en : "";
    const ar = typeof record.ar === "string" ? record.ar : "";
    if (locale === "ar" && ar) {
      return { text: ar, servedLocale: "ar", isFallback: false };
    }
    if (locale === "ar" && en) {
      return { text: en, servedLocale: "en", isFallback: true };
    }
    return { text: en, servedLocale: "en", isFallback: false };
  }
  return { text: "", servedLocale: "en", isFallback: locale === "ar" };
}

function settingMap(rows: { key: string; value: unknown }[]) {
  return new Map(rows.map((row) => [row.key, row.value]));
}

/**
 * Layout chrome: NAP, social, default SEO, GA4.
 * Cache tags: `settings`. Revalidate: 6 hours.
 */
export async function getSiteSettings(
  locale: Locale,
): Promise<SiteSettingsDto> {
  return cachedQuery({
    key: ["site-settings", locale],
    tags: [tags.settings()],
    revalidate: SETTINGS_TTL_SECONDS,
    fn: async () => {
      const [settingRows, location] = await Promise.all([
        prisma.siteSetting.findMany({
          select: { key: true, value: true },
        }),
        prisma.location.findFirst({
          where: { isPrimary: true, isVisible: true },
          select: {
            id: true,
            phone: true,
            whatsapp: true,
            email: true,
            googleMapsUrl: true,
            hours: true,
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: {
                locale: true,
                name: true,
                slug: true,
                addressLine1: true,
                city: true,
                region: true,
                postalCode: true,
                country: true,
              },
            },
          },
        }),
      ]);

      const map = settingMap(settingRows);
      const name = bilingual(map.get("company.name"), locale);
      const tagline = bilingual(map.get("company.tagline"), locale);
      const address = bilingual(map.get("contact.address"), locale);
      const hoursValue = map.get("contact.hours");
      const hoursLabel = bilingual(
        hoursValue && typeof hoursValue === "object"
          ? hoursValue
          : { en: "", ar: "" },
        locale,
      );
      const waMessage = bilingual(
        (() => {
          const raw = map.get("integrations.whatsapp");
          if (raw && typeof raw === "object" && "defaultMessage" in raw) {
            return (raw as { defaultMessage: unknown }).defaultMessage;
          }
          return { en: "", ar: "" };
        })(),
        locale,
      );

      let locationDto: LocationDto | null = null;
      if (location) {
        const picked = pickTranslation(location.translations, locale);
        if (picked) {
          locationDto = {
            id: location.id,
            name: picked.value.name,
            slug: picked.value.slug,
            phone: location.phone,
            whatsapp: location.whatsapp,
            email: location.email,
            addressLine1: picked.value.addressLine1,
            city: picked.value.city,
            region: picked.value.region,
            postalCode: picked.value.postalCode,
            country: picked.value.country,
            googleMapsUrl: location.googleMapsUrl,
            hours: toJson(location.hours),
            servedLocale: picked.servedLocale,
            isFallback: picked.isFallback,
          };
        }
      }

      const anyFallback =
        name.isFallback ||
        tagline.isFallback ||
        address.isFallback ||
        hoursLabel.isFallback ||
        (locationDto?.isFallback ?? false);

      return {
        companyName: name.text,
        tagline: tagline.text,
        whatsapp: asString(map.get("contact.whatsapp")) ?? "",
        phone: asString(map.get("contact.phone")) ?? "",
        email: asString(map.get("contact.email")) ?? "",
        address: address.text,
        mapsUrl: asString(map.get("contact.mapsUrl")) ?? "",
        hours: toJson(hoursValue ?? null),
        hoursLabel: hoursLabel.text,
        social: {
          facebook: asString(map.get("social.facebook")),
          instagram: asString(map.get("social.instagram")),
          linkedin: asString(map.get("social.linkedin")),
          pinterest: asString(map.get("social.pinterest")),
          x: asString(map.get("social.x")),
        },
        metaTitleTemplate:
          asString(map.get("seo.metaTitleTemplate")) ?? "%s | Riyadh Prints",
        defaultOgImageId: asString(map.get("seo.defaultOgImageId")),
        defaultOgImageUrl: asString(map.get("seo.defaultOgImageUrl")),
        ga4Id: asString(map.get("scripts.ga4Id")),
        whatsappDefaultMessage: waMessage.text,
        location: locationDto,
        servedLocale: anyFallback ? "en" : locale,
        isFallback: anyFallback && locale === "ar",
      };
    },
  });
}

/**
 * Home `PARTNERS` strip.
 * Cache tags: `settings`.
 */
export async function getPartners(locale: Locale): Promise<PartnerDto[]> {
  return cachedQuery({
    key: ["partners", locale],
    tags: [tags.settings()],
    fn: async () => {
      const rows = await prisma.partner.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          websiteUrl: true,
          logo: { select: mediaSelect(locale) },
          translations: {
            where: { locale: { in: translationLocales(locale) } },
            select: { locale: true, name: true },
          },
        },
      });
      return rows.flatMap((row) => {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          return [];
        }
        return [
          {
            id: row.id,
            name: picked.value.name,
            websiteUrl: row.websiteUrl,
            logo: mapMedia(row.logo, locale),
            servedLocale: picked.servedLocale,
            isFallback: picked.isFallback,
          },
        ];
      });
    },
  });
}

/**
 * Home `STATS` strip.
 * Cache tags: `settings`.
 */
export async function getStats(locale: Locale): Promise<StatDto[]> {
  return cachedQuery({
    key: ["stats", locale],
    tags: [tags.settings()],
    fn: async () => {
      const rows = await prisma.stat.findMany({
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          value: true,
          prefix: true,
          suffix: true,
          iconName: true,
          translations: {
            where: { locale: { in: translationLocales(locale) } },
            select: { locale: true, label: true },
          },
        },
      });
      return rows.flatMap((row) => {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          return [];
        }
        return [
          {
            id: row.id,
            value: row.value,
            prefix: row.prefix,
            suffix: row.suffix,
            iconName: row.iconName,
            label: picked.value.label,
            servedLocale: picked.servedLocale,
            isFallback: picked.isFallback,
          },
        ];
      });
    },
  });
}
