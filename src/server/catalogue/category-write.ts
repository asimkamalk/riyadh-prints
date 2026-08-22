import type { CategorySaveInput } from "@/lib/validations/category";
import { emptyToNull, translationSeo } from "@/server/catalogue/seo-write";
import { prisma } from "@/server/db";

export function categoryTranslationData(
  input: CategorySaveInput,
  locale: "EN" | "AR",
  slug: string,
) {
  const isEn = locale === "EN";
  return {
    name: (isEn ? input.nameEn : input.nameAr) || input.nameEn,
    slug,
    shortDescription: isEn ? input.shortEn : input.shortAr,
    longDescription: emptyToNull(isEn ? input.longEn : input.longAr) ?? null,
    heroHeading: emptyToNull(isEn ? input.heroHeadingEn : input.heroHeadingAr) ?? null,
    heroSubheading: emptyToNull(isEn ? input.heroSubheadingEn : input.heroSubheadingAr) ?? null,
    ...translationSeo(isEn ? input.seoEn : input.seoAr),
  };
}

export async function parentWouldCycle(id: string, parentId: string | null): Promise<boolean> {
  if (!parentId) {
    return false;
  }
  if (parentId === id) {
    return true;
  }
  const seen = new Set<string>();
  let current: string | null = parentId;
  while (current) {
    if (current === id) {
      return true;
    }
    if (seen.has(current)) {
      return true;
    }
    seen.add(current);
    const row: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    current = row?.parentId ?? null;
  }
  return false;
}
