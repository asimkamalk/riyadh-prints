"use client";

import { chromeText } from "@/components/site/copy";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/i18n/locales";

export type QuoteOption = { id: string; name: string };

export function QuoteField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function QuoteSelect({
  id,
  locale,
  options,
  ...props
}: {
  id: string;
  locale: Locale;
  options: QuoteOption[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={id}
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
      {...props}
    >
      <option value="">{chromeText(locale, "quoteSelect")}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
