import { afterEach, describe, expect, it } from "vitest";

import { safeCallbackUrl } from "./callback-url";

describe("safeCallbackUrl", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("allows relative admin paths", () => {
    expect(safeCallbackUrl("/admin/products")).toBe("/admin/products");
  });

  it("rejects login loops, protocol-relative URLs, and off-site hosts", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(safeCallbackUrl("/admin/login")).toBe("/admin");
    expect(safeCallbackUrl("/admin/login?x=1")).toBe("/admin");
    expect(safeCallbackUrl("//evil.example")).toBe("/admin");
    expect(safeCallbackUrl("https://evil.example/phish")).toBe("/admin");
    expect(safeCallbackUrl("http://localhost:3000/admin/quotes")).toBe(
      "/admin/quotes",
    );
  });

  it("falls back when the value is missing", () => {
    expect(safeCallbackUrl(undefined)).toBe("/admin");
  });
});
