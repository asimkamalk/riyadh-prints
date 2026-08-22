import { describe, expect, it } from "vitest";

import { pageSearchHref, paginationWindow } from "./pagination-utils";

describe("paginationWindow", () => {
  it("lists every page when there are few", () => {
    expect(paginationWindow(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("inserts ellipsis for long ranges", () => {
    expect(paginationWindow(5, 12)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 12]);
  });
});

describe("pageSearchHref", () => {
  it("omits page=1 and keeps other params", () => {
    expect(pageSearchHref("/product-category/cards", 1, "sort=new")).toBe(
      "/product-category/cards?sort=new",
    );
    expect(pageSearchHref("/product-category/cards", 3, "sort=new")).toBe(
      "/product-category/cards?sort=new&page=3",
    );
  });
});
