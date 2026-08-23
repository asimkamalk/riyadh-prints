import Image from "next/image";
import Link from "next/link";

import {
  AboutBulletList,
  AboutCta,
  AboutEyebrow,
  AboutIntroVisual,
  AboutPeople,
  InlineCopy,
} from "@/components/sections/about-layouts";
import { LazyGallery } from "@/components/site/lazy-gallery";
import { Button } from "@/components/ui/button";
import { SectionHeading, SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { TiptapBody } from "@/components/sections/tiptap-body";
import { asRecord, asString, asStringList } from "@/lib/sections/parse";
import type { SectionRenderProps } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function RichTextRenderer({ data, settings, headingLevel }: SectionRenderProps) {
  const heading = dataString(data, "heading");
  return (
    <SectionShell settings={settings}>
      {heading ? <SectionHeading level={headingLevel}>{heading}</SectionHeading> : null}
      <div className="prose-rp mt-4">
        <TiptapBody value={data.body} />
      </div>
    </SectionShell>
  );
}

export function ImageTextRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  const heading = dataString(data, "heading");
  const body = dataString(data, "body");
  const cta = dataString(data, "cta");
  const href = dataString(data, "href");
  const imageId = asString(settings.imageId);
  const image = imageId ? resolved.mediaById[imageId] : undefined;
  const mediaStart = asString(settings.mediaSide, "end") === "start";
  const items = Array.isArray(data.items) ? data.items : [];
  if (asString(settings.appearance) === "story") {
    return (
      <SectionShell settings={settings}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <AboutIntroVisual value={dataString(data, "statValue")} label={dataString(data, "statLabel")} />
          <div className="grid gap-4">
            <AboutEyebrow>{dataString(data, "eyebrow")}</AboutEyebrow>
            {heading ? <SectionHeading level={headingLevel}>{heading}</SectionHeading> : null}
            {body ? <p className="text-lg text-muted-foreground">{body}</p> : null}
            {items.length ? <AboutBulletList items={items} /> : null}
            <AboutCta href={href} label={cta} />
          </div>
        </div>
      </SectionShell>
    );
  }
  return (
    <SectionShell settings={settings}>
      <div className={cn("grid items-center gap-10 lg:grid-cols-2", mediaStart && "lg:[&>*:first-child]:order-2")}>
        <div className="grid gap-4">
          {heading ? <SectionHeading level={headingLevel}>{heading}</SectionHeading> : null}
          {body ? <p className="text-lg text-muted-foreground">{body}</p> : null}
          {cta && href ? (
            <div>
              <Button asChild className="rounded-full">
                <Link href={href as never}>{cta}</Link>
              </Button>
            </div>
          ) : null}
        </div>
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            <Image
              src={image.url}
              alt={image.alt || heading}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

export function StepsRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  const steps = Array.isArray(data.steps) ? data.steps : [];
  return (
    <SectionShell settings={settings}>
      <SectionIntro
        heading={dataString(data, "heading")}
        subheading={dataString(data, "subheading")}
        headingLevel={headingLevel}
        settings={settings}
      />
      <ol className="grid gap-8 md:grid-cols-3">
        {steps.map((raw, index) => {
          const step = asRecord(raw);
          const media = resolved.mediaById[asString(step.mediaId)];
          return (
            <li key={`${asString(step.title)}-${index}`} className="grid gap-4 text-center">
              {media ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted">
                  <Image
                    src={media.url}
                    alt={media.alt || asString(step.title)}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 30vw, 100vw"
                  />
                </div>
              ) : null}
              <p className="font-semibold">{asString(step.title)}</p>
              {asString(step.body) ? (
                <p className="text-sm text-muted-foreground">
                  <InlineCopy text={asString(step.body)} />
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}

export function PricingTableRenderer({ data, settings, headingLevel }: SectionRenderProps) {
  const plans = Array.isArray(data.plans) ? data.plans : [];
  return (
    <SectionShell settings={settings}>
      <SectionIntro
        heading={dataString(data, "heading")}
        subheading={dataString(data, "subheading")}
        headingLevel={headingLevel}
      />
      <ul className="grid gap-6 md:grid-cols-3">
        {plans.map((raw, index) => {
          const plan = asRecord(raw);
          const features = asStringList(plan.features);
          return (
            <li key={`${asString(plan.name)}-${index}`} className="grid gap-4 rounded-xl border p-6">
              <p className="font-medium">{asString(plan.name)}</p>
              <p className="text-2xl font-semibold">
                {asString(plan.price)}
                {asString(plan.unit) ? (
                  <span className="ms-1 text-sm font-normal text-muted-foreground">{asString(plan.unit)}</span>
                ) : null}
              </p>
              {features.length ? (
                <ul className="grid gap-1 text-sm text-muted-foreground">
                  {features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

export function GalleryRenderer({ data, settings, headingLevel, resolved, locale }: SectionRenderProps) {
  const manualItems = Array.isArray(data.items) ? data.items : [];
  if (asString(settings.appearance) === "people") {
    const peopleItems =
      resolved.teamMembers.length > 0
        ? resolved.teamMembers.map((member) => ({
            title: member.name,
            caption: member.role,
            alt: member.name,
            mediaId: member.avatar?.id ?? "",
            href: member.href,
          }))
        : manualItems;
    const mediaById = { ...resolved.mediaById };
    for (const member of resolved.teamMembers) {
      if (member.avatar) {
        mediaById[member.avatar.id] = member.avatar;
      }
    }
    return (
      <SectionShell settings={settings}>
        <AboutPeople
          heading={dataString(data, "heading")}
          eyebrow={dataString(data, "eyebrow")}
          headingLevel={headingLevel}
          items={peopleItems}
          mediaById={mediaById}
        />
      </SectionShell>
    );
  }
  const items = manualItems;
  const slides = items.flatMap((raw, index) => {
    const item = asRecord(raw);
    const media = resolved.mediaById[asString(item.mediaId)];
    if (!media) {
      return [];
    }
    return [
      {
        src: media.url,
        alt: asString(item.alt) || media.alt || `Gallery image ${index + 1}`,
        width: media.width ?? 1200,
        height: media.height ?? 900,
        blurDataUrl: media.blurDataUrl,
      },
    ];
  });
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      {slides.length ? <LazyGallery items={slides} locale={locale} /> : null}
    </SectionShell>
  );
}

export function VideoRenderer({ data, settings, headingLevel }: SectionRenderProps) {
  const url = dataString(data, "url");
  const embed = embedUrl(url);
  return (
    <SectionShell settings={settings}>
      <SectionIntro
        heading={dataString(data, "heading")}
        subheading={dataString(data, "caption")}
        headingLevel={headingLevel}
      />
      {embed ? (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <iframe
            src={embed}
            title={dataString(data, "heading") || "Video"}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </SectionShell>
  );
}

function embedUrl(url: string): string | null {
  if (!url.trim()) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
