import { chromeText } from "@/components/site/copy";
import type { Locale } from "@/i18n/locales";

export function SkipToContent({ locale }: { locale: Locale }) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      {chromeText(locale, "skipToContent")}
    </a>
  );
}
