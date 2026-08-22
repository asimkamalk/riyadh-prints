import { z } from "zod";

import { cn } from "@/lib/utils";
import type { EditorField, SectionRecord } from "@/lib/sections/types";

export const sectionBackgroundSchema = z.enum(["default", "muted", "accent", "inverse"]);
export const sectionPaddingSchema = z.enum(["none", "sm", "md", "lg"]);
export const sectionAlignmentSchema = z.enum(["start", "center", "end"]);
export const sectionContainerSchema = z.enum(["narrow", "default", "wide", "full"]);

export const sectionLayoutSchema = z.object({
  background: sectionBackgroundSchema.default("default"),
  padding: sectionPaddingSchema.default("md"),
  alignment: sectionAlignmentSchema.default("start"),
  columns: z.number().int().min(1).max(6).optional(),
  container: sectionContainerSchema.default("default"),
});

export type SectionLayout = z.infer<typeof sectionLayoutSchema>;

export const defaultLayout = (): SectionLayout => ({
  background: "default",
  padding: "md",
  alignment: "start",
  container: "default",
});

export const layoutEditorFields: EditorField[] = [
  {
    key: "background",
    label: "Background",
    kind: "enum" as const,
    options: [
      { value: "default", label: "Default" },
      { value: "muted", label: "Muted" },
      { value: "accent", label: "Accent" },
      { value: "inverse", label: "Inverse" },
    ],
  },
  {
    key: "padding",
    label: "Padding",
    kind: "enum" as const,
    options: [
      { value: "none", label: "None" },
      { value: "sm", label: "Small" },
      { value: "md", label: "Medium" },
      { value: "lg", label: "Large" },
    ],
  },
  {
    key: "alignment",
    label: "Alignment",
    kind: "enum" as const,
    options: [
      { value: "start", label: "Start" },
      { value: "center", label: "Center" },
      { value: "end", label: "End" },
    ],
  },
  {
    key: "container",
    label: "Container width",
    kind: "enum" as const,
    options: [
      { value: "narrow", label: "Narrow" },
      { value: "default", label: "Default" },
      { value: "wide", label: "Wide" },
      { value: "full", label: "Full" },
    ],
  },
];

export function parseLayout(settings: unknown): SectionLayout {
  const parsed = sectionLayoutSchema.safeParse(settings ?? {});
  return parsed.success ? parsed.data : defaultLayout();
}

export function layoutClassName(settings: unknown): { section: string; inner: string } {
  const layout = parseLayout(settings);
  return {
    section: cn(
      layout.padding === "none" && "py-0",
      layout.padding === "sm" && "py-8",
      layout.padding === "md" && "section",
      layout.padding === "lg" && "py-24 md:py-32",
      layout.background === "muted" && "bg-muted",
      layout.background === "accent" && "bg-brand-50 dark:bg-brand-950",
      layout.background === "inverse" && "bg-brand-900 text-white",
    ),
    inner: cn(
      layout.container === "full" ? "w-full px-[var(--spacing-gutter)]" : "container-page",
      layout.container === "narrow" && "max-w-3xl",
      layout.container === "wide" && "max-w-7xl",
      layout.alignment === "center" && "text-center",
      layout.alignment === "end" && "text-end",
      layout.alignment === "start" && "text-start",
    ),
  };
}

export function gridColumnsClass(settings: unknown, fallback = 3): string {
  const record = settings && typeof settings === "object" ? (settings as SectionRecord) : {};
  const raw = record.columns;
  const columns = typeof raw === "number" && raw >= 1 && raw <= 6 ? raw : fallback;
  const map: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };
  return map[columns] ?? map[3];
}
