import Link from "next/link";

import { chromeText } from "@/components/site/copy";
import { WhatsAppIcon } from "@/components/site/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";

export function QuoteCta({
  locale,
  quoteHref,
  whatsappHref,
  quoteLabel,
}: {
  locale: Locale;
  quoteHref: string;
  whatsappHref: string;
  quoteLabel?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href={quoteHref as never}>{quoteLabel || chromeText(locale, "requestQuote")}</Link>
      </Button>
      {whatsappHref ? (
        <Button asChild variant="outline">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="size-4" />
            {chromeText(locale, "whatsapp")}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
