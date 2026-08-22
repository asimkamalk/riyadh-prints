"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";

import type { GalleryItem } from "@/components/site/gallery-types";
import { SiteImage } from "@/components/site/site-image";
import type { Locale } from "@/i18n/locales";

const Lightbox = dynamic(() => import("@/components/site/lightbox").then((mod) => mod.Lightbox), {
  ssr: false,
});

export function Gallery({ items, locale }: { items: GalleryItem[]; locale: Locale }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => {
    setIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current + items.length - 1) % items.length;
    });
  }, [items.length]);
  const next = useCallback(() => {
    setIndex((current) => {
      if (current == null) {
        return current;
      }
      return (current + 1) % items.length;
    });
  }, [items.length]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item, itemIndex) => (
          <li key={`${item.src}-${itemIndex}`}>
            <button
              type="button"
              className="relative block aspect-square w-full overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={item.alt}
              onClick={() => setIndex(itemIndex)}
            >
              <SiteImage
                media={{
                  id: item.src,
                  url: item.src,
                  width: item.width,
                  height: item.height,
                  alt: item.alt,
                  title: null,
                  blurDataUrl: item.blurDataUrl ?? null,
                  servedLocale: locale,
                  isFallback: false,
                }}
                alt={item.alt}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </button>
          </li>
        ))}
      </ul>
      {index != null ? (
        <Lightbox
          locale={locale}
          items={items}
          index={index}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      ) : null}
    </>
  );
}
