import { describe, expect, it } from "vitest";

import {
  altFromFilename,
  formatBytes,
  isAllowedMimeType,
  mimeFromFilename,
  sanitizeFolder,
} from "@/lib/media-types";

describe("media type helpers", () => {
  it("maps extensions and reported jpeg aliases", () => {
    expect(mimeFromFilename("hero.JPG", "")).toBe("image/jpeg");
    expect(mimeFromFilename("logo.svg", "image/svg+xml")).toBe("image/svg+xml");
    expect(mimeFromFilename("photo.bin", "application/pdf")).toBeNull();
    expect(isAllowedMimeType("image/jpg")).toBe(true);
    expect(isAllowedMimeType("image/jpeg")).toBe(true);
  });

  it("sanitizes folders and derives alt text", () => {
    expect(sanitizeFolder("../etc/passwd")).toBe("etc/passwd");
    expect(sanitizeFolder("")).toBe("uploads");
    expect(sanitizeFolder("Brand Assets")).toBe("brandassets");
    expect(altFromFilename("My_Hero-Image.png")).toBe("My Hero Image");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});
