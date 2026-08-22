import { chromeText } from "@/components/site/copy";
import { MegaMenu } from "@/components/site/mega-menu";
import { MegaMenuPanel } from "@/components/site/mega-menu-panel";
import { MenuLink } from "@/components/site/menu-link";
import type { Locale } from "@/i18n/locales";
import type { MenuItemDto } from "@/types/content";

export function MainNav({ locale, items }: { locale: Locale; items: MenuItemDto[] }) {
  return (
    <nav aria-label={chromeText(locale, "primaryNav")} className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) =>
          item.isMegaMenu && item.children.length > 0 ? (
            <MegaMenu
              key={item.id}
              label={item.label}
              href={item.href}
              openInNewTab={item.openInNewTab}
              submenuLabel={chromeText(locale, "submenu")}
            >
              <MegaMenuPanel items={item.children} />
            </MegaMenu>
          ) : (
            <li key={item.id}>
              <MenuLink
                href={item.href}
                openInNewTab={item.openInNewTab}
                className="px-2 py-1 text-sm font-medium"
              >
                {item.label}
              </MenuLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
