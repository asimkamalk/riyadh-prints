import { describe, expect, it } from "vitest";

import { SectionType } from "@/generated/prisma/enums";
import {
  defaultsFor,
  listSectionCatalog,
  parseSectionData,
  sectionCatalog,
  SECTION_TYPES,
} from "@/lib/sections/catalog";
import { listSectionDefinitions, sectionRegistry } from "@/lib/sections/registry";
import { sectionEditors } from "@/components/sections/editors/bound-editors";
import { sectionRenderers } from "@/components/sections/render-map";

const enumTypes = Object.values(SectionType);

describe("section registry", () => {
  it("registers every SectionType exactly once", () => {
    expect([...SECTION_TYPES].sort()).toEqual([...enumTypes].sort());
    expect(Object.keys(sectionCatalog).sort()).toEqual([...enumTypes].sort());
    expect(Object.keys(sectionRegistry).sort()).toEqual([...enumTypes].sort());
    expect(Object.keys(sectionEditors).sort()).toEqual([...enumTypes].sort());
    expect(Object.keys(sectionRenderers).sort()).toEqual([...enumTypes].sort());
    expect(listSectionCatalog()).toHaveLength(enumTypes.length);
    expect(listSectionDefinitions()).toHaveLength(enumTypes.length);
  });

  it("parses defaults for every type", () => {
    for (const type of enumTypes) {
      const definition = sectionCatalog[type];
      const defaults = defaultsFor(type);
      expect(definition.schema.safeParse(defaults.data).success).toBe(true);
      expect(definition.settingsSchema.safeParse(defaults.settings).success).toBe(true);
      expect(definition.label.length).toBeGreaterThan(0);
      expect(definition.description.length).toBeGreaterThan(0);
      expect(typeof definition.summarize(defaults.data)).toBe("string");
      expect(sectionRegistry[type].Editor).toBeTypeOf("function");
      expect(sectionRegistry[type].Renderer).toBeTypeOf("function");
    }
  });

  it("fills missing content keys from defaults", () => {
    const data = parseSectionData("HERO", { heading: "Printed in Riyadh" });
    expect(data.heading).toBe("Printed in Riyadh");
    expect(typeof data.primaryCta).toBe("string");
  });
});
