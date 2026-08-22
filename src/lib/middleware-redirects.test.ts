import { describe, expect, it } from "vitest";

import { lookupRedirect } from "@/lib/middleware-redirects";

describe("lookupRedirect", () => {
  const map = {
    "/old-product": { destination: "/product/new", type: "PERMANENT" as const },
    "/temp": { destination: "/about", type: "TEMPORARY" as const },
    "/loop": { destination: "/loop", type: "PERMANENT" as const },
  };

  it("matches a normalized path", () => {
    expect(lookupRedirect("/old-product/", map)).toEqual({
      destination: "/product/new",
      type: "PERMANENT",
    });
    expect(lookupRedirect("temp", map)?.type).toBe("TEMPORARY");
  });

  it("skips missing and self-loop rows", () => {
    expect(lookupRedirect("/missing", map)).toBeNull();
    expect(lookupRedirect("/loop", map)).toBeNull();
  });
});
