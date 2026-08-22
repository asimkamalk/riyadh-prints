"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

import { chromeText } from "@/components/site/copy";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/locales";

export function BackToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById("top");
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry?.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href="#top"
      className={cn(
        "fixed end-4 bottom-20 z-30 inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevate-2 transition-opacity",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-label={chromeText(locale, "backToTop")}
    >
      <ChevronUp className="size-5" />
    </a>
  );
}
