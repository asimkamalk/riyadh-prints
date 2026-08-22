"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { chromeText } from "@/components/site/copy";
import type { GalleryItem } from "@/components/site/gallery-types";
import type { Locale } from "@/i18n/locales";

export function Lightbox({
  locale,
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  locale: Locale;
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft") {
        onPrev();
      }
      if (event.key === "ArrowRight") {
        onNext();
      }
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  if (!item) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={chromeText(locale, "lightbox")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute end-4 top-4 rounded-full bg-white/10 p-2 text-white"
        aria-label={chromeText(locale, "lightboxClose")}
        onClick={onClose}
      >
        <X className="size-5" />
      </button>
      {items.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute start-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white rtl:rotate-180"
            aria-label={chromeText(locale, "lightboxPrev")}
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white rtl:rotate-180"
            aria-label={chromeText(locale, "lightboxNext")}
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
      <div className="relative max-h-[90dvh] max-w-[90vw]" onClick={(event) => event.stopPropagation()}>
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          className="max-h-[90dvh] w-auto object-contain"
          placeholder={item.blurDataUrl ? "blur" : "empty"}
          blurDataURL={item.blurDataUrl ?? undefined}
        />
      </div>
    </div>
  );
}
