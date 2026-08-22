import Image from "next/image";

import { MenuLink } from "@/components/site/menu-link";
import type { MenuItemDto } from "@/types/content";

export function MegaMenuPanel({ items }: { items: MenuItemDto[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="rounded-xl border bg-popover p-4 text-popover-foreground shadow-elevate-2">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <MenuLink
              href={item.href}
              openInNewTab={item.openInNewTab}
              className="flex gap-3 rounded-lg p-2 hover:bg-muted hover:text-foreground"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.image ? (
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.label}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.label}</span>
                {item.description ? (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </MenuLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
