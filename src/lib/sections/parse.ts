import type { JsonValue } from "@/types/content";
import type { SectionRecord } from "@/lib/sections/types";

export function asRecord(value: unknown): SectionRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...(value as SectionRecord) };
  }
  return {};
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export function headingOf(data: unknown): string {
  return asString(asRecord(data).heading);
}

export function summarizeHeading(data: unknown, fallback: string): string {
  return headingOf(data) || fallback;
}

export function summarizeItems(data: unknown, fallback: string): string {
  const items = asRecord(data).items;
  if (!Array.isArray(items) || items.length === 0) {
    return headingOf(data) || fallback;
  }
  const first = asRecord(items[0]);
  const title = asString(first.title) || asString(first.name);
  const extra = items.length > 1 ? ` +${items.length - 1}` : "";
  return title ? `${title}${extra}` : headingOf(data) || fallback;
}

export function toJsonRecord(value: SectionRecord): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

export function mergeParsed<T extends SectionRecord>(
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } },
  value: unknown,
  fallback: T,
): T {
  const parsed = schema.safeParse({ ...fallback, ...asRecord(value) });
  return parsed.success ? parsed.data : fallback;
}

export { isSectionType } from "@/lib/sections/section-types";
