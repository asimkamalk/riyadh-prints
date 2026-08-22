import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/utils/site-url";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }
  const locale = rawLocale as Locale;
  const title = "Riyadh Prints";
  const description =
    "Same-day printing in Riyadh — apparel, packaging, banners, and stationery.";

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(withLocalePath(locale, "/")),
      languages: {
        en: absoluteUrl(withLocalePath("en", "/")),
        ar: absoluteUrl(withLocalePath("ar", "/")),
        "x-default": absoluteUrl(withLocalePath("en", "/")),
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  return (
    <main className="container-page py-xl">
      <Breadcrumbs items={[{ href: withLocalePath(rawLocale, "/"), label: "Home" }]} />
      <h1>Riyadh Prints</h1>
    </main>
  );
}
