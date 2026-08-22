import { Mail, MapPin, Phone } from "lucide-react";

import { chromeText } from "@/components/site/copy";
import { WhatsAppIcon } from "@/components/site/icons";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import type { Locale } from "@/i18n/locales";
import { telHref, whatsappUrl } from "@/lib/whatsapp";
import type { SiteSettingsDto } from "@/types/content";

export function TopBar({
  locale,
  settings,
  alternateHref,
}: {
  locale: Locale;
  settings: SiteSettingsDto;
  alternateHref: string;
}) {
  const wa = whatsappUrl(settings.whatsapp || settings.phone, settings.whatsappDefaultMessage);
  const phone = telHref(settings.phone);
  const maps = settings.mapsUrl || settings.location?.googleMapsUrl || "";

  return (
    <div className="bg-brand-950 text-white">
      <div className="container-page flex items-center gap-3 py-1.5 text-xs">
        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
          {wa ? (
            <li>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <WhatsAppIcon className="size-3.5" />
                {chromeText(locale, "whatsapp")}
              </a>
            </li>
          ) : null}
          {settings.email ? (
            <li className="hidden sm:block">
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <Mail className="size-3.5" />
                {settings.email}
              </a>
            </li>
          ) : null}
          {phone ? (
            <li className="hidden md:block">
              <a href={phone} className="inline-flex items-center gap-1.5 hover:underline">
                <Phone className="size-3.5" />
                {settings.phone}
              </a>
            </li>
          ) : null}
          {maps ? (
            <li className="hidden lg:block">
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <MapPin className="size-3.5" />
                {chromeText(locale, "location")}
              </a>
            </li>
          ) : null}
        </ul>
        <LanguageSwitcher locale={locale} href={alternateHref} />
      </div>
    </div>
  );
}
