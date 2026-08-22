"use client";

import { Copy } from "lucide-react";

import type { Locale } from "@/i18n/locales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type LocaleTabsProps = {
  mode?: "tabs" | "split";
  english: React.ReactNode;
  arabic: React.ReactNode;
  arabicTranslated?: boolean;
  onCopyFromEnglish?: () => void;
};

export function LocaleTabs({
  mode = "tabs",
  english,
  arabic,
  arabicTranslated = true,
  onCopyFromEnglish,
}: LocaleTabsProps) {
  if (mode === "split") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <LocalePane locale="en" translated>
          {english}
        </LocalePane>
        <LocalePane
          locale="ar"
          translated={arabicTranslated}
          onCopyFromEnglish={onCopyFromEnglish}
        >
          {arabic}
        </LocalePane>
      </div>
    );
  }

  return (
    <Tabs defaultValue="en">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="ar">
            Arabic
            {arabicTranslated ? null : (
              <Badge variant="outline" className="ms-1">
                Not yet translated
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        {onCopyFromEnglish ? (
          <Button type="button" size="sm" variant="outline" onClick={onCopyFromEnglish}>
            <Copy className="size-3.5" />
            Copy from English
          </Button>
        ) : null}
      </div>
      <TabsContent value="en">{english}</TabsContent>
      <TabsContent value="ar" dir="rtl" lang="ar">
        {arabic}
      </TabsContent>
    </Tabs>
  );
}

function LocalePane({
  locale,
  translated,
  onCopyFromEnglish,
  children,
}: {
  locale: Locale;
  translated: boolean;
  onCopyFromEnglish?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("rounded-lg border p-4", !translated && "border-dashed")}
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale === "ar" ? "ar" : "en"}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{locale === "en" ? "English" : "Arabic"}</p>
        {locale === "ar" && !translated ? (
          <Badge variant="outline">Not yet translated</Badge>
        ) : null}
        {locale === "ar" && onCopyFromEnglish ? (
          <Button type="button" size="xs" variant="outline" onClick={onCopyFromEnglish}>
            <Copy className="size-3" />
            Copy from English
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
