import Link from "next/link";

import { chromeText } from "@/components/site/copy";
import type { Locale } from "@/i18n/locales";

export function LanguageSwitcher({
  locale,
  href,
}: {
  locale: Locale;
  href: string;
}) {
  return (
    <Link
      href={href as never}
      hrefLang={locale === "en" ? "ar" : "en"}
      lang={locale === "en" ? "ar" : "en"}
      className="shrink-0 font-medium underline-offset-4 hover:underline"
      aria-label={chromeText(locale, "switchLanguageAria")}
    >
      {chromeText(locale, "switchLanguage")}
    </Link>
  );
}
