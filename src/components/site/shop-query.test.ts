import { describe, expect, it } from "vitest";

import { shopHref, shopSearchParams } from "./shop-query";

describe("shopHref", () => {
  it("omits default sort and grid view", () => {
    expect(shopHref("/shop", { sort: "featured", view: "grid" })).toBe("/shop");
  });

  it("keeps tag, list view, and page — never a category query", () => {
    expect(
      shopSearchParams({
        tag: "same-day",
        view: "list",
        page: 2,
      }).toString(),
    ).toBe("tag=same-day&view=list&page=2");
  });

  it("builds category paths with listing filters only", () => {
    expect(shopHref("/product-category/bags", { view: "list" })).toBe(
      "/product-category/bags?view=list",
    );
  });
});
