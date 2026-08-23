import { chromeText } from "@/components/site/copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";

export function SiteSearchForm({
  locale,
  defaultQuery = "",
}: {
  locale: Locale;
  defaultQuery?: string;
}) {
  return (
    <form
      action={withLocalePath(locale, "/search")}
      method="get"
      className="flex max-w-xl flex-col gap-2 sm:flex-row"
    >
      <Input
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder={chromeText(locale, "searchPlaceholder")}
        aria-label={chromeText(locale, "search")}
      />
      <Button type="submit">{chromeText(locale, "search")}</Button>
    </form>
  );
}
