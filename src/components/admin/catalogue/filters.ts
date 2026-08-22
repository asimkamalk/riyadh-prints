import type { ContentStatus } from "@/generated/prisma/enums";

export type CatalogueListFilters = {
  query: string;
  category: string;
  status: ContentStatus | "all";
  featured: "all" | "yes" | "no";
  page: number;
};

const STATUSES: ContentStatus[] = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

function first(sp: Record<string, string | string[] | undefined>, key: string): string {
  const value = sp[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export function parseCatalogueSearchParams(
  sp: Record<string, string | string[] | undefined>,
): CatalogueListFilters {
  const statusRaw = first(sp, "status");
  const featuredRaw = first(sp, "featured");
  const page = Number(first(sp, "page") || "1");
  return {
    query: first(sp, "q").trim(),
    category: first(sp, "category").trim(),
    status: STATUSES.includes(statusRaw as ContentStatus) ? (statusRaw as ContentStatus) : "all",
    featured: featuredRaw === "yes" || featuredRaw === "no" ? featuredRaw : "all",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function catalogueQueryString(state: CatalogueListFilters): string {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category) params.set("category", state.category);
  if (state.status !== "all") params.set("status", state.status);
  if (state.featured !== "all") params.set("featured", state.featured);
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}

export const CATALOGUE_PAGE_SIZE = 20;
export { STATUSES as CONTENT_STATUSES };
