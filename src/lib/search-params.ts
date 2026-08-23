import type { ProductSort } from "@/types/content";

export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = firstParam(value);
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

const PRODUCT_SORTS: readonly ProductSort[] = [
  "featured",
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
];

export function parseProductSort(value: string | string[] | undefined): ProductSort {
  const raw = firstParam(value);
  return PRODUCT_SORTS.includes(raw as ProductSort) ? (raw as ProductSort) : "featured";
}

export function parseShopView(value: string | string[] | undefined): "grid" | "list" {
  return firstParam(value) === "list" ? "list" : "grid";
}
