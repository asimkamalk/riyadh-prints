import type { CategoryKind } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { asRecord, asString } from "@/lib/sections/parse";
import type { SectionResolvedData } from "@/lib/sections/types";
import { prisma } from "@/server/db";
import {
  mapMedia,
  mediaSelect,
} from "@/server/queries/_shared";
import { getCategoryTree } from "@/server/queries/categories";
import { getFaqsFor } from "@/server/queries/faqs";
import { getPublishedProducts } from "@/server/queries/products";
import { getAllServices } from "@/server/queries/services";
import { getPartners, getSiteSettings, getStats } from "@/server/queries/settings";
import { getPublishedTestimonials } from "@/server/queries/testimonials";
import { getVisibleTeamMembers } from "@/server/queries/team-members";
import type { CategoryTreeNode, MediaDto, PageSectionDto } from "@/types/content";

function collectMediaIds(sections: PageSectionDto[]): string[] {
  const ids = new Set<string>();
  function walk(value: unknown) {
    if (!value) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value !== "object") {
      return;
    }
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (
        (key === "imageId" || key === "mediaId" || key === "leftImageId" || key === "rightImageId") &&
        typeof nested === "string" &&
        nested
      ) {
        ids.add(nested);
      } else {
        walk(nested);
      }
    }
  }
  for (const section of sections) {
    walk(section.settings);
    walk(section.data);
  }
  return [...ids];
}

function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  const url = new URL(`https://wa.me/${digits}`);
  if (message) {
    url.searchParams.set("text", message);
  }
  return url.toString();
}

async function mediaByIds(ids: string[], locale: Locale): Promise<Record<string, MediaDto>> {
  if (ids.length === 0) {
    return {};
  }
  const rows = await prisma.media.findMany({
    where: { id: { in: ids } },
    select: mediaSelect(locale),
  });
  const map: Record<string, MediaDto> = {};
  for (const row of rows) {
    const mapped = mapMedia(row, locale);
    if (mapped) {
      map[mapped.id] = mapped;
    }
  }
  return map;
}

export async function resolveSectionRenderData(input: {
  sections: PageSectionDto[];
  locale: Locale;
  pageId: string;
}): Promise<{
  base: SectionResolvedData;
  categoriesByKind: Partial<Record<CategoryKind, CategoryTreeNode[]>>;
  pageFaqs: SectionResolvedData["faqs"];
}> {
  const kinds = new Set<CategoryKind>(["PRODUCT"]);
  for (const section of input.sections) {
    if (section.type === "CATEGORY_GRID") {
      const kind = asString(asRecord(section.settings).kind, "PRODUCT") as CategoryKind;
      kinds.add(kind);
    }
  }

  const needsTeam = input.sections.some(
    (section) =>
      section.type === "GALLERY" && asString(asRecord(section.settings).appearance) === "people",
  );

  const [products, services, stats, partners, testimonials, settings, globalFaqs, pageFaqs, mediaById, teamMembers, ...trees] =
    await Promise.all([
      getPublishedProducts({ locale: input.locale, featured: true, perPage: 24 }),
      getAllServices(input.locale, false),
      getStats(input.locale),
      getPartners(input.locale),
      getPublishedTestimonials(input.locale, 12),
      getSiteSettings(input.locale),
      getFaqsFor({ locale: input.locale, scope: "GLOBAL" }),
      getFaqsFor({ locale: input.locale, scope: "PAGE", entityId: input.pageId }),
      mediaByIds(collectMediaIds(input.sections), input.locale),
      needsTeam ? getVisibleTeamMembers(input.locale) : Promise.resolve([]),
      ...[...kinds].map((kind) => getCategoryTree(input.locale, kind)),
    ]);

  const categoriesByKind: Partial<Record<CategoryKind, CategoryTreeNode[]>> = {};
  [...kinds].forEach((kind, index) => {
    categoriesByKind[kind] = trees[index] ?? [];
  });

  return {
    categoriesByKind,
    pageFaqs,
    base: {
      products: products.items,
      categories: categoriesByKind.PRODUCT ?? [],
      services,
      stats,
      partners,
      testimonials,
      teamMembers,
      faqs: globalFaqs,
      mediaById,
      pageId: input.pageId,
      quoteHref: withLocalePath(input.locale, "/request-a-quote"),
      whatsappUrl: whatsappUrl(settings.whatsapp, settings.whatsappDefaultMessage),
    },
  };
}
