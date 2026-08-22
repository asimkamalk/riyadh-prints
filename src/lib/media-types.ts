export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MEDIA_TYPE_FILTERS = [
  "all",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "svg",
] as const;

export type MediaTypeFilter = (typeof MEDIA_TYPE_FILTERS)[number];

export const DEFAULT_MEDIA_FOLDER = "uploads";
export const MEDIA_PAGE_SIZE = 48;

const MIME_SET = new Set<string>(ALLOWED_MIME_TYPES);

const EXT_TO_MIME: Record<string, AllowedMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const TYPE_TO_MIMES: Record<Exclude<MediaTypeFilter, "all">, readonly string[]> = {
  jpeg: ["image/jpeg", "image/jpg"],
  png: ["image/png"],
  webp: ["image/webp"],
  avif: ["image/avif"],
  gif: ["image/gif"],
  svg: ["image/svg+xml"],
};

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return MIME_SET.has(mime === "image/jpg" ? "image/jpeg" : mime);
}

export function mimeFromFilename(name: string, reportedType?: string): AllowedMimeType | null {
  const reported = reportedType === "image/jpg" ? "image/jpeg" : reportedType;
  if (reported && isAllowedMimeType(reported)) {
    return reported;
  }
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? null;
}

export function mimesForTypeFilter(type: MediaTypeFilter): readonly string[] | null {
  if (type === "all") {
    return null;
  }
  return TYPE_TO_MIMES[type];
}

export function sanitizeFolder(input: string | undefined | null): string {
  const raw = (input ?? "").trim().toLowerCase().replaceAll("\\", "/");
  const cleaned = raw
    .split("/")
    .map((seg) => seg.replace(/[^a-z0-9_-]/g, "").slice(0, 40))
    .filter((seg) => seg.length > 0 && seg !== "." && seg !== "..")
    .join("/");
  return cleaned.slice(0, 80) || DEFAULT_MEDIA_FOLDER;
}

export function altFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base.slice(0, 200) || "Image";
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileBasename(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? pathname;
}
