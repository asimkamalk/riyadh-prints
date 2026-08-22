import { chromeText } from "@/components/site/copy";
import type { Locale } from "@/i18n/locales";

export function formatStartingPrice(
  locale: Locale,
  amount: string | null,
  unit?: string | null,
): string | null {
  if (!amount) {
    return null;
  }
  const trimmed = amount.replace(/\.00$/, "");
  const base = `${chromeText(locale, "fromPrice")} ${trimmed} ${chromeText(locale, "currency")}`;
  return unit ? `${base} / ${unit}` : base;
}

export function parseStatNumber(value: string): number | null {
  const numeric = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

export function formatStatNumber(value: number, template: string): string {
  if (template.includes(",")) {
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  }
  if (template.includes(".")) {
    const decimals = template.split(".")[1]?.length ?? 0;
    return value.toFixed(decimals);
  }
  return String(Math.round(value));
}
