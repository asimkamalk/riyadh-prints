import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type { Locale } from "@/i18n/locales";
import { cachedQuery, pickTranslation, translationLocales } from "./_shared";

export type ProductTagLink = {
  slug: string;
  name: string;
};

export async function getProductTags(locale: Locale): Promise<ProductTagLink[]> {
  return cachedQuery({
    key: ["product-tags", locale],
    tags: [tags.products()],
    fn: async () => {
      const rows = await prisma.tag.findMany({
        where: {
          kind: "PRODUCT",
          productLinks: { some: { product: { status: "PUBLISHED" } } },
        },
        orderBy: { slug: "asc" },
        select: {
          slug: true,
          translations: {
            where: { locale: { in: translationLocales(locale) } },
            select: { locale: true, name: true, slug: true },
          },
        },
      });
      return rows.flatMap((row) => {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          return [];
        }
        return [{ slug: picked.value.slug || row.slug, name: picked.value.name }];
      });
    },
  });
}
