import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionHeading, SectionShell, dataString } from "@/components/sections/shell";
import { asString } from "@/lib/sections/parse";
import { withLocalePath } from "@/i18n/routing";
import type { SectionRenderProps } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function HeroRenderer({ data, settings, headingLevel, resolved, locale }: SectionRenderProps) {
  const heading = dataString(data, "heading");
  const subheading = dataString(data, "subheading");
  const primaryCta = dataString(data, "primaryCta");
  const secondaryCta = dataString(data, "secondaryCta");
  const layout = asString(settings.layout, "split");
  const ctaMode = asString(settings.cta, "quote");
  const imageId = asString(settings.imageId);
  const image = imageId ? resolved.mediaById[imageId] : undefined;
  const quoteHref = dataString(data, "primaryHref") || resolved.quoteHref;
  const secondaryHref = dataString(data, "secondaryHref") || resolved.whatsappUrl;
  const showPrimary = ctaMode !== "whatsapp" && ctaMode !== "none";
  const showSecondary = ctaMode !== "none";

  return (
    <SectionShell settings={settings}>
      <div
        className={cn(
          "grid items-center gap-10",
          layout === "split" && "lg:grid-cols-2",
          layout === "overlay" && "relative min-h-[28rem]",
        )}
      >
        <div className="grid max-w-2xl gap-6">
          {heading ? <SectionHeading level={headingLevel}>{heading}</SectionHeading> : null}
          {subheading ? <p className="text-muted-foreground text-lg">{subheading}</p> : null}
          <div className="flex flex-wrap gap-3">
            {showPrimary && primaryCta ? (
              <Button asChild>
                <Link href={quoteHref as never}>{primaryCta}</Link>
              </Button>
            ) : null}
            {showSecondary && secondaryCta ? (
              <Button asChild variant="outline">
                <Link href={(secondaryHref || withLocalePath(locale, "/contact")) as never}>{secondaryCta}</Link>
              </Button>
            ) : null}
          </div>
        </div>
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <Image
              src={image.url}
              alt={image.alt || heading}
              fill
              priority={headingLevel === 1}
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
              placeholder={image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={image.blurDataUrl ?? undefined}
            />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
