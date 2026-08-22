"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function HeaderChrome({ children }: { children: React.ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(!entry?.isIntersecting);
      },
      { threshold: [0] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <header
        className={cn(
          "sticky top-0 z-40 bg-background/95 backdrop-blur-sm transition-shadow",
          stuck && "shadow-elevate-1",
        )}
      >
        {children}
      </header>
    </>
  );
}
