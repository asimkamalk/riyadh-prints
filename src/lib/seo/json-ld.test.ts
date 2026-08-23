import { describe, expect, it } from "vitest";

import { compactJsonLd, sanitizeSchemaString } from "./compact";
import { faqPage, itemList, product } from "./json-ld";

describe("compactJsonLd", () => {
  it("strips undefined empty keys and sanitises HTML", () => {
    const out = compactJsonLd({
      "@type": "Product",
      name: "Cards",
      description: "<p>Gloss <strong>finish</strong></p>",
      sku: undefined,
      extra: "",
      nested: { skip: null },
    });
    expect(out).toEqual({
      "@type": "Product",
      name: "Cards",
      description: "Gloss finish",
    });
  });
});

describe("sanitizeSchemaString", () => {
  it("removes tags so schema values are plain text", () => {
    expect(sanitizeSchemaString("<h2>Hours</h2> &amp; pickup")).toBe("Hours & pickup");
  });
});

describe("builders", () => {
  it("omits aggregateRating unless reviews exist", () => {
    const withReviews = product({
      name: "Cards",
      url: "/product/cards",
      images: [],
      reviews: { ratingValue: 5, reviewCount: 3 },
    });
    const without = product({
      name: "Cards",
      url: "/product/cards",
      images: [],
    });
    expect(withReviews.aggregateRating).toMatchObject({ reviewCount: 3 });
    expect(without.aggregateRating).toBeUndefined();
  });

  it("does not emit FAQPage for empty or HTML-only answers", () => {
    expect(faqPage([])).toBeNull();
    expect(
      faqPage([{ question: "Q?", answer: { type: "doc", content: [] } }]),
    ).toBeNull();
    const page = faqPage([
      {
        question: "Do you print same day?",
        answer: { type: "doc", content: [{ type: "text", text: "Yes, in Riyadh." }] },
      },
    ]);
    expect(page?.["@type"]).toBe("FAQPage");
  });

  it("builds ItemList positions for category products", () => {
    const list = itemList([
      { name: "A", url: "/product/a" },
      { name: "B", url: "/product/b" },
    ]);
    expect(list.numberOfItems).toBe(2);
    expect((list.itemListElement as { position: number }[])[1]?.position).toBe(2);
  });
});
