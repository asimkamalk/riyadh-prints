import { describe, expect, it } from "vitest";

import { isExternalHref, quoteHrefFromMenu, withoutHighlights } from "@/components/site/nav-utils";
import type { MenuItemDto } from "@/types/content";

function item(partial: Partial<MenuItemDto> & Pick<MenuItemDto, "id" | "label" | "href">): MenuItemDto {
  return {
    openInNewTab: false,
    iconName: null,
    isMegaMenu: false,
    highlight: false,
    image: null,
    children: [],
    description: null,
    servedLocale: "en",
    isFallback: false,
    ...partial,
  };
}

describe("nav-utils", () => {
  it("drops highlight items from the text nav", () => {
    const items = [
      item({ id: "1", label: "Home", href: "/" }),
      item({ id: "2", label: "Quote", href: "/request-a-quote", highlight: true }),
    ];
    expect(withoutHighlights(items).map((row) => row.id)).toEqual(["1"]);
  });

  it("uses the highlight href for the quote CTA", () => {
    const items = [item({ id: "2", label: "Quote", href: "/ar/request-a-quote", highlight: true })];
    expect(quoteHrefFromMenu(items, "ar")).toBe("/ar/request-a-quote");
  });

  it("detects external hrefs", () => {
    expect(isExternalHref("https://wa.me/1")).toBe(true);
    expect(isExternalHref("/about")).toBe(false);
  });
});
