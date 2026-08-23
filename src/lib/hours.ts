import type { Locale } from "@/i18n/locales";
import { asBoolean, asRecord, asString } from "@/lib/sections/parse";

export type HoursDay = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

const DAY_LABELS: Record<string, { en: string; ar: string }> = {
  saturday: { en: "Saturday", ar: "السبت" },
  sunday: { en: "Sunday", ar: "الأحد" },
  monday: { en: "Monday", ar: "الاثنين" },
  tuesday: { en: "Tuesday", ar: "الثلاثاء" },
  wednesday: { en: "Wednesday", ar: "الأربعاء" },
  thursday: { en: "Thursday", ar: "الخميس" },
  friday: { en: "Friday", ar: "الجمعة" },
};

export function dayLabel(locale: Locale, day: string): string {
  const key = day.trim().toLowerCase();
  return DAY_LABELS[key]?.[locale] ?? day;
}

export function parseHoursDays(value: unknown): HoursDay[] {
  const record = asRecord(value);
  if (!Array.isArray(record.days)) {
    return [];
  }
  return record.days.flatMap((row) => {
    const item = asRecord(row);
    const day = asString(item.day);
    if (!day) {
      return [];
    }
    return [
      {
        day,
        open: asString(item.open),
        close: asString(item.close),
        closed: asBoolean(item.closed, false),
      },
    ];
  });
}
