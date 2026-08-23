"use client";

import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { pageText, showingResults } from "@/components/site/page-copy";
import { shopHref, type ShopFilters } from "@/components/site/shop-query";
import type { Locale } from "@/i18n/locales";
import type { ProductSort } from "@/types/content";
import { cn } from "@/lib/utils";

const SORTS: ProductSort[] = [
  "featured",
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
];

const SORT_COPY: Record<
  ProductSort,
  "sortFeatured" | "sortNewest" | "sortOldest" | "sortNameAsc" | "sortNameDesc" | "sortPriceAsc" | "sortPriceDesc"
> = {
  featured: "sortFeatured",
  newest: "sortNewest",
  oldest: "sortOldest",
  "name-asc": "sortNameAsc",
  "name-desc": "sortNameDesc",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
};

export function ShopToolbar({
  locale,
  pathname,
  filters,
  from,
  to,
  total,
}: {
  locale: Locale;
  pathname: string;
  filters: ShopFilters;
  from: number;
  to: number;
  total: number;
}) {
  const router = useRouter();
  const sort = filters.sort ?? "featured";
  const view = filters.view ?? "grid";

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <p className="text-sm text-muted-foreground">
        {total ? showingResults(locale, from, to, total) : pageText(locale, "emptyProducts")}
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor="shop-sort" className="sr-only">
          {pageText(locale, "sort")}
        </label>
        <select
          id="shop-sort"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={sort}
          onChange={(event) =>
            router.push(
              shopHref(pathname, { ...filters, sort: event.target.value as ProductSort, page: 1 }) as never,
            )
          }
        >
          {SORTS.map((value) => (
            <option key={value} value={value}>
              {pageText(locale, SORT_COPY[value])}
            </option>
          ))}
        </select>
        <Link
          href={shopHref(pathname, { ...filters, view: "grid" }) as never}
          className={viewToggleClass(view === "grid")}
          aria-current={view === "grid" ? "true" : undefined}
          aria-label={pageText(locale, "gridView")}
        >
          <LayoutGrid className="size-4" />
        </Link>
        <Link
          href={shopHref(pathname, { ...filters, view: "list" }) as never}
          className={viewToggleClass(view === "list")}
          aria-current={view === "list" ? "true" : undefined}
          aria-label={pageText(locale, "listView")}
        >
          <List className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function viewToggleClass(active: boolean): string {
  return cn(
    "inline-flex size-9 items-center justify-center rounded-md border",
    active ? "border-primary bg-muted text-primary" : "text-muted-foreground hover:bg-muted",
  );
}
