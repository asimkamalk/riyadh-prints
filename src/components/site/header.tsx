import Link from "next/link";

import { chromeText } from "@/components/site/copy";
import { HeaderChrome } from "@/components/site/header-chrome";
import { MainNav } from "@/components/site/main-nav";
import { MobileNav } from "@/components/site/mobile-nav";
import { quoteHrefFromMenu, withoutHighlights } from "@/components/site/nav-utils";
import { SearchTrigger } from "@/components/site/search-trigger";
import { SiteLogo } from "@/components/site/site-logo";
import { TopBar } from "@/components/site/top-bar";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import type { MenuItemDto, SiteSettingsDto } from "@/types/content";

export function SiteHeader({
  locale,
  settings,
  items,
  alternateHref,
}: {
  locale: Locale;
  settings: SiteSettingsDto;
  items: MenuItemDto[];
  alternateHref: string;
}) {
  const navItems = withoutHighlights(items);
  const quoteHref = quoteHrefFromMenu(items, locale);
  const homeHref = withLocalePath(locale, "/");

  return (
    <HeaderChrome>
      <TopBar locale={locale} settings={settings} alternateHref={alternateHref} />
      <div className="border-b">
        <div className="container-page flex h-16 items-center gap-3">
          <SiteLogo href={homeHref} companyName={settings.companyName} priority />
          <div className="ms-auto flex items-center gap-1 lg:ms-8 lg:flex-1">
            <MainNav locale={locale} items={navItems} />
            <div className="ms-auto flex items-center gap-1">
              <SearchTrigger locale={locale} />
              <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
                <Link href={quoteHref as never}>{chromeText(locale, "requestQuote")}</Link>
              </Button>
              <MobileNav
                locale={locale}
                items={navItems}
                quoteHref={quoteHref}
                companyName={settings.companyName}
              />
            </div>
          </div>
        </div>
      </div>
    </HeaderChrome>
  );
}
