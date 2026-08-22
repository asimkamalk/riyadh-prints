import Link from "next/link";

import { chromeText } from "@/components/site/copy";
import { formatStartingPrice } from "@/components/site/format";
import { SiteImage } from "@/components/site/site-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import type { ProductCard as ProductCardDto } from "@/types/content";

export function ProductCard({
  product,
  locale,
}: {
  product: ProductCardDto;
  locale: Locale;
}) {
  const quoteHref = `${withLocalePath(locale, "/request-a-quote")}?productId=${encodeURIComponent(product.id)}`;
  const price = formatStartingPrice(locale, product.basePrice, product.priceUnit);
  const alt = product.primaryImage?.alt || product.name;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-elevate-1">
      <Link href={product.href as never} className="relative block aspect-square overflow-hidden bg-muted">
        {product.primaryImage ? (
          <SiteImage
            media={product.primaryImage}
            alt={alt}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
          />
        ) : null}
        {product.sameDayAvailable ? (
          <Badge className="absolute start-3 top-3 bg-accent text-accent-foreground">
            {chromeText(locale, "sameDay")}
          </Badge>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category ? (
          <p className="text-xs text-muted-foreground">{product.category.name}</p>
        ) : null}
        <h3 className="text-base font-medium leading-snug">
          <Link href={product.href as never} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {price ? <p className="text-sm text-muted-foreground">{price}</p> : null}
        <div className="mt-auto pt-2">
          <Button asChild variant="accent" size="sm" className="w-full">
            <Link href={quoteHref as never}>{chromeText(locale, "getQuote")}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
