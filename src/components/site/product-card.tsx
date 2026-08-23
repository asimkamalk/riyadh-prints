import Link from "next/link";

import { chromeText } from "@/components/site/copy";
import { formatStartingPrice } from "@/components/site/format";
import { SiteImage } from "@/components/site/site-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardDto } from "@/types/content";

export type ProductCardAppearance = "storefront" | "catalog" | "row";

export function ProductCard({
  product,
  locale,
  appearance = "storefront",
  priority = false,
}: {
  product: ProductCardDto;
  locale: Locale;
  appearance?: ProductCardAppearance;
  priority?: boolean;
}) {
  const quoteHref = `${withLocalePath(locale, "/request-a-quote")}?productId=${encodeURIComponent(product.id)}`;
  const price = formatStartingPrice(locale, product.basePrice, product.priceUnit);
  const alt = product.primaryImage?.alt || product.name;
  const image = product.primaryImage ? (
    <SiteImage
      media={product.primaryImage}
      alt={alt}
      sizes={appearance === "row" ? "160px" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
      priority={priority}
      className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
    />
  ) : null;

  if (appearance === "row") {
    return (
      <article className="group flex gap-5">
        <Link
          href={product.href as never}
          className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-36"
        >
          {image}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <h3 className="text-base font-semibold leading-snug">
            <Link href={product.href as never} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
          {product.shortDescription ? (
            <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
          ) : null}
          <div>
            <Link href={quoteHref as never} className="text-sm font-medium text-primary hover:underline">
              {chromeText(locale, "getQuote")}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  const catalog = appearance === "catalog";

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={product.href as never}
        className={cn(
          "relative block overflow-hidden bg-muted",
          catalog ? "rounded-xl" : "rounded-3xl p-3",
        )}
      >
        <span className={cn("relative block aspect-square overflow-hidden bg-muted", !catalog && "rounded-2xl")}>
          {image}
        </span>
        {!catalog && product.sameDayAvailable ? (
          <Badge className="absolute start-3 top-3 bg-accent text-accent-foreground">
            {chromeText(locale, "sameDay")}
          </Badge>
        ) : null}
      </Link>
      <div className={cn("flex flex-1 flex-col gap-2 pt-4", !catalog && "px-1")}>
        <h3 className="text-base font-semibold leading-snug">
          <Link href={product.href as never} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {catalog ? null : (
          <>
            {price ? <p className="text-sm text-muted-foreground">{price}</p> : null}
            <div className="mt-auto pt-1">
              <Button asChild variant="accent" size="sm" className="rounded-full">
                <Link href={quoteHref as never}>{chromeText(locale, "getQuote")}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
