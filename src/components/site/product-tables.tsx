import { chromeText } from "@/components/site/copy";
import { pageText } from "@/components/site/page-copy";
import type { Locale } from "@/i18n/locales";
import type { ProductOptionDto, ProductPriceTierDto } from "@/types/content";
import type { KvRow } from "@/lib/catalogue-json";

export function PriceTiersTable({
  locale,
  tiers,
}: {
  locale: Locale;
  tiers: ProductPriceTierDto[];
}) {
  if (tiers.length === 0) {
    return null;
  }
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{pageText(locale, "priceTiers")}</h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-start">
            <tr>
              <th className="px-4 py-3 font-medium">{pageText(locale, "qty")}</th>
              <th className="px-4 py-3 font-medium">{pageText(locale, "unitPrice")}</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={`${tier.minQty}-${tier.maxQty ?? "plus"}`} className="border-t">
                <td className="px-4 py-3">
                  {tier.maxQty ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`}
                </td>
                <td className="px-4 py-3">
                  {tier.unitPrice} {chromeText(locale, "currency")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function OptionsList({
  locale,
  options,
}: {
  locale: Locale;
  options: ProductOptionDto[];
}) {
  if (options.length === 0) {
    return null;
  }
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{pageText(locale, "options")}</h2>
      <dl className="grid gap-4">
        {options.map((option) => (
          <div key={option.id}>
            <dt className="text-sm font-medium">{option.label}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              {option.values.map((value) => value.label).join(" · ")}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function SpecsTable({ locale, rows }: { locale: Locale; rows: KvRow[] }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{pageText(locale, "specs")}</h2>
      <dl className="grid gap-2 rounded-xl border p-4">
        {rows.map((row) => (
          <div key={`${row.key}-${row.value}`} className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{row.key}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
