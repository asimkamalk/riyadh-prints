"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { chromeText } from "@/components/site/copy";
import type { GalleryItem } from "@/components/site/gallery-types";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

export function ProductGallery({ items, locale }: { items: GalleryItem[]; locale: Locale }) {
  const [active, setActive] = useState(0);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const didMount = useRef(false);
  const current = items[active];
  const canCycle = items.length > 1;

  const go = useCallback(
    (delta: number) => {
      setActive((index) => (index + delta + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    thumbsRef.current
      ?.querySelector("[aria-current='true']")
      ?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [active]);

  if (!current) {
    return <div className="aspect-square rounded-xl bg-muted" />;
  }

  return (
    <div
      className="grid gap-3"
      onKeyDown={(event) => {
        if (!canCycle) {
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          priority={active === 0}
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
          placeholder={current.blurDataUrl ? "blur" : "empty"}
          blurDataURL={current.blurDataUrl ?? undefined}
        />
        {canCycle ? (
          <>
            <ArrowButton
              locale={locale}
              direction="prev"
              onClick={() => go(-1)}
              className="absolute start-3 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-white text-foreground shadow-sm hover:bg-white"
            />
            <ArrowButton
              locale={locale}
              direction="next"
              onClick={() => go(1)}
              className="absolute end-3 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-white text-foreground shadow-sm hover:bg-white"
            />
          </>
        ) : null}
      </div>
      {canCycle ? (
        <div className="flex items-stretch gap-2">
          <ul
            ref={thumbsRef}
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, itemIndex) => {
              const selected = itemIndex === active;
              return (
                <li key={`${item.src}-${itemIndex}`} className="size-[4.5rem] shrink-0 sm:size-20">
                  <button
                    type="button"
                    aria-label={item.alt}
                    aria-current={selected ? "true" : undefined}
                    className="relative size-full overflow-hidden rounded-xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&:hover>span]:opacity-0 [&:focus-visible>span]:opacity-0"
                    onClick={() => setActive(itemIndex)}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      placeholder={item.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={item.blurDataUrl ?? undefined}
                    />
                    <span
                      className={cn(
                        "pointer-events-none absolute inset-0 bg-white/55 transition-opacity",
                        selected && "opacity-0",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex w-10 shrink-0 flex-col divide-y overflow-hidden rounded-xl border bg-background">
            <ArrowButton
              locale={locale}
              direction="next"
              onClick={() => go(1)}
              className="flex-1 rounded-none p-0"
            />
            <ArrowButton
              locale={locale}
              direction="prev"
              onClick={() => go(-1)}
              className="flex-1 rounded-none p-0"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ArrowButton({
  locale,
  direction,
  onClick,
  className,
}: {
  locale: Locale;
  direction: "prev" | "next";
  onClick: () => void;
  className?: string;
}) {
  const prev = direction === "prev";
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={chromeText(locale, prev ? "lightboxPrev" : "lightboxNext")}
      onClick={onClick}
    >
      {prev ? (
        <ChevronLeft className="size-4 rtl:rotate-180" />
      ) : (
        <ChevronRight className="size-4 rtl:rotate-180" />
      )}
    </button>
  );
}
