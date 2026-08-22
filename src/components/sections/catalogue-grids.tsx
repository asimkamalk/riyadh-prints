import Image from "next/image";
import Link from "next/link";

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

export function ServiceGridRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
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
            <Link href={service.href as never} className="block rounded-xl border p-5 hover:bg-muted/40">
              <p className="font-medium">{service.name}</p>
              {service.shortDescription ? (
                <p className="mt-2 text-sm text-muted-foreground">{service.shortDescription}</p>
              ) : null}
            </Link>
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
            <Link
              href={category.href as never}
              className="flex min-h-24 items-center justify-center rounded-xl border px-3 py-4 text-center text-sm font-medium hover:bg-muted/40"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function FeaturedProductsRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
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
          <li key={product.id} className="overflow-hidden rounded-xl border">
            <Link href={product.href as never} className="block">
              <div className="relative aspect-square bg-muted">
                {product.primaryImage ? (
                  <Image
                    src={product.primaryImage.url}
                    alt={product.primaryImage.alt || product.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                ) : null}
              </div>
              <div className="grid gap-1 p-4">
                <p className="font-medium">{product.name}</p>
                {product.basePrice ? (
                  <p className="text-sm text-muted-foreground">From {product.basePrice} SAR</p>
                ) : null}
              </div>
            </Link>
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
