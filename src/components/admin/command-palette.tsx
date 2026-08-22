"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { flattenAdminNav } from "@/components/admin/nav-config";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { searchAdminCommand } from "@/server/actions/admin";

type EntityHit = { id: string; title: string; href: string; type: string };

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<EntityHit[]>([]);
  const [pending, startTransition] = useTransition();
  const nav = flattenAdminNav();

  useEffect(() => {
    if (!open) {
      return;
    }
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const handle = window.setTimeout(() => {
      startTransition(async () => {
        const result = await searchAdminCommand({ query: q });
        setHits(result.ok ? result.data : []);
      });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, open]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href as never);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to"
      description="Search pages and content"
    >
      <CommandInput
        placeholder="Search pages, products, posts…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{pending ? "Searching…" : "No results."}</CommandEmpty>
        <CommandGroup heading="Pages">
          {nav.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.keywords}`}
              onSelect={() => go(item.href)}
            >
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {hits.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Content">
              {hits.map((hit) => (
                <CommandItem
                  key={`${hit.type}:${hit.id}`}
                  value={`${hit.title} ${hit.type}`}
                  onSelect={() => go(hit.href)}
                >
                  <span className="text-muted-foreground w-16 shrink-0 text-xs">
                    {hit.type}
                  </span>
                  {hit.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
