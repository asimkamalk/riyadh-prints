import { sectionCatalog } from "@/lib/sections/catalog";
import { sectionEditors } from "@/components/sections/editors/bound-editors";
import { sectionRenderers } from "@/components/sections/render-map";
import type { SectionDefinition, SectionType } from "@/lib/sections/types";

/**
 * Single composed registry: catalog metadata + admin Editor + public Renderer.
 * Add a SectionType by updating catalog.ts, bound-editors, and render-map.
 * The page builder and public page route read these maps — they do not switch on type.
 */
export const sectionRegistry = Object.fromEntries(
  (Object.keys(sectionCatalog) as SectionType[]).map((type) => [
    type,
    {
      ...sectionCatalog[type],
      Editor: sectionEditors[type],
      Renderer: sectionRenderers[type],
    },
  ]),
) as Record<SectionType, SectionDefinition>;

export function getSectionDefinition(type: SectionType): SectionDefinition {
  return sectionRegistry[type];
}

export function listSectionDefinitions(): SectionDefinition[] {
  return Object.values(sectionRegistry);
}

export {
  defaultsFor,
  getSectionCatalog,
  isSectionType,
  listSectionCatalog,
  parseSectionData,
  parseSectionSettings,
  sectionCatalog,
  sectionDefaults,
  sectionTypeSchema,
  SECTION_TYPES,
} from "@/lib/sections/catalog";
