import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentShowcase } from "./component-showcase";
import { ProseShowcase } from "./prose-showcase";
import { TokenShowcase } from "./token-showcase";
import { TypeShowcase } from "./type-showcase";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { isLocale, type Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";

type DesignSystemPageProps = {
  params: Promise<{ locale: string }>;
};

function localePath(locale: Locale, path: string): string {
  return withLocalePath(locale, path);
}

export async function generateMetadata({
  params,
}: DesignSystemPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }

  return buildMetadata({
    locale: rawLocale,
    path: "/design-system",
    title: "Design system",
    description:
      "Internal visual reference for Riyadh Prints tokens, type, and components. Delete before launch.",
    noIndex: true,
    noFollow: true,
  });
}

export default async function DesignSystemPage({ params }: DesignSystemPageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const path = localePath(rawLocale, "/design-system");

  return (
    <div className="container-page py-xl">
      <Breadcrumbs
        items={[
          { href: withLocalePath(rawLocale, "/"), label: "Home" },
          { href: path, label: "Design system" },
        ]}
      />
      <p className="mb-sm text-sm font-medium text-brand-700 dark:text-brand-300">
        Internal reference — delete this route before launch.
      </p>
      <h1 className="mb-md">Design system</h1>
      <p className="mb-xl max-w-prose text-muted-foreground">
        Tokens, type, buttons, and cards for Riyadh Prints. English is LTR; the
        second column is forced RTL so both scripts can be checked on one page.
      </p>
      <TokenShowcase />
      <ComponentShowcase />
      <div className="grid gap-xl lg:grid-cols-2">
        <div dir="ltr" lang="en" className="rounded-xl border border-border p-lg">
          <p className="mb-sm text-xs font-medium tracking-wide text-muted-foreground uppercase">
            LTR · English
          </p>
          <TypeShowcase rtl={false} />
          <ProseShowcase rtl={false} />
        </div>
        <div dir="rtl" lang="ar" className="rounded-xl border border-border p-lg">
          <p className="mb-sm text-xs font-medium tracking-wide text-muted-foreground uppercase">
            RTL · العربية
          </p>
          <TypeShowcase rtl />
          <ProseShowcase rtl />
        </div>
      </div>
      <section className="section" aria-labelledby="dark-heading">
        <h2 id="dark-heading" className="mb-md">
          Dark surface
        </h2>
        <div className="dark rounded-xl bg-background p-lg text-foreground shadow-elevate-2">
          <p className="mb-md max-w-prose text-muted-foreground">
            Dark uses the same brand scale, lifted one step so violet stays
            visible on ink-black paper.
          </p>
          <div className="flex flex-wrap gap-sm">
            <span className="rounded-md bg-primary px-sm py-2xs text-sm text-primary-foreground">
              Primary
            </span>
            <span className="rounded-md bg-accent px-sm py-2xs text-sm text-accent-foreground">
              Accent
            </span>
            <span className="rounded-md bg-card px-sm py-2xs text-sm shadow-elevate-1">
              Card
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
