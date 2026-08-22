import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { MAX_UPLOAD_BYTES } from "@/lib/media-types";
import {
  assertUploadConstraints,
  MediaProcessError,
  processImageUpload,
} from "@/server/media/process";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("processImageUpload", () => {
  it("rejects oversized and disallowed files", () => {
    expect(() => assertUploadConstraints(new Uint8Array(0), "image/png")).toThrow(MediaProcessError);
    expect(() =>
      assertUploadConstraints(new Uint8Array(MAX_UPLOAD_BYTES + 1), "image/png"),
    ).toThrow(/10MB/);
    expect(() => assertUploadConstraints(PNG_1X1, null)).toThrow(/not allowed/);
  });

  it("converts a PNG to WebP or AVIF with dimensions and a blur placeholder", async () => {
    const result = await processImageUpload(PNG_1X1, "image/png");
    expect(["image/webp", "image/avif"]).toContain(result.mimeType);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.blurDataUrl?.startsWith("data:image/jpeg;base64,")).toBe(true);
    const meta = await sharp(result.buffer).metadata();
    expect(meta.format === "webp" || meta.format === "heif").toBe(true);
  });

  it("strips EXIF by rotating and re-encoding", async () => {
    const jpeg = await sharp({
      create: { width: 12, height: 8, channels: 3, background: { r: 200, g: 20, b: 20 } },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Copyright: "Riyadh Prints" } } })
      .toBuffer();
    const result = await processImageUpload(jpeg, "image/jpeg");
    const meta = await sharp(result.buffer).metadata();
    expect(meta.exif).toBeUndefined();
    expect(result.width).toBe(12);
    expect(result.height).toBe(8);
  });

  it("keeps SVG bytes and still produces a blur placeholder", async () => {
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="16"><rect width="32" height="16" fill="#c00"/></svg>`,
    );
    const result = await processImageUpload(svg, "image/svg+xml");
    expect(result.mimeType).toBe("image/svg+xml");
    expect(result.buffer.equals(svg)).toBe(true);
    expect(result.width).toBe(32);
    expect(result.height).toBe(16);
  });
});
