import {
  MEDIA_PAGE_SIZE,
  type MediaTypeFilter,
} from "@/lib/media-types";
import { mediaTypeFilterSchema, mediaViewSchema } from "@/lib/validations/media";

export type MediaLibraryFilters = {
  query: string;
  folder: string;
  type: MediaTypeFilter;
  from: string;
  to: string;
  view: "grid" | "list";
  page: number;
};

function first(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = sp[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export function parseMediaSearchParams(
  sp: Record<string, string | string[] | undefined>,
): MediaLibraryFilters {
  const typeParsed = mediaTypeFilterSchema.safeParse(first(sp, "type") || "all");
  const viewParsed = mediaViewSchema.safeParse(first(sp, "view") || "grid");
  const page = Number(first(sp, "page") || "1");
  return {
    query: first(sp, "q").trim(),
    folder: first(sp, "folder").trim(),
    type: typeParsed.success ? typeParsed.data : "all",
    from: first(sp, "from"),
    to: first(sp, "to"),
    view: viewParsed.success ? viewParsed.data : "grid",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function mediaQueryString(state: MediaLibraryFilters): string {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.folder) params.set("folder", state.folder);
  if (state.type !== "all") params.set("type", state.type);
  if (state.from) params.set("from", state.from);
  if (state.to) params.set("to", state.to);
  if (state.view !== "grid") params.set("view", state.view);
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}

export const mediaPageSize = MEDIA_PAGE_SIZE;
