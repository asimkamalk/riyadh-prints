import type { Prisma } from "@/generated/prisma/client";
import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type { FaqDto, FaqsQuery } from "@/types/content";
import {
  cachedQuery,
  pickTranslation,
  toJson,
  translationLocales,
} from "./_shared";

/**
 * FAQ accordion on home, product, service, and `/faqs`.
 * Cache tags: `faqs:{scope}` or `faqs:{scope}:{entityId}`.
 */
export async function getFaqsFor(input: FaqsQuery): Promise<FaqDto[]> {
  const entityId = input.entityId ?? "";
  return cachedQuery({
    key: ["faqs", input.scope, entityId, input.locale],
    tags: [tags.faqs(input.scope, input.entityId)],
    fn: async () => {
      const scopeFilter: Prisma.FaqItemWhereInput =
        input.scope === "GLOBAL"
          ? { scope: "GLOBAL" }
          : input.scope === "PRODUCT"
            ? { scope: "PRODUCT", productId: input.entityId }
            : input.scope === "SERVICE"
              ? { scope: "SERVICE", serviceId: input.entityId }
              : input.scope === "PAGE"
                ? { scope: "PAGE", pageId: input.entityId }
                : input.scope === "CATEGORY"
                  ? { scope: "CATEGORY", categoryId: input.entityId }
                  : input.scope === "POST"
                    ? { scope: "POST", postId: input.entityId }
                    : { scope: "PROJECT", projectId: input.entityId };

      const rows = await prisma.faqItem.findMany({
        where: { isVisible: true, ...scopeFilter },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          sortOrder: true,
          groupId: true,
          group: {
            select: {
              translations: {
                where: { locale: { in: translationLocales(input.locale) } },
                select: { locale: true, heading: true },
              },
            },
          },
          translations: {
            where: { locale: { in: translationLocales(input.locale) } },
            select: { locale: true, question: true, answer: true },
          },
        },
      });

      return rows.flatMap((row) => {
        const picked = pickTranslation(row.translations, input.locale);
        if (!picked) {
          return [];
        }
        const group = row.group
          ? pickTranslation(row.group.translations, input.locale)
          : null;
        return [
          {
            id: row.id,
            question: picked.value.question,
            answer: toJson(picked.value.answer) ?? {},
            sortOrder: row.sortOrder,
            groupId: row.groupId,
            groupHeading: group?.value.heading ?? null,
            servedLocale: picked.servedLocale,
            isFallback: picked.isFallback,
          },
        ];
      });
    },
  });
}
