import { Fragment } from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { isExternalHref } from "@/components/site/nav-utils";
import { breadcrumbList } from "@/lib/seo/json-ld";

export type Crumb = {
  href?: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <div className="mb-8">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 ? <BreadcrumbSeparator className="rtl:rotate-180" /> : null}
                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : isExternalHref(item.href) ? (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href as never}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <JsonLd data={breadcrumbList(items)} />
    </div>
  );
}
