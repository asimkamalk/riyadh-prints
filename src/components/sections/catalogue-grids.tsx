import { AboutBulletList, AboutCta, AboutDecor, AboutEyebrow } from "@/components/sections/about-layouts";
import { CategoryCard } from "@/components/site/category-card";
import { ProductCard } from "@/components/site/product-card";
import { ServiceCard } from "@/components/site/service-card";
import { SectionHeading, SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { gridColumnsClass } from "@/lib/sections/layout";
import { asNumber, asRecord, asString } from "@/lib/sections/parse";
import type { SectionRenderProps } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function UspGridRenderer({ data, settings, headingLevel }: SectionRenderProps) {
  const items = Array.isArray(data.items) ? data.items : [];
  const appearance = asString(settings.appearance, "cards");
  if (appearance === "split") {
    return (
      <SectionShell settings={settings}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <AboutDecor className="min-h-80 lg:min-h-[26rem]" />
          <div className="grid gap-4">
            <AboutEyebrow>{dataString(data, "eyebrow")}</AboutEyebrow>
            {dataString(data, "heading") ? (
              <SectionHeading level={headingLevel}>{dataString(data, "heading")}</SectionHeading>
            ) : null}
            {dataString(data, "body") ? (
              <p className="text-lg text-muted-foreground">{dataString(data, "body")}</p>
            ) : null}
            {items.length ? <AboutBulletList items={items} /> : null}
            <AboutCta href={dataString(data, "href")} label={dataString(data, "cta")} />
          </div>
        </div>
      </SectionShell>
    );
  }
  return (
    <SectionShell settings={settings}>
      <SectionIntro
        heading={dataString(data, "heading")}
        headingLevel={headingLevel}
        settings={settings}
      />
      <ul className={`grid gap-6 ${gridColumnsClass(settings, 4)}`}>
        {items.map((raw, index) => {
          const item = asRecord(raw);
          return (
            <li
              key={`${asString(item.title)}-${index}`}
              className={cn(
                appearance === "bar" && "grid gap-1 text-center",
                appearance === "numbered" && "relative rounded-2xl border bg-card p-6 pt-8 shadow-xs",
                appearance === "cards" && "rounded-2xl border bg-card p-5 shadow-xs",
              )}
            >
              {appearance === "numbered" ? (
                <span className="absolute start-5 top-0 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
              ) : null}
              <p className="font-semibold">{asString(item.title)}</p>
              {asString(item.body) ? (
                <p className="mt-2 text-sm text-muted-foreground">{asString(item.body)}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

export function ServiceGridRenderer({ data, settings, headingLevel, resolved, locale }: SectionRenderProps) {
  const limit = asNumber(settings.limit, 6);
  const featuredOnly = settings.featuredOnly !== false;
  const services = resolved.services
    .filter((service) => (featuredOnly ? service.isFeatured : true))
    .slice(0, limit);
  return (
    <SectionShell settings={settings}>
      <SectionIntro
        heading={dataString(data, "heading")}
        subheading={dataString(data, "subheading")}
        headingLevel={headingLevel}
        settings={settings}
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <li key={service.id}>
            <ServiceCard service={service} locale={locale} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function CategoryGridRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  const limit = asNumber(settings.limit, 15);
  const categories = flattenCategories(resolved.categories).slice(0, limit);
  return (
    <SectionShell settings={settings}>
      <SectionIntro
        heading={dataString(data, "heading")}
        subheading={dataString(data, "subheading")}
        headingLevel={headingLevel}
        settings={settings}
      />
      <ul className={`grid gap-4 ${gridColumnsClass({ columns: 4 }, 4)}`}>
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} variant="overlay" />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function FeaturedProductsRenderer({ data, settings, headingLevel, resolved, locale }: SectionRenderProps) {
  const limit = asNumber(settings.limit, 8);
  const products = resolved.products.slice(0, limit);
  return (
    <SectionShell settings={settings}>
      <SectionIntro
        heading={dataString(data, "heading")}
        subheading={dataString(data, "subheading")}
        headingLevel={headingLevel}
        settings={settings}
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} locale={locale} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function flattenCategories(
  nodes: SectionRenderProps["resolved"]["categories"],
): SectionRenderProps["resolved"]["categories"] {
  const out: SectionRenderProps["resolved"]["categories"] = [];
  for (const node of nodes) {
    out.push(node);
    if (node.children.length) {
      out.push(...flattenCategories(node.children));
    }
  }
  return out;
}
