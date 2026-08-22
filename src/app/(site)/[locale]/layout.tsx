import { notFound } from "next/navigation";

import { isLocale, localeDir, localeLang, type Locale } from "@/i18n/locales";

type SiteLocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): { locale: Locale }[] {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function SiteLocaleLayout({
  children,
  params,
}: SiteLocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div dir={localeDir(locale)} lang={localeLang(locale)} className="min-h-dvh">
      {children}
    </div>
  );
}
