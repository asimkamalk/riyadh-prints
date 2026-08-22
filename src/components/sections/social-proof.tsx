import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { asString } from "@/lib/sections/parse";
import type { SectionRenderProps } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function StatsRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {resolved.stats.map((stat) => (
          <li key={stat.id} className="rounded-xl border p-5">
            <p className="text-3xl font-semibold">
              {stat.prefix}
              {stat.value}
              {stat.suffix}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function PartnersRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <ul className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {resolved.partners.map((partner) => (
          <li key={partner.id} className="grid place-items-center">
            {partner.logo ? (
              <Image
                src={partner.logo.url}
                alt={partner.logo.alt || partner.name}
                width={partner.logo.width ?? 160}
                height={partner.logo.height ?? 80}
                className="max-h-12 w-auto object-contain"
              />
            ) : (
              <span className="text-sm text-muted-foreground">{partner.name}</span>
            )}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function TestimonialsRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resolved.testimonials.map((item) => (
          <li key={item.id} className="grid gap-3 rounded-xl border p-5">
            <blockquote className="text-sm">{item.quote}</blockquote>
            <p className="text-sm font-medium">{item.authorName}</p>
            {item.authorRole || item.company ? (
              <p className="text-xs text-muted-foreground">
                {[item.authorRole, item.company].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function CtaBannerRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  const variant = asString(settings.variant, "accent");
  const heading = dataString(data, "heading");
  const cta = dataString(data, "cta");
  const secondary = dataString(data, "secondary");
  const href = dataString(data, "href") || resolved.quoteHref;
  return (
    <SectionShell
      settings={settings}
      className={cn(
        variant === "accent" && "bg-brand-50 dark:bg-brand-950",
        variant === "inverse" && "bg-brand-900 text-white",
        variant === "muted" && "bg-muted",
      )}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-2">
          <SectionIntro heading={heading} subheading={secondary} headingLevel={headingLevel} />
        </div>
        {cta ? (
          <Button asChild>
            <Link href={href as never}>{cta}</Link>
          </Button>
        ) : null}
      </div>
    </SectionShell>
  );
}
