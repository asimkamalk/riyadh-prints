import { getSectionRenderer } from "@/components/sections/render-map";
import { asNumber, asRecord, asString } from "@/lib/sections/parse";
import type { SectionResolvedData } from "@/lib/sections/types";
import { resolveSectionRenderData } from "@/server/queries/section-resolve";
import type { PageSectionDto } from "@/types/content";
import type { CategoryKind } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/locales";

export async function RenderPageSections({
  sections,
  locale,
  pageId,
  pageHasH1 = false,
}: {
  sections: PageSectionDto[];
  locale: Locale;
  pageId: string;
  pageHasH1?: boolean;
}) {
  const visible = sections;
  const { base, categoriesByKind, pageFaqs } = await resolveSectionRenderData({
    sections: visible,
    locale,
    pageId,
  });
  let usedH1 = pageHasH1;

  return (
    <div>
      {visible.map((section) => {
        const Renderer = getSectionRenderer(section.type);
        const headingLevel: 1 | 2 = usedH1 ? 2 : 1;
        usedH1 = true;
        const resolved = resolvedFor(section, base, categoriesByKind, pageFaqs);
        return (
          <Renderer
            key={section.id}
            id={section.id}
            data={asRecord(section.data)}
            settings={asRecord(section.settings)}
            locale={locale}
            headingLevel={headingLevel}
            resolved={resolved}
          />
        );
      })}
    </div>
  );
}

function resolvedFor(
  section: PageSectionDto,
  base: SectionResolvedData,
  categoriesByKind: Partial<Record<CategoryKind, SectionResolvedData["categories"]>>,
  pageFaqs: SectionResolvedData["faqs"],
): SectionResolvedData {
  const settings = asRecord(section.settings);
  const limit = asNumber(settings.limit, 8);
  const kind = asString(settings.kind, "PRODUCT") as CategoryKind;
  const scope = asString(settings.scope, "GLOBAL");
  const featuredOnly = settings.featuredOnly !== false;
  return {
    ...base,
    products: base.products.slice(0, limit),
    testimonials: base.testimonials.slice(0, limit),
    services: (featuredOnly ? base.services.filter((service) => service.isFeatured) : base.services).slice(0, limit),
    categories: categoriesByKind[kind] ?? base.categories,
    faqs: scope === "PAGE" ? pageFaqs : base.faqs,
  };
}
