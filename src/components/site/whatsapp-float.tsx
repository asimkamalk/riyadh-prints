"use client";

import { chromeText } from "@/components/site/copy";
import { WhatsAppIcon } from "@/components/site/icons";
import type { Locale } from "@/i18n/locales";

export function WhatsAppFloat({ href, locale }: { href: string; locale: Locale }) {
  if (!href) {
    return null;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed end-4 bottom-4 z-30 inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevate-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={chromeText(locale, "whatsappFloat")}
    >
      <WhatsAppIcon className="size-6" />
    </a>
  );
}
