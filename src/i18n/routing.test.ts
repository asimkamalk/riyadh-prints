import { describe, expect, it } from "vitest";

import {
  isAdminLoginPath,
  isAdminPath,
  localeFromPathname,
  negotiateLocale,
  prefersArabic,
  resolveLocale,
  stripLocalePrefix,
  withLocalePath,
} from "./routing";

describe("localeFromPathname", () => {
  it("reads ar and en prefixes", () => {
    expect(localeFromPathname("/ar")).toBe("ar");
    expect(localeFromPathname("/ar/about")).toBe("ar");
    expect(localeFromPathname("/en/about")).toBe("en");
    expect(localeFromPathname("/about")).toBeNull();
    expect(localeFromPathname("/ar-amco")).toBeNull();
  });
});

describe("stripLocalePrefix / withLocalePath", () => {
  it("strips and re-applies prefixes with English unprefixed", () => {
    expect(stripLocalePrefix("/ar/about")).toBe("/about");
    expect(stripLocalePrefix("/en/about")).toBe("/about");
    expect(withLocalePath("en", "/about")).toBe("/about");
    expect(withLocalePath("ar", "/about")).toBe("/ar/about");
    expect(withLocalePath("ar", "/")).toBe("/ar");
  });
});

describe("negotiateLocale", () => {
  it("prefers the NEXT_LOCALE cookie over Accept-Language", () => {
    expect(negotiateLocale("en", "ar")).toBe("en");
    expect(negotiateLocale("ar", "en-US")).toBe("ar");
  });

  it("falls back to Accept-Language, then English", () => {
    expect(negotiateLocale(undefined, "ar-SA,ar;q=0.9,en;q=0.8")).toBe("ar");
    expect(negotiateLocale(undefined, "en-US,en;q=0.9,ar;q=0.8")).toBe("en");
    expect(negotiateLocale(undefined, null)).toBe("en");
  });
});

describe("resolveLocale", () => {
  it("treats unprefixed URLs as English and /ar as Arabic", () => {
    expect(resolveLocale("/ar/shop")).toBe("ar");
    expect(resolveLocale("/ar")).toBe("ar");
    expect(resolveLocale("/about")).toBe("en");
    expect(resolveLocale("/")).toBe("en");
  });
});

describe("prefersArabic", () => {
  it("uses quality values", () => {
    expect(prefersArabic("ar;q=0.2,en;q=0.8")).toBe(false);
    expect(prefersArabic("en;q=0.2,ar;q=0.8")).toBe(true);
  });
});

describe("admin paths", () => {
  it("detects admin routes with or without a locale prefix", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/login")).toBe(true);
    expect(isAdminPath("/ar/admin/login")).toBe(true);
    expect(isAdminLoginPath("/admin/login")).toBe(true);
    expect(isAdminLoginPath("/ar/admin/login")).toBe(true);
    expect(isAdminPath("/about")).toBe(false);
  });
});
