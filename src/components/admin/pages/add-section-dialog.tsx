"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { listSectionCatalog } from "@/lib/sections/catalog";
import type { SectionType } from "@/generated/prisma/enums";

export function AddSectionDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: SectionType) => void;
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add section"
      description="Choose a section type to insert"
    >
      <CommandInput placeholder="Search sections…" />
      <CommandList>
        <CommandEmpty>No section type matches.</CommandEmpty>
        <CommandGroup heading="Section types">
          {listSectionCatalog().map((definition) => (
            <CommandItem
              key={definition.type}
              value={`${definition.label} ${definition.description} ${definition.type}`}
              onSelect={() => {
                onSelect(definition.type);
                onOpenChange(false);
              }}
            >
              <definition.icon className="size-4" />
              <span className="flex flex-col">
                <span>{definition.label}</span>
                <span className="text-xs text-muted-foreground">{definition.description}</span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
