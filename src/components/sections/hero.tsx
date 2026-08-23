import Image from "next/image";
import Link from "next/link";

import { HeroCarousel } from "@/components/sections/hero-carousel";
import { HeroSlidePanel, type HeroSlideView } from "@/components/sections/hero-slide";
import { AccentText, SectionHeading, SectionShell, dataString } from "@/components/sections/shell";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/site/icons";
import { asRecord, asString } from "@/lib/sections/parse";
import { withLocalePath } from "@/i18n/routing";
import type { SectionRenderProps } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function HeroRenderer({ data, settings, headingLevel, resolved, locale }: SectionRenderProps) {
  const heading = dataString(data, "heading");
  const subheading = dataString(data, "subheading");
  const eyebrow = dataString(data, "eyebrow");
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
  const slides = buildSlides(data, {
    heading,
    subheading,
    eyebrow,
    primaryCta,
    secondaryCta,
    primaryHref: quoteHref,
    secondaryHref,
    image,
    mediaById: resolved.mediaById,
  });

  if (layout === "overlay") {
    return (
      <section className="relative overflow-hidden">
        {slides.length > 1 ? (
          <HeroCarousel
            slides={slides}
            headingLevel={headingLevel}
            showPrimary={showPrimary}
            showSecondary={showSecondary}
          />
        ) : (
          <HeroSlidePanel
            slide={slides[0] ?? fallbackSlide(heading, subheading, eyebrow, primaryCta, secondaryCta, quoteHref, secondaryHref, image)}
            headingLevel={headingLevel}
            showPrimary={showPrimary}
            showSecondary={showSecondary}
            priority={headingLevel === 1}
          />
        )}
      </section>
    );
  }

  return (
    <SectionShell settings={settings}>
      <div className={cn("grid items-center gap-10", layout === "split" && "lg:grid-cols-2")}>
        <div className="grid max-w-2xl gap-6">
          {eyebrow ? <p className="text-sm font-semibold tracking-wide text-primary">{eyebrow}</p> : null}
          {heading ? (
            <SectionHeading level={headingLevel}>
              <AccentText>{heading}</AccentText>
            </SectionHeading>
          ) : null}
          {subheading ? <p className="text-lg text-muted-foreground">{subheading}</p> : null}
          <HeroCtas
            showPrimary={showPrimary}
            showSecondary={showSecondary}
            primaryCta={primaryCta}
            secondaryCta={secondaryCta}
            primaryHref={quoteHref}
            secondaryHref={secondaryHref || withLocalePath(locale, "/contact")}
          />
        </div>
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
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

function HeroCtas({
  showPrimary,
  showSecondary,
  primaryCta,
  secondaryCta,
  primaryHref,
  secondaryHref,
}: {
  showPrimary: boolean;
  showSecondary: boolean;
  primaryCta: string;
  secondaryCta: string;
  primaryHref: string;
  secondaryHref: string;
}) {
  const secondaryIsWhatsApp = /wa\.me|whatsapp/i.test(secondaryHref);
  return (
    <div className="flex flex-wrap gap-3">
      {showPrimary && primaryCta ? (
        <Button asChild size="lg" className="rounded-full">
          <Link href={primaryHref as never}>{primaryCta}</Link>
        </Button>
      ) : null}
      {showSecondary && secondaryCta ? (
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href={secondaryHref as never}>
            {secondaryIsWhatsApp ? <WhatsAppIcon className="size-4" /> : null}
            {secondaryCta}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function buildSlides(
  data: SectionRenderProps["data"],
  fallback: HeroSlideView & { mediaById: SectionRenderProps["resolved"]["mediaById"] },
): HeroSlideView[] {
  const raw = Array.isArray(data.slides) ? data.slides : [];
  const slides = raw.flatMap((item) => {
    const row = asRecord(item);
    const mediaId = asString(row.mediaId);
    const heading = asString(row.heading) || fallback.heading;
    if (!heading && !mediaId) {
      return [];
    }
    return [
      {
        heading,
        subheading: asString(row.subheading) || fallback.subheading,
        eyebrow: fallback.eyebrow,
        primaryCta: asString(row.cta) || fallback.primaryCta,
        secondaryCta: fallback.secondaryCta,
        primaryHref: asString(row.href) || fallback.primaryHref,
        secondaryHref: fallback.secondaryHref,
        image: mediaId ? fallback.mediaById[mediaId] : fallback.image,
      } satisfies HeroSlideView,
    ];
  });
  if (slides.length) {
    return slides;
  }
  return [
    fallbackSlide(
      fallback.heading,
      fallback.subheading,
      fallback.eyebrow,
      fallback.primaryCta,
      fallback.secondaryCta,
      fallback.primaryHref,
      fallback.secondaryHref,
      fallback.image,
    ),
  ];
}

function fallbackSlide(
  heading: string,
  subheading: string,
  eyebrow: string,
  primaryCta: string,
  secondaryCta: string,
  primaryHref: string,
  secondaryHref: string,
  image: HeroSlideView["image"],
): HeroSlideView {
  return {
    heading,
    subheading,
    eyebrow,
    primaryCta,
    secondaryCta,
    primaryHref,
    secondaryHref,
    image,
  };
}
