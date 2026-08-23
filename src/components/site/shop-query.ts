import type { CategoryTreeNode, ProductSort } from "@/types/content";
import { firstParam, parsePageParam, parseProductSort, parseShopView } from "@/lib/search-params";

export type ShopView = "grid" | "list";

export type ShopFilters = {
  tag?: string;
  sort?: ProductSort;
  q?: string;
  page?: number;
  view?: ShopView;
};

export type FilterCategory = {
  slug: string;
  name: string;
  href: string;
  depth: number;
};

export function parseShopFilters(
  sp: Record<string, string | string[] | undefined>,
): ShopFilters {
  return {
    tag: firstParam(sp.tag),
    sort: parseProductSort(sp.sort),
    q: firstParam(sp.q)?.trim() || undefined,
    page: parsePageParam(sp.page),
    view: parseShopView(sp.view),
  };
}

export function shopSearchParams(filters: ShopFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.sort && filters.sort !== "featured") {
    params.set("sort", filters.sort);
  }
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.tag) {
    params.set("tag", filters.tag);
  }
  if (filters.view === "list") {
    params.set("view", "list");
  }
  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }
  return params;
}

export function shopHref(pathname: string, filters: ShopFilters): string {
  const query = shopSearchParams(filters).toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function flattenCategoryTree(
  nodes: CategoryTreeNode[],
  depth = 0,
): FilterCategory[] {
  const rows: FilterCategory[] = [];
  for (const node of nodes) {
    rows.push({ slug: node.slug, name: node.name, href: node.href, depth });
    rows.push(...flattenCategoryTree(node.children, depth + 1));
  }
  return rows;
}
