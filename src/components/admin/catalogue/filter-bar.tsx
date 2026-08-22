"use client";

import {
  CONTENT_STATUSES,
  type CatalogueListFilters,
} from "@/components/admin/catalogue/filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminCategoryOption } from "@/server/queries/admin-categories";

export function CatalogueFilterBar({
  filters,
  categories,
  onChange,
}: {
  filters: CatalogueListFilters;
  categories?: AdminCategoryOption[];
  onChange: (patch: Partial<CatalogueListFilters>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories ? (
        <Select
          value={filters.category || "all"}
          onValueChange={(value) => onChange({ category: value === "all" ? "" : value, page: 1 })}
        >
          <SelectTrigger className="w-44" aria-label="Category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ status: value as CatalogueListFilters["status"], page: 1 })}
      >
        <SelectTrigger className="w-36" aria-label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {CONTENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.featured}
        onValueChange={(value) => onChange({ featured: value as CatalogueListFilters["featured"], page: 1 })}
      >
        <SelectTrigger className="w-36" aria-label="Featured">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="yes">Featured</SelectItem>
          <SelectItem value="no">Not featured</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
