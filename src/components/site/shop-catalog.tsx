import { ProductGrid } from "@/components/site/content-grids";
import { pageText } from "@/components/site/page-copy";
import { Pagination } from "@/components/site/pagination";
import { ShopSidebar } from "@/components/site/shop-sidebar";
import { ShopToolbar } from "@/components/site/shop-toolbar";
import { shopHref, type FilterCategory, type ShopFilters } from "@/components/site/shop-query";
import type { Locale } from "@/i18n/locales";
import type { Paginated, ProductCard as ProductCardDto } from "@/types/content";
import type { ProductTagLink } from "@/server/queries/product-tags";

export function ShopCatalog({
  locale,
  pathname,
  shopPathname,
  activeCategorySlug,
  categories,
  tags,
  recent,
  filters,
  products,
}: {
  locale: Locale;
  pathname: string;
  shopPathname: string;
  activeCategorySlug?: string;
  categories: FilterCategory[];
  tags: ProductTagLink[];
  recent: ProductCardDto[];
  filters: ShopFilters;
  products: Paginated<ProductCardDto>;
}) {
  const from = products.total === 0 ? 0 : (products.page - 1) * products.perPage + 1;
  const to = Math.min(products.page * products.perPage, products.total);

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <ShopSidebar
        locale={locale}
        pathname={pathname}
        shopPathname={shopPathname}
        activeCategorySlug={activeCategorySlug}
        categories={categories}
        tags={tags}
        recent={recent}
        filters={filters}
      />
      <div>
        <ShopToolbar
          locale={locale}
          pathname={pathname}
          filters={filters}
          from={from}
          to={to}
          total={products.total}
        />
        {products.items.length ? (
          <ProductGrid
            products={products.items}
            locale={locale}
            appearance="catalog"
            view={filters.view}
          />
        ) : (
          <p className="text-muted-foreground">{pageText(locale, "emptyProducts")}</p>
        )}
        <Pagination
          locale={locale}
          page={products.page}
          totalPages={products.totalPages}
          hrefForPage={(page) => shopHref(pathname, { ...filters, page })}
        />
      </div>
    </div>
  );
}
