"use client";

import { usePathname } from "next/navigation";

import { pageText } from "@/components/site/page-copy";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale: Locale = pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";

  return (
    <div className="container-page py-xl">
      <h1 className="text-3xl font-semibold tracking-tight">{pageText(locale, "errorTitle")}</h1>
      <p className="mt-4">
        <Button type="button" onClick={() => reset()}>
          {pageText(locale, "tryAgain")}
        </Button>
      </p>
    </div>
  );
}
