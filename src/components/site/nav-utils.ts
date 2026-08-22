import { withLocalePath } from "@/i18n/routing";
import type { Locale } from "@/i18n/locales";
import type { MenuItemDto } from "@/types/content";

export function withoutHighlights(items: MenuItemDto[]): MenuItemDto[] {
  return items.filter((item) => !item.highlight);
}

export function quoteHrefFromMenu(items: MenuItemDto[], locale: Locale): string {
  return (
    items.find((item) => item.highlight)?.href ??
    withLocalePath(locale, "/request-a-quote")
  );
}

export function isExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}
