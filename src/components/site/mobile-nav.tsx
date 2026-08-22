"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { chromeText } from "@/components/site/copy";
import { MenuLink } from "@/components/site/menu-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Locale } from "@/i18n/locales";
import type { MenuItemDto } from "@/types/content";

export function MobileNav({
  locale,
  items,
  quoteHref,
  companyName,
}: {
  locale: Locale;
  items: MenuItemDto[];
  quoteHref: string;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={chromeText(locale, "openMenu")}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={locale === "ar" ? "left" : "right"} className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{companyName}</SheetTitle>
          <SheetDescription className="sr-only">
            {chromeText(locale, "primaryNav")}
          </SheetDescription>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-4" aria-label={chromeText(locale, "primaryNav")}>
          <Accordion type="single" collapsible>
            {items.map((item) =>
              item.children.length > 0 ? (
                <AccordionItem key={item.id} value={item.id}>
                  <div className="flex items-center">
                    <MenuLink
                      href={item.href}
                      openInNewTab={item.openInNewTab}
                      className="flex-1 py-3 text-start text-sm font-medium"
                      onClick={close}
                    >
                      {item.label}
                    </MenuLink>
                    <AccordionTrigger
                      className="grow-0 py-3 pe-0"
                      aria-label={chromeText(locale, "submenu")}
                    >
                      <span className="sr-only">{item.label}</span>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent>
                    <ul className="grid gap-1 ps-3">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <MenuLink
                            href={child.href}
                            openInNewTab={child.openInNewTab}
                            className="block py-2 text-sm"
                            onClick={close}
                          >
                            {child.label}
                          </MenuLink>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div key={item.id} className="border-b">
                  <MenuLink
                    href={item.href}
                    openInNewTab={item.openInNewTab}
                    className="block py-3 text-sm font-medium"
                    onClick={close}
                  >
                    {item.label}
                  </MenuLink>
                </div>
              ),
            )}
          </Accordion>
        </nav>
        <SheetFooter>
          <Button asChild variant="accent" className="w-full">
            <Link href={quoteHref as never} onClick={close}>
              {chromeText(locale, "requestQuote")}
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
