import Image from "next/image";
import Link from "next/link";

import { AboutShowcaseFrame } from "@/components/sections/about-layouts";
import { chromeText } from "@/components/site/copy";
import { StatCounter } from "@/components/site/stat-counter";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { WhatsAppIcon } from "@/components/site/icons";
import { Button } from "@/components/ui/button";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { asString } from "@/lib/sections/parse";
import type { SectionRenderProps } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function StatsRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} settings={settings} />
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {resolved.stats.map((stat) => (
          <li key={stat.id} className="grid gap-1 text-center">
            <div className="text-primary">
              <StatCounter prefix={stat.prefix} value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-sm font-medium">{stat.label}</p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function PartnersRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} settings={settings} />
      <ul className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {resolved.partners.map((partner) => (
          <li key={partner.id} className="grid place-items-center rounded-2xl border bg-card px-4 py-6 shadow-xs">
            {partner.logo ? (
              <Image
                src={partner.logo.url}
                alt={partner.logo.alt || partner.name}
                width={partner.logo.width ?? 160}
                height={partner.logo.height ?? 80}
                className="max-h-12 w-auto object-contain"
              />
            ) : (
              <span className="text-center text-sm font-medium">{partner.name}</span>
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
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} settings={settings} />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {resolved.testimonials.map((item) => (
          <li key={item.id}>
            <TestimonialCard testimonial={item} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function CtaBannerRenderer({ data, settings, headingLevel, resolved, locale }: SectionRenderProps) {
  const variant = asString(settings.variant, "accent");
  const heading = dataString(data, "heading");
  const cta = dataString(data, "cta");
  const secondary = dataString(data, "secondary");
  const href = dataString(data, "href") || resolved.quoteHref;
  const inverse = variant === "inverse";
  if (asString(settings.layout) === "showcase") {
    return (
      <SectionShell settings={settings}>
        <AboutShowcaseFrame
          heading={heading}
          eyebrow={secondary}
          cta={cta}
          href={href}
          headingLevel={headingLevel}
          left={resolved.mediaById[asString(settings.leftImageId)]}
          right={resolved.mediaById[asString(settings.rightImageId)]}
        />
      </SectionShell>
    );
  }
  return (
    <SectionShell
      settings={settings}
      className={cn(
        variant === "accent" && "bg-brand-50 dark:bg-brand-950",
        inverse && "bg-brand-900 text-white",
        variant === "muted" && "bg-muted",
      )}
    >
      <div className={cn("grid gap-6", inverse && "justify-items-center text-center")}>
        <div className={cn("grid gap-2", inverse && "max-w-3xl [&_h1]:text-white [&_h2]:text-white [&_p]:text-white/80")}>
          <SectionIntro
            heading={heading}
            subheading={secondary}
            headingLevel={headingLevel}
            settings={inverse ? { alignment: "center" } : settings}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {cta ? (
            <Button asChild className={cn("rounded-full", inverse && "bg-white text-brand-700 hover:bg-white/90")}>
              <Link href={href as never}>{cta}</Link>
            </Button>
          ) : null}
          {inverse && resolved.whatsappUrl ? (
            <Button asChild variant="outline" className="rounded-full border-white/70 bg-transparent text-white hover:bg-white/10">
              <a href={resolved.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" />
                {chromeText(locale, "whatsappFloat")}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}
