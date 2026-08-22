"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { chromeText, type ChromeCopyKey } from "@/components/site/copy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/locales";
import { searchSite } from "@/server/actions/search";
import type { SearchHit } from "@/types/content";

const GROUP_ORDER = ["product", "service", "category", "page", "post", "project"] as const;

const GROUP_COPY: Record<(typeof GROUP_ORDER)[number], ChromeCopyKey> = {
  product: "searchGroupProduct",
  service: "searchGroupService",
  category: "searchGroupCategory",
  page: "searchGroupPage",
  post: "searchGroupPost",
  project: "searchGroupProject",
};

export function SearchDialog({ locale }: { locale: Locale }) {
  const inputId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const grouped = useMemo(() => groupHits(hits), [hits]);

  function scheduleSearch(value: string) {
    setQuery(value);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      void runSearch(value);
    }, 250);
  }

  async function runSearch(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setHits([]);
      setPending(false);
      return;
    }
    setPending(true);
    const result = await searchSite({ query: trimmed, locale });
    setPending(false);
    setHits(result.ok ? result.data : []);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={chromeText(locale, "search")}
          title={chromeText(locale, "searchHint")}
        >
          <Search className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[18%] translate-y-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{chromeText(locale, "search")}</DialogTitle>
          <DialogDescription>{chromeText(locale, "searchPlaceholder")}</DialogDescription>
        </DialogHeader>
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor={inputId} className="sr-only">
            {chromeText(locale, "search")}
          </label>
          <Input
            id={inputId}
            value={query}
            onChange={(event) => scheduleSearch(event.target.value)}
            placeholder={chromeText(locale, "searchPlaceholder")}
            autoComplete="off"
            autoFocus
          />
        </form>
        <div aria-live="polite" className="max-h-80 min-h-16 overflow-y-auto">
          {pending ? (
            <p className="text-sm text-muted-foreground">…</p>
          ) : query.trim().length >= 2 && hits.length === 0 ? (
            <p className="text-sm text-muted-foreground">{chromeText(locale, "searchEmpty")}</p>
          ) : (
            grouped.map((group) => (
              <div key={group.type} className="mb-3">
                <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                  {chromeText(locale, GROUP_COPY[group.type])}
                </p>
                <ul className="grid gap-1">
                  {group.hits.map((hit) => (
                    <li key={`${hit.entityType}:${hit.entityId}`}>
                      <Link
                        href={hit.href as never}
                        className="block rounded-md px-2 py-2 hover:bg-muted"
                        onClick={() => setOpen(false)}
                      >
                        <span className="block text-sm font-medium">{hit.title}</span>
                        {hit.excerpt ? (
                          <span className="line-clamp-2 text-xs text-muted-foreground">{hit.excerpt}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function groupHits(hits: SearchHit[]): { type: (typeof GROUP_ORDER)[number]; hits: SearchHit[] }[] {
  return GROUP_ORDER.flatMap((type) => {
    const list = hits.filter((hit) => hit.entityType === type);
    return list.length ? [{ type, hits: list }] : [];
  });
}
