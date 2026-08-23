import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CategoryGrid } from "@/components/site/content-grids";
import { pageText } from "@/components/site/page-copy";
import { QuoteCta } from "@/components/site/quote-cta";
import { SiteSearchForm } from "@/components/site/site-search-form";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { buildMetadata, homeCrumb } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import { getCategoryTree, getSiteSettings } from "@/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  return buildMetadata({
    locale,
    path: "/404",
    derivedTitle: pageText(locale, "notFound"),
    derivedDescription: pageText(locale, "notFoundIntro"),
    noIndex: true,
    noFollow: true,
  });
}

export default async function NotFoundPage() {
  const locale = await requestLocale();
  const [settings, categories] = await Promise.all([
    getSiteSettings(locale),
    getCategoryTree(locale, "PRODUCT"),
  ]);
  const popular = categories.filter((item) => item.isFeatured).slice(0, 6);
  const cards = popular.length ? popular : categories.slice(0, 6);
  const whatsappHref = whatsappUrl(settings.whatsapp || settings.phone, settings.whatsappDefaultMessage);

  return (
    <div className="container-page py-xl">
      <Breadcrumbs items={[homeCrumb(locale), { label: pageText(locale, "notFound") }]} />
      <h1 className="text-3xl font-semibold tracking-tight">{pageText(locale, "notFound")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{pageText(locale, "notFoundIntro")}</p>
      <div className="mt-8">
        <SiteSearchForm locale={locale} />
      </div>
      <div className="mt-8">
        <QuoteCta
          locale={locale}
          quoteHref={withLocalePath(locale, "/request-a-quote")}
          whatsappHref={whatsappHref}
        />
      </div>
      {cards.length ? (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold">{pageText(locale, "popularCategories")}</h2>
          <CategoryGrid categories={cards} />
        </section>
      ) : null}
      <p className="mt-10">
        <Link href={withLocalePath(locale, "/") as never} className="text-primary hover:underline">
          {locale === "ar" ? "الرئيسية" : "Home"}
        </Link>
      </p>
    </div>
  );
}

async function requestLocale(): Promise<Locale> {
  const headerList = await headers();
  const raw = headerList.get("x-locale") ?? "en";
  return isLocale(raw) ? raw : "en";
}
