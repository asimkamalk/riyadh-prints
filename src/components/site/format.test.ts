import { describe, expect, it } from "vitest";

import { formatStartingPrice, formatStatNumber, parseStatNumber } from "./format";

describe("parseStatNumber / formatStatNumber", () => {
  it("reads digits and formats with the original grouping", () => {
    expect(parseStatNumber("25,000")).toBe(25000);
    expect(formatStatNumber(25000, "25,000")).toBe("25,000");
    expect(parseStatNumber("12+")).toBe(12);
  });
});

describe("formatStartingPrice", () => {
  it("returns null when there is no amount", () => {
    expect(formatStartingPrice("en", null)).toBeNull();
  });

  it("prefixes From and SAR", () => {
    expect(formatStartingPrice("en", "12.00")).toBe("From 12 SAR");
    expect(formatStartingPrice("ar", "12.00")).toBe("من 12 ر.س");
  });
});
