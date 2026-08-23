import Link from "next/link";

import { chromeText } from "@/components/site/copy";
import { pageText } from "@/components/site/page-copy";
import { dayLabel, parseHoursDays } from "@/lib/hours";
import { telHref } from "@/lib/whatsapp";
import type { Locale } from "@/i18n/locales";
import type { JsonValue, SiteSettingsDto } from "@/types/content";

export function ContactCards({
  locale,
  settings,
  whatsappHref,
}: {
  locale: Locale;
  settings: SiteSettingsDto;
  whatsappHref: string;
}) {
  const phoneHref = telHref(settings.phone);
  const cards = [
    settings.phone
      ? {
          label: chromeText(locale, "phone"),
          value: settings.phone,
          href: phoneHref || undefined,
        }
      : null,
    settings.email
      ? {
          label: chromeText(locale, "email"),
          value: settings.email,
          href: `mailto:${settings.email}`,
        }
      : null,
    settings.address
      ? { label: chromeText(locale, "location"), value: settings.address, href: undefined }
      : null,
    whatsappHref
      ? {
          label: chromeText(locale, "whatsapp"),
          value: settings.whatsapp || settings.phone,
          href: whatsappHref,
        }
      : null,
  ].filter((card): card is NonNullable<typeof card> => card !== null);

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <li key={card.label} className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          {card.href ? (
            card.href.startsWith("/") ? (
              <Link href={card.href as never} className="mt-1 block font-medium hover:text-primary">
                {card.value}
              </Link>
            ) : (
              <a href={card.href} className="mt-1 block font-medium hover:text-primary">
                {card.value}
              </a>
            )
          ) : (
            <p className="mt-1 font-medium">{card.value}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function HoursCard({ locale, hours, hoursLabel }: { locale: Locale; hours: JsonValue | null; hoursLabel: string }) {
  const days = parseHoursDays(hours);
  return (
    <section className="rounded-xl border p-5">
      <h2 className="text-lg font-medium">{pageText(locale, "hours")}</h2>
      {hoursLabel ? <p className="mt-2 text-sm text-muted-foreground">{hoursLabel}</p> : null}
      {days.length ? (
        <ul className="mt-4 grid gap-2 text-sm">
          {days.map((day) => (
            <li key={day.day} className="flex justify-between gap-4">
              <span>{dayLabel(locale, day.day)}</span>
              <span className="text-muted-foreground">
                {day.closed
                  ? pageText(locale, "closed")
                  : `${day.open} – ${day.close}`}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
