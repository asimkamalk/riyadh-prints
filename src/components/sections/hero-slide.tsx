import Image from "next/image";
import Link from "next/link";

import { AccentText } from "@/components/sections/shell";
import { WhatsAppIcon } from "@/components/site/icons";
import { Button } from "@/components/ui/button";
import type { MediaDto } from "@/types/content";
import { cn } from "@/lib/utils";

export type HeroSlideView = {
  heading: string;
  subheading: string;
  eyebrow: string;
  primaryCta: string;
  secondaryCta: string;
  primaryHref: string;
  secondaryHref: string;
  image?: MediaDto;
};

export function HeroSlidePanel({
  slide,
  headingLevel,
  showPrimary,
  showSecondary,
  priority = false,
  hidden = false,
}: {
  slide: HeroSlideView;
  headingLevel: 1 | 2;
  showPrimary: boolean;
  showSecondary: boolean;
  priority?: boolean;
  hidden?: boolean;
}) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";
  const secondaryIsWhatsApp = /wa\.me|whatsapp/i.test(slide.secondaryHref);

  return (
    <div
      className={cn("relative min-h-[28rem] w-full md:min-h-[36rem] lg:min-h-[42rem]", hidden && "hidden")}
      aria-hidden={hidden}
    >
      {slide.image ? (
        <Image
          src={slide.image.url}
          alt={slide.image.alt || slide.heading}
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
          placeholder={slide.image.blurDataUrl ? "blur" : "empty"}
          blurDataURL={slide.image.blurDataUrl ?? undefined}
        />
      ) : (
        <div className="absolute inset-0 bg-brand-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
      <div className="container-page relative z-10 flex min-h-[inherit] items-end py-16 md:items-center md:py-20">
        <div className="grid max-w-2xl gap-5 text-white">
          {slide.eyebrow ? (
            <p className="text-sm font-semibold tracking-wide text-white/85">{slide.eyebrow}</p>
          ) : null}
          {slide.heading ? (
            <HeadingTag
              className={cn(
                "text-balance font-bold tracking-tight",
                headingLevel === 1 ? "text-h1" : "text-h2",
              )}
            >
              <AccentText>{slide.heading}</AccentText>
            </HeadingTag>
          ) : null}
          {slide.subheading ? <p className="text-lg text-white/85">{slide.subheading}</p> : null}
          <div className="flex flex-wrap gap-3">
            {showPrimary && slide.primaryCta ? (
              <Button asChild size="lg" className="rounded-full">
                <Link href={slide.primaryHref as never}>{slide.primaryCta}</Link>
              </Button>
            ) : null}
            {showSecondary && slide.secondaryCta ? (
              <Button
                asChild
                size="lg"
                className={cn(
                  "rounded-full",
                  secondaryIsWhatsApp
                    ? "bg-[#128C7E] text-white hover:bg-[#0e7a6e]"
                    : "border-white/70 bg-white/10 text-white hover:bg-white/20",
                )}
                variant={secondaryIsWhatsApp ? "default" : "outline"}
              >
                <Link href={(slide.secondaryHref || "#") as never}>
                  {secondaryIsWhatsApp ? <WhatsAppIcon className="size-4" /> : null}
                  {slide.secondaryCta}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
