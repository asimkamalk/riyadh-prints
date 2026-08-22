import type { PageSaveInput } from "@/lib/validations/page";
import { emptyToNull, translationSeo } from "@/server/catalogue/seo-write";
import { prisma } from "@/server/db";

export function pageTranslationData(
  input: PageSaveInput,
  locale: "EN" | "AR",
  slug: string,
) {
  const isEn = locale === "EN";
  const content = isEn ? input.contentEn : input.contentAr;
  return {
    title: (isEn ? input.titleEn : input.titleAr) || input.titleEn,
    slug,
    excerpt: emptyToNull(isEn ? input.excerptEn : input.excerptAr) ?? null,
    ...(content !== undefined ? { content } : {}),
    ...translationSeo(isEn ? input.seoEn : input.seoAr),
  };
}

export async function pageParentWouldCycle(id: string, parentId: string | null): Promise<boolean> {
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
    const row: { parentId: string | null } | null = await prisma.page.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    current = row?.parentId ?? null;
  }
  return false;
}
