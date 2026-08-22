"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { GallerySkeleton } from "@/components/site/gallery-skeleton";
import type { GalleryItem } from "@/components/site/gallery-types";
import type { Locale } from "@/i18n/locales";

const Gallery = dynamic(() => import("@/components/site/gallery").then((mod) => mod.Gallery), {
  ssr: false,
});

export function LazyGallery({ items, locale }: { items: GalleryItem[]; locale: Locale }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <GallerySkeleton count={items.length} />;
  }
  return <Gallery items={items} locale={locale} />;
}
