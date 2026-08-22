"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { MenuLink } from "@/components/site/menu-link";
import { cn } from "@/lib/utils";

export function MegaMenu({
  label,
  href,
  openInNewTab,
  submenuLabel,
  children,
}: {
  label: string;
  href: string;
  openInNewTab: boolean;
  submenuLabel: string;
  children: React.ReactNode;
}) {
  const panelId = useId();
  const wrapRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || !wrapRef.current?.contains(document.activeElement)) {
        return;
      }
      setOpen(false);
      setDismissed(true);
      buttonRef.current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <li
      ref={wrapRef}
      className="group relative"
      onMouseEnter={() => setDismissed(false)}
    >
      <div className="flex items-center">
        <MenuLink href={href} openInNewTab={openInNewTab} className="px-2 py-1 text-sm font-medium">
          {label}
        </MenuLink>
        <button
          ref={buttonRef}
          type="button"
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-expanded={open}
          aria-controls={panelId}
          aria-haspopup="true"
          aria-label={submenuLabel}
          onClick={() => {
            setDismissed(false);
            setOpen((value) => !value);
          }}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
      <div
        id={panelId}
        className={cn(
          "absolute start-0 top-full z-50 w-max max-w-[min(56rem,calc(100vw-2rem))] pt-2 transition-opacity",
          dismissed
            ? "invisible pointer-events-none opacity-0"
            : cn(
                "invisible pointer-events-none opacity-0",
                "group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100",
                "group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100",
                open && "visible pointer-events-auto opacity-100",
              ),
        )}
      >
        {children}
      </div>
    </li>
  );
}
