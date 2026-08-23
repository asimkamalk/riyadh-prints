import { headers } from "next/headers";

import { JsonLd } from "@/components/seo/json-ld";
import { isLocale } from "@/i18n/locales";
import { localBusiness, organization, website } from "@/lib/seo/json-ld";
import { getSiteSettings } from "@/server/queries";

export async function SiteGraphJsonLd() {
  const headerList = await headers();
  const raw = headerList.get("x-locale") ?? "en";
  const locale = isLocale(raw) ? raw : "en";
  const settings = await getSiteSettings(locale);
  return (
    <JsonLd data={[organization(settings), localBusiness(settings), website(settings, locale)]} />
  );
}
