import { describe, expect, it } from "vitest";

import {
  buildMetadata,
  formatTitle,
  localePairPaths,
  shouldNoIndex,
  truncateDescription,
} from "./metadata";

describe("truncateDescription", () => {
  it("keeps short copy unchanged", () => {
    expect(truncateDescription("Same-day printing in Riyadh.")).toBe(
      "Same-day printing in Riyadh.",
    );
  });

  it("cuts at a word boundary before 160 characters", () => {
    const text =
      "Riyadh Prints offers same-day printing for apparel packaging banners stationery and signage across Riyadh with pickup and delivery options for businesses of every size today.";
    const out = truncateDescription(text);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith(" ")).toBe(false);
    expect(text.startsWith(out)).toBe(true);
    expect(out.includes("today")).toBe(false);
  });
});

describe("shouldNoIndex", () => {
  it("forces noindex on search wishlist and compare", () => {
    expect(shouldNoIndex({ path: "/search" })).toBe(true);
    expect(shouldNoIndex({ path: "/wishlist" })).toBe(true);
    expect(shouldNoIndex({ path: "/compare/cards" })).toBe(true);
    expect(shouldNoIndex({ path: "/shop" })).toBe(false);
  });

  it("forces noindex on thin paginated pages after page 1", () => {
    expect(shouldNoIndex({ path: "/shop", page: 2 })).toBe(true);
    expect(shouldNoIndex({ path: "/shop", page: 2, thinContent: false })).toBe(false);
    expect(shouldNoIndex({ path: "/shop", page: 1 })).toBe(false);
  });
});

describe("buildMetadata", () => {
  it("applies DB then derived then default fallbacks and an absolute canonical", () => {
    const meta = buildMetadata({
      locale: "en",
      path: "/shop",
      title: null,
      derivedTitle: "Shop",
      description: null,
      derivedDescription: "Browse printing products in Riyadh.",
    });
    expect(meta.title).toEqual({ absolute: "Shop | Riyadh Prints" });
    expect(meta.description).toBe("Browse printing products in Riyadh.");
    expect(meta.alternates?.canonical).toBe("http://localhost:3000/shop");
    expect(meta.metadataBase?.toString()).toBe("http://localhost:3000/");
  });

  it("emits translated hreflang URLs instead of a naive prefix", () => {
    const meta = buildMetadata({
      locale: "en",
      path: "/product/business-cards",
      alternateSlug: "بطاقات-العمل",
      derivedTitle: "Business cards",
    });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(languages.en).toBe("http://localhost:3000/product/business-cards");
    expect(languages.ar).toBe("http://localhost:3000/ar/product/بطاقات-العمل");
    expect(languages["x-default"]).toBe("http://localhost:3000/product/business-cards");
  });

  it("uses alternatePath when the other locale has a different tree", () => {
    const meta = buildMetadata({
      locale: "ar",
      path: "/من-نحن",
      alternatePath: "/about",
      derivedTitle: "من نحن",
    });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(languages.en).toBe("http://localhost:3000/about");
    expect(languages.ar).toBe("http://localhost:3000/ar/من-نحن");
  });

  it("sets twitter summary_large_image and noindex on search", () => {
    const meta = buildMetadata({
      locale: "en",
      path: "/search",
      derivedTitle: "Search",
    });
    const twitter = meta.twitter as { card?: string } | undefined;
    expect(twitter?.card).toBe("summary_large_image");
    expect(meta.robots).toMatchObject({ index: false });
  });
});

describe("formatTitle and localePairPaths", () => {
  it("does not double the site name", () => {
    expect(formatTitle("Riyadh Prints")).toBe("Riyadh Prints");
    expect(formatTitle("Shop | Riyadh Prints")).toBe("Shop | Riyadh Prints");
  });

  it("builds current and other-locale paths from slug maps", () => {
    expect(
      localePairPaths("en", "/product", { en: "cards", ar: "بطاقات" }),
    ).toEqual({
      path: "/product/cards",
      alternatePath: "/product/بطاقات",
    });
  });
});
