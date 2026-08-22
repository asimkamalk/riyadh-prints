import { describe, expect, it } from "vitest";

import { telHref, whatsappUrl } from "./whatsapp";

describe("whatsappUrl", () => {
  it("builds a wa.me link from a formatted Gulf number", () => {
    expect(whatsappUrl("+966 54 331 8975", "Hello")).toBe(
      "https://wa.me/966543318975?text=Hello",
    );
  });

  it("returns empty when there are no digits", () => {
    expect(whatsappUrl("")).toBe("");
  });
});

describe("telHref", () => {
  it("keeps a leading plus", () => {
    expect(telHref("+966 54 331 8975")).toBe("tel:+966543318975");
  });
});
