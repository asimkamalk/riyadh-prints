"use client";

import type { ReactNode } from "react";

import { pageText } from "@/components/site/page-copy";
import { QuoteCta } from "@/components/site/quote-cta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/i18n/locales";

export function ProductTabs({
  locale,
  description,
  quoteHref,
  whatsappHref,
}: {
  locale: Locale;
  description: ReactNode;
  quoteHref: string;
  whatsappHref: string;
}) {
  return (
    <Tabs defaultValue="description" className="mt-12 gap-0">
      <TabsList
        variant="line"
        className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0"
      >
        <TabsTrigger
          value="description"
          className="rounded-none px-0 pb-3 text-base font-semibold after:bg-primary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
        >
          {pageText(locale, "description")}
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none px-0 pb-3 text-base font-semibold after:bg-primary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
        >
          {pageText(locale, "reviews")} (0)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="mt-8">
        {description}
      </TabsContent>
      <TabsContent value="reviews" className="mt-8 grid max-w-xl gap-4">
        <p className="text-muted-foreground">{pageText(locale, "noReviews")}</p>
        <QuoteCta locale={locale} quoteHref={quoteHref} whatsappHref={whatsappHref} />
      </TabsContent>
    </Tabs>
  );
}
