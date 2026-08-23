import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeading } from "@/components/sections/shell";
import { Button } from "@/components/ui/button";
import { asBoolean, asRecord, asString } from "@/lib/sections/parse";
import type { MediaDto } from "@/types/content";
import { cn } from "@/lib/utils";

export function InlineCopy({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold?.[1]) {
          return (
            <strong key={index} className="font-medium text-foreground">
              {bold[1]}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link?.[1] && link[2]) {
          return (
            <Link key={index} href={link[2] as never} className="font-medium text-primary underline-offset-2 hover:underline">
              {link[1]}
            </Link>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

export function AboutDecor({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative isolate min-h-72 overflow-hidden", className)}>
      <span className="absolute start-[12%] top-[8%] size-20 rounded-full bg-brand-200/90" aria-hidden />
      <span className="absolute start-0 bottom-[6%] size-48 rounded-full bg-rose-300/80 sm:size-56" aria-hidden />
      <span className="absolute end-[18%] top-[18%] grid grid-cols-3 gap-1.5 text-sky-400/80" aria-hidden>
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="text-lg leading-none">
            ×
          </span>
        ))}
      </span>
      {children}
    </div>
  );
}

export function AboutCta({ href, label }: { href: string; label: string }) {
  if (!href || !label) {
    return null;
  }
  return (
    <Button asChild className="mt-2 h-11 rounded-full px-6">
      <Link href={href as never}>
        {label}
        <ArrowUpRight className="size-4" />
      </Link>
    </Button>
  );
}

export function AboutIntroVisual({ value, label }: { value: string; label: string }) {
  return (
    <AboutDecor className="min-h-80 lg:min-h-[28rem]">
      {value ? (
        <div className="absolute end-2 bottom-10 z-10 w-48 rounded-2xl bg-white p-5 shadow-lg sm:end-8">
          <p className="text-3xl font-bold text-primary">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      ) : null}
    </AboutDecor>
  );
}

export function AboutBulletList({ items }: { items: unknown[] }) {
  return (
    <ul className="grid gap-2.5 text-sm text-foreground sm:text-base">
      {items.map((raw, index) => {
        const item = asRecord(raw);
        const title = asString(item.title);
        if (!title) {
          return null;
        }
        const accent = asBoolean(item.highlight);
        return (
          <li key={`${title}-${index}`} className={cn("flex gap-2", accent && "font-medium text-primary")}>
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-current" />
            <span>{title}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function AboutEyebrow({ children }: { children: string }) {
  if (!children) {
    return null;
  }
  return <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{children}</p>;
}

export function AboutPeople({
  heading,
  eyebrow,
  headingLevel,
  items,
  mediaById,
}: {
  heading: string;
  eyebrow: string;
  headingLevel: 1 | 2;
  items: unknown[];
  mediaById: Record<string, MediaDto>;
}) {
  return (
    <div className="mx-auto grid max-w-4xl justify-items-center gap-10 text-center">
      <div className="grid gap-2">
        <AboutEyebrow>{eyebrow}</AboutEyebrow>
        {heading ? <SectionHeading level={headingLevel}>{heading}</SectionHeading> : null}
      </div>
      <ul className="grid w-full gap-8 sm:grid-cols-2">
        {items.map((raw, index) => {
          const item = asRecord(raw);
          const title = asString(item.title) || asString(item.alt);
          const role = asString(item.caption);
          const href = asString(item.href);
          const media = mediaById[asString(item.mediaId)];
          const card = (
            <>
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-muted transition group-hover:shadow-md">
                {media ? (
                  <Image
                    src={media.url}
                    alt={asString(item.alt) || media.alt || title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(min-width: 640px) 40vw, 100vw"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-4xl font-semibold text-primary">
                    {title.slice(0, 1)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                {role ? <p className="text-sm text-muted-foreground">{role}</p> : null}
              </div>
            </>
          );
          return (
            <li key={`${title}-${index}`} className="grid justify-items-center gap-4">
              {href ? (
                <Link href={href as never} className="group grid justify-items-center gap-4">
                  {card}
                </Link>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AboutShowcaseFrame({
  heading,
  eyebrow,
  cta,
  href,
  headingLevel,
  left,
  right,
}: {
  heading: string;
  eyebrow: string;
  cta: string;
  href: string;
  headingLevel: 1 | 2;
  left?: MediaDto;
  right?: MediaDto;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-brand-800 px-6 py-16 text-center text-white sm:px-12">
      {left ? (
        <div className="absolute start-0 top-1/2 hidden w-[28%] -translate-y-1/2 lg:block">
          <Image src={left.url} alt="" width={left.width ?? 640} height={left.height ?? 480} className="h-auto w-full object-contain opacity-90" />
        </div>
      ) : null}
      {right ? (
        <div className="absolute end-0 top-1/2 hidden w-[28%] -translate-y-1/2 lg:block">
          <Image src={right.url} alt="" width={right.width ?? 640} height={right.height ?? 480} className="h-auto w-full object-contain opacity-90" />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto grid max-w-xl justify-items-center gap-5">
        {eyebrow ? <p className="text-sm text-white/80">{eyebrow}</p> : null}
        {heading ? (
          <SectionHeading level={headingLevel}>
            <span className="text-white">{heading}</span>
          </SectionHeading>
        ) : null}
        {cta && href ? (
          <Button asChild variant="outline" className="h-11 rounded-full border-white bg-transparent px-6 text-white hover:bg-white/10">
            <Link href={href as never}>
              {cta}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
