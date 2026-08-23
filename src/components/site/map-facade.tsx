"use client";

import { useState } from "react";

import { pageText } from "@/components/site/page-copy";
import type { Locale } from "@/i18n/locales";

export function MapFacade({
  locale,
  embedSrc,
  address,
}: {
  locale: Locale;
  embedSrc: string;
  address: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
      {open ? (
        <iframe
          title={pageText(locale, "mapLabel")}
          src={embedSrc}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="absolute inset-0 grid place-items-center gap-2 p-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setOpen(true)}
        >
          <span className="text-sm text-muted-foreground">{address}</span>
          <span className="rounded-md bg-background px-4 py-2 text-sm font-medium shadow-xs">
            {pageText(locale, "loadMap")}
          </span>
        </button>
      )}
    </div>
  );
}
