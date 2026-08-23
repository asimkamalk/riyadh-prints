"use client";

import { useCallback, useEffect, useState } from "react";

import { HeroSlidePanel, type HeroSlideView } from "@/components/sections/hero-slide";

export function HeroCarousel({
  slides,
  headingLevel,
  showPrimary,
  showSecondary,
}: {
  slides: HeroSlideView[];
  headingLevel: 1 | 2;
  showPrimary: boolean;
  showSecondary: boolean;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 7000);
    return () => window.clearInterval(id);
  }, [count]);

  return (
    <div className="relative">
      {slides.map((slide, slideIndex) => (
        <HeroSlidePanel
          key={`${slide.heading}-${slideIndex}`}
          slide={slide}
          headingLevel={slideIndex === 0 ? headingLevel : 2}
          showPrimary={showPrimary}
          showSecondary={showSecondary}
          priority={slideIndex === 0}
          hidden={slideIndex !== index}
        />
      ))}
      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={`dot-${slide.heading}-${slideIndex}`}
              type="button"
              aria-label={`Slide ${slideIndex + 1}`}
              aria-current={slideIndex === index ? "true" : undefined}
              className={
                slideIndex === index
                  ? "size-2.5 rounded-full bg-primary"
                  : "size-2.5 rounded-full bg-white/70 hover:bg-white"
              }
              onClick={() => go(slideIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
