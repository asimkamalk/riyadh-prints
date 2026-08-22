import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type { TestimonialDto } from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  mapMedia,
  mediaSelect,
  pickTranslation,
  published,
  translationLocales,
} from "./_shared";

/**
 * Home `TESTIMONIALS` and social-proof blocks.
 * Cache tags: `testimonials`.
 */
export async function getPublishedTestimonials(
  locale: Locale,
  limit = 6,
): Promise<TestimonialDto[]> {
  return cachedQuery({
    key: ["testimonials", locale, String(limit)],
    tags: [tags.testimonials()],
    fn: async () => {
      const rows = await prisma.testimonial.findMany({
        where: { ...published, isFeatured: true },
        orderBy: { sortOrder: "asc" },
        take: limit,
        select: {
          id: true,
          authorName: true,
          authorRole: true,
          company: true,
          rating: true,
          avatar: { select: mediaSelect(locale) },
          translations: {
            where: { locale: { in: translationLocales(locale) } },
            select: {
              locale: true,
              quote: true,
              authorName: true,
              authorRole: true,
            },
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
            quote: picked.value.quote,
            authorName: picked.value.authorName ?? row.authorName,
            authorRole: picked.value.authorRole ?? row.authorRole,
            company: row.company,
            rating: row.rating,
            avatar: mapMedia(row.avatar, locale),
            servedLocale: picked.servedLocale,
            isFallback: picked.isFallback,
          },
        ];
      });
    },
  });
}
