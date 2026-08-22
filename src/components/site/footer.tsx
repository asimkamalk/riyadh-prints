import { Mail, MapPin } from "lucide-react";

import { BackToTop } from "@/components/site/back-to-top";
import { chromeText } from "@/components/site/copy";
import { WhatsAppIcon } from "@/components/site/icons";
import { MenuLink } from "@/components/site/menu-link";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { SiteLogo } from "@/components/site/site-logo";
import { SocialLinks } from "@/components/site/social-links";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { telHref, whatsappUrl } from "@/lib/whatsapp";
import type { MenuItemDto, SiteSettingsDto } from "@/types/content";

export function SiteFooter({
  locale,
  settings,
  information,
  usefulLinks,
  aboutUs,
}: {
  locale: Locale;
  settings: SiteSettingsDto;
  information: MenuItemDto[];
  usefulLinks: MenuItemDto[];
  aboutUs: MenuItemDto[];
}) {
  const year = new Date().getFullYear();
  const wa = whatsappUrl(settings.whatsapp || settings.phone, settings.whatsappDefaultMessage);
  const maps = settings.mapsUrl || settings.location?.googleMapsUrl || "";

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-4">
          <SiteLogo href={withLocalePath(locale, "/")} companyName={settings.companyName} />
          {settings.tagline ? (
            <p className="max-w-sm text-sm text-muted-foreground">{settings.tagline}</p>
          ) : null}
          <SocialLinks locale={locale} social={settings.social} />
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-3">
          <FooterColumn title={chromeText(locale, "information")} items={information} />
          <FooterColumn title={chromeText(locale, "usefulLinks")} items={usefulLinks} />
          <FooterColumn title={chromeText(locale, "aboutUs")} items={aboutUs} />
        </div>
        <div className="grid gap-6 lg:col-span-3">
          <div className="grid gap-2 text-sm">
            <p className="font-medium">{chromeText(locale, "getInTouch")}</p>
            {maps ? (
              <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:underline">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{settings.address || chromeText(locale, "location")}</span>
              </a>
            ) : null}
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 hover:underline">
                <Mail className="size-4 shrink-0" />
                {settings.email}
              </a>
            ) : null}
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <WhatsAppIcon className="size-4 shrink-0" />
                {settings.whatsapp || settings.phone || chromeText(locale, "whatsapp")}
              </a>
            ) : settings.phone ? (
              <a href={telHref(settings.phone)} className="hover:underline">
                {settings.phone}
              </a>
            ) : null}
          </div>
          <NewsletterForm locale={locale} />
        </div>
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-3 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {year} {settings.companyName}. {chromeText(locale, "copyright")}
          </p>
          <p className="sm:ms-auto">{chromeText(locale, "trustLine")}</p>
          <a href="#top" className="hover:text-foreground hover:underline">
            {chromeText(locale, "backToTop")}
          </a>
        </div>
      </div>
      <BackToTop locale={locale} />
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: MenuItemDto[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div>
      <p className="mb-3 font-medium">{title}</p>
      <ul className="grid gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <MenuLink href={item.href} openInNewTab={item.openInNewTab}>
              {item.label}
            </MenuLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
