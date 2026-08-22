import sharp from "sharp";

import {
  MAX_UPLOAD_BYTES,
  type AllowedMimeType,
} from "@/lib/media-types";

export class MediaProcessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaProcessError";
  }
}

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: AllowedMimeType;
  extension: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
};

export function assertUploadConstraints(bytes: Uint8Array, mime: AllowedMimeType | null): AllowedMimeType {
  if (bytes.byteLength === 0) {
    throw new MediaProcessError("The file is empty.");
  }
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new MediaProcessError("File exceeds the 10MB limit.");
  }
  if (!mime) {
    throw new MediaProcessError("That file type is not allowed.");
  }
  return mime;
}

export async function processImageUpload(
  bytes: Buffer,
  mimeType: AllowedMimeType,
): Promise<ProcessedImage> {
  assertUploadConstraints(bytes, mimeType);
  if (mimeType === "image/svg+xml") {
    return processSvg(bytes);
  }
  return processRaster(bytes);
}

async function processSvg(bytes: Buffer): Promise<ProcessedImage> {
  let width: number | null = null;
  let height: number | null = null;
  let blurDataUrl: string | null = null;
  try {
    const image = sharp(bytes, { density: 72, failOn: "none" });
    const meta = await image.metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
    const blur = await image
      .clone()
      .rotate()
      .resize(16, 16, { fit: "inside" })
      .jpeg({ quality: 50 })
      .toBuffer();
    blurDataUrl = toJpegDataUrl(blur);
  } catch {
    blurDataUrl = null;
  }
  return {
    buffer: bytes,
    mimeType: "image/svg+xml",
    extension: "svg",
    width,
    height,
    blurDataUrl,
  };
}

async function processRaster(bytes: Buffer): Promise<ProcessedImage> {
  try {
    const source = sharp(bytes, { failOn: "none", animated: false }).rotate();
    const [meta, webp, avif, blur] = await Promise.all([
      source.metadata(),
      source.clone().webp({ quality: 82, effort: 4 }).toBuffer(),
      source.clone().avif({ quality: 50, effort: 4 }).toBuffer(),
      source.clone().resize(16, 16, { fit: "inside" }).jpeg({ quality: 50 }).toBuffer(),
    ]);
    const useAvif = avif.byteLength < webp.byteLength;
    return {
      buffer: useAvif ? avif : webp,
      mimeType: useAvif ? "image/avif" : "image/webp",
      extension: useAvif ? "avif" : "webp",
      width: meta.width ?? null,
      height: meta.height ?? null,
      blurDataUrl: toJpegDataUrl(blur),
    };
  } catch {
    throw new MediaProcessError("Could not process this image.");
  }
}

function toJpegDataUrl(buffer: Buffer): string {
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}
