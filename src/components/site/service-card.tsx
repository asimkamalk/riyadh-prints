import Link from "next/link";

import { chromeText } from "@/components/site/copy";
import { formatStartingPrice } from "@/components/site/format";
import { SiteImage } from "@/components/site/site-image";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import type { ServiceCard as ServiceCardDto } from "@/types/content";

export function ServiceCard({
  service,
  locale,
}: {
  service: ServiceCardDto;
  locale: Locale;
}) {
  const quoteHref = `${withLocalePath(locale, "/request-a-quote")}?serviceId=${encodeURIComponent(service.id)}`;
  const price = formatStartingPrice(locale, service.startingPrice);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-elevate-1">
      <Link href={service.href as never} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        {service.image ? (
          <SiteImage
            media={service.image}
            alt={service.image.alt || service.name}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-medium">
          <Link href={service.href as never} className="hover:text-primary">
            {service.name}
          </Link>
        </h3>
        {service.shortDescription ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{service.shortDescription}</p>
        ) : null}
        {price ? <p className="text-sm text-muted-foreground">{price}</p> : null}
        <div className="mt-auto pt-2">
          <Button asChild variant="outline" size="sm">
            <Link href={quoteHref as never}>{chromeText(locale, "getQuote")}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
