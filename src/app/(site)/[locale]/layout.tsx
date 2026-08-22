import { notFound } from "next/navigation";

import { DocumentLocale } from "@/components/site/document-locale";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { LazyWhatsAppFloat } from "@/components/site/lazy-whatsapp-float";
import { SkipToContent } from "@/components/site/skip-to-content";
import { isLocale, localeDir, localeLang, type Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  getAlternateLocaleHref,
  getMenu,
  getPublicPathname,
  getSiteSettings,
} from "@/server/queries";

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
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw;
  const [settings, headerMenu, footerInfo, footerLinks, footerAbout, pathname] =
    await Promise.all([
      getSiteSettings(locale),
      getMenu("HEADER", locale),
      getMenu("FOOTER_INFO", locale),
      getMenu("FOOTER_LINKS", locale),
      getMenu("FOOTER_ABOUT", locale),
      getPublicPathname(),
    ]);
  const alternateHref = await getAlternateLocaleHref(pathname, locale);
  const waHref = whatsappUrl(
    settings.whatsapp || settings.phone,
    settings.whatsappDefaultMessage,
  );

  return (
    <div
      dir={localeDir(locale)}
      lang={localeLang(locale)}
      className={cn("flex min-h-dvh flex-col", locale === "ar" && "font-arabic")}
    >
      <DocumentLocale locale={locale} />
      <SkipToContent locale={locale} />
      <div id="top" tabIndex={-1} className="h-px w-full outline-none" />
      <SiteHeader
        locale={locale}
        settings={settings}
        items={headerMenu}
        alternateHref={alternateHref}
      />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter
        locale={locale}
        settings={settings}
        information={footerInfo}
        usefulLinks={footerLinks}
        aboutUs={footerAbout}
      />
      {waHref ? <LazyWhatsAppFloat locale={locale} href={waHref} /> : null}
    </div>
  );
}
