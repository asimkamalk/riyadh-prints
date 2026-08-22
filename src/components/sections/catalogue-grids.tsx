import { CategoryCard } from "@/components/site/category-card";
import { ProductCard } from "@/components/site/product-card";
import { ServiceCard } from "@/components/site/service-card";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { gridColumnsClass } from "@/lib/sections/layout";
import { asNumber, asRecord, asString } from "@/lib/sections/parse";
import type { SectionRenderProps } from "@/lib/sections/types";

export function UspGridRenderer({ data, settings, headingLevel }: SectionRenderProps) {
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <ul className={`grid gap-6 ${gridColumnsClass(settings, 4)}`}>
        {items.map((raw, index) => {
          const item = asRecord(raw);
          return (
            <li key={`${asString(item.title)}-${index}`} className="rounded-xl border bg-card p-5">
              <p className="font-medium">{asString(item.title)}</p>
              {asString(item.body) ? <p className="mt-2 text-sm text-muted-foreground">{asString(item.body)}</p> : null}
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
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      />
      <ul className={`grid gap-4 ${gridColumnsClass({ columns: 5 }, 5)}`}>
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
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
