import { describe, expect, it } from "vitest";

import { parseSitePath } from "./site-path";

describe("parseSitePath", () => {
  it("reads home and locale-prefixed home", () => {
    expect(parseSitePath("/")).toEqual({ kind: "home" });
    expect(parseSitePath("/ar")).toEqual({ kind: "home" });
    expect(parseSitePath("/en")).toEqual({ kind: "home" });
  });

  it("reads catalogue and content prefixes", () => {
    expect(parseSitePath("/product/business-cards")).toEqual({
      kind: "product",
      slug: "business-cards",
    });
    expect(parseSitePath("/ar/product-category/apparel")).toEqual({
      kind: "category",
      slug: "apparel",
    });
    expect(parseSitePath("/services/offset")).toEqual({ kind: "service", slug: "offset" });
    expect(parseSitePath("/blog/hello")).toEqual({ kind: "post", slug: "hello" });
    expect(parseSitePath("/portfolio/wrap")).toEqual({ kind: "project", slug: "wrap" });
    expect(parseSitePath("/author/asim")).toEqual({ kind: "author", slug: "asim" });
  });

  it("treats nested CMS paths as pages and draft preview as home", () => {
    expect(parseSitePath("/about/asim-kamal")).toEqual({
      kind: "page",
      segments: ["about", "asim-kamal"],
    });
    expect(parseSitePath("/ar/services")).toEqual({ kind: "services" });
    expect(parseSitePath("/preview/page/abc")).toEqual({ kind: "home" });
    expect(parseSitePath("/search")).toEqual({ kind: "search" });
  });

  it("reads shop, blogs taxonomy, and utility routes", () => {
    expect(parseSitePath("/shop")).toEqual({ kind: "shop" });
    expect(parseSitePath("/blogs")).toEqual({ kind: "blogs" });
    expect(parseSitePath("/blogs/hello")).toEqual({ kind: "post", slug: "hello" });
    expect(parseSitePath("/ar/blogs/category/paper")).toEqual({
      kind: "post-category",
      slug: "paper",
    });
    expect(parseSitePath("/blogs/tag/offset")).toEqual({ kind: "post-tag", slug: "offset" });
    expect(parseSitePath("/request-a-quote")).toEqual({ kind: "quote" });
    expect(parseSitePath("/contact")).toEqual({ kind: "contact" });
    expect(parseSitePath("/faqs")).toEqual({ kind: "faqs" });
  });
});
