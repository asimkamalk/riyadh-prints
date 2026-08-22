import { chromeText } from "@/components/site/copy";
import { paginationWindow } from "@/components/site/pagination-utils";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

export type PaginationProps = {
  locale: Locale;
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export type SitePaginationProps = PaginationProps;

export function Pagination({ locale, page, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  const items = paginationWindow(page, totalPages);
  const prev = page > 1 ? hrefForPage(page - 1) : null;
  const next = page < totalPages ? hrefForPage(page + 1) : null;

  return (
    <nav aria-label={chromeText(locale, "pagination")} className="mt-10">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {prev ? (
            <a
              href={prev}
              rel="prev"
              className={pageLinkClass()}
              aria-label={chromeText(locale, "previousPage")}
            >
              <span aria-hidden className="rtl:inline-block rtl:rotate-180">
                ‹
              </span>
              <span className="hidden sm:inline">{chromeText(locale, "previousPage")}</span>
            </a>
          ) : (
            <span className={pageLinkClass(true)}>{chromeText(locale, "previousPage")}</span>
          )}
        </li>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li key={`e-${index}`} className="px-2 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={item}>
              <a
                href={hrefForPage(item)}
                aria-label={`${chromeText(locale, "pageOf")} ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={pageLinkClass(false, item === page)}
              >
                {item}
              </a>
            </li>
          ),
        )}
        <li>
          {next ? (
            <a
              href={next}
              rel="next"
              className={pageLinkClass()}
              aria-label={chromeText(locale, "nextPage")}
            >
              <span className="hidden sm:inline">{chromeText(locale, "nextPage")}</span>
              <span aria-hidden className="rtl:inline-block rtl:rotate-180">
                ›
              </span>
            </a>
          ) : (
            <span className={pageLinkClass(true)}>{chromeText(locale, "nextPage")}</span>
          )}
        </li>
      </ul>
    </nav>
  );
}

export { Pagination as SitePagination };
export { pageSearchHref, paginationWindow } from "@/components/site/pagination-utils";

function pageLinkClass(disabled = false, active = false): string {
  return cn(
    "inline-flex min-w-9 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-sm",
    active && "border bg-background font-medium",
    !active && !disabled && "hover:bg-muted",
    disabled && "pointer-events-none opacity-40",
  );
}
