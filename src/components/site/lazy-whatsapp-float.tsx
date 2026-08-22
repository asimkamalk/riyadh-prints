"use client";

import { useEffect, useState } from "react";

import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import type { Locale } from "@/i18n/locales";

export function LazyWhatsAppFloat({ href, locale }: { href: string; locale: Locale }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <span className="pointer-events-none fixed end-4 bottom-4 z-30 size-12" aria-hidden />
    );
  }

  return <WhatsAppFloat href={href} locale={locale} />;
}
