"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createPreviewUrl } from "@/server/actions/preview";
import type { Locale } from "@/i18n/locales";

export function SectionPreviewPane({
  pageId,
  nonce,
}: {
  pageId: string;
  nonce: number;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createPreviewUrl({ type: "page", id: pageId, locale, variant: "frame" }).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok) {
        const url = new URL(result.data.url, window.location.origin);
        url.searchParams.set("v", String(nonce));
        setSrc(`${url.pathname}${url.search}`);
      } else {
        setSrc(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale, nonce, pageId]);

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={locale === "en" ? "default" : "outline"} onClick={() => setLocale("en")}>
          EN
        </Button>
        <Button type="button" size="sm" variant={locale === "ar" ? "default" : "outline"} onClick={() => setLocale("ar")}>
          AR
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border bg-background">
        {src ? (
          <iframe
            title="Live page preview"
            src={src}
            className="h-[32rem] w-full bg-background"
          />
        ) : (
          <div className="grid h-[32rem] place-items-center text-sm text-muted-foreground">
            Preview unavailable.
          </div>
        )}
      </div>
    </div>
  );
}
