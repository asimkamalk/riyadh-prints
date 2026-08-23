import { Search } from "lucide-react";
import Link from "next/link";

import { pageText } from "@/components/site/page-copy";
import { shopHref, type FilterCategory, type ShopFilters } from "@/components/site/shop-query";
import { SiteImage } from "@/components/site/site-image";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardDto } from "@/types/content";
import type { ProductTagLink } from "@/server/queries/product-tags";

export function ShopSidebar({
  locale,
  pathname,
  shopPathname,
  activeCategorySlug,
  categories,
  tags,
  recent,
  filters,
}: {
  locale: Locale;
  pathname: string;
  shopPathname: string;
  activeCategorySlug?: string;
  categories: FilterCategory[];
  tags: ProductTagLink[];
  recent: ProductCardDto[];
  filters: ShopFilters;
}) {
  const sort = filters.sort ?? "featured";
  return (
    <aside className="grid gap-8 lg:sticky lg:top-28 lg:self-start">
      <form className="relative" action={pathname} method="get">
        {filters.tag ? <input type="hidden" name="tag" value={filters.tag} /> : null}
        {sort !== "featured" ? <input type="hidden" name="sort" value={sort} /> : null}
        {filters.view === "list" ? <input type="hidden" name="view" value="list" /> : null}
        <label htmlFor="shop-q" className="sr-only">
          {pageText(locale, "searchProducts")}
        </label>
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="shop-q"
          name="q"
          type="search"
          defaultValue={filters.q ?? ""}
          placeholder={pageText(locale, "searchProductsPlaceholder")}
          className="rounded-full bg-background ps-9"
        />
      </form>
      <nav aria-label={pageText(locale, "productCategories")}>
        <p className="mb-3 text-sm font-semibold">{pageText(locale, "productCategories")}</p>
        <ul className="grid gap-1">
          <li>
            <Link
              href={shopHref(shopPathname, { ...filters, page: 1 }) as never}
              className={filterLinkClass(!activeCategorySlug)}
            >
              {pageText(locale, "allCategories")}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={`${category.depth}-${category.slug}`}>
              <Link
                href={shopHref(category.href, { sort: filters.sort, view: filters.view }) as never}
                className={filterLinkClass(activeCategorySlug === category.slug, category.depth)}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {recent.length ? (
        <section>
          <p className="mb-3 text-sm font-semibold">{pageText(locale, "recentProducts")}</p>
          <ul className="grid gap-3">
            {recent.map((product) => (
              <li key={product.id}>
                <Link href={product.href as never} className="flex gap-3 rounded-md hover:bg-muted/60">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.primaryImage ? (
                      <SiteImage
                        media={product.primaryImage}
                        alt={product.primaryImage.alt || product.name}
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 self-center text-sm font-medium leading-snug">{product.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {tags.length ? (
        <nav aria-label={pageText(locale, "productTags")}>
          <p className="mb-3 text-sm font-semibold">{pageText(locale, "productTags")}</p>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={shopHref(pathname, { ...filters, tag: tag.slug, page: 1 }) as never}
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1 text-xs hover:bg-muted",
                    filters.tag === tag.slug && "border-primary bg-muted font-medium",
                  )}
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </aside>
  );
}

function filterLinkClass(active: boolean, depth = 0): string {
  return cn(
    "block rounded-md px-2 py-1 text-sm hover:bg-muted",
    active && "bg-muted font-medium text-primary",
    depth === 1 && "ps-5",
    depth >= 2 && "ps-8",
  );
}
