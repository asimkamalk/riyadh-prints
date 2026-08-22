import type { Prisma } from "@/generated/prisma/client";
import type { ContentStatus } from "@/generated/prisma/enums";

import { prisma } from "@/server/db";

import { ActionError } from "./_helpers";

export function notFound(entity: string): never {
  throw new ActionError(`${entity} was not found.`, "NOT_FOUND");
}

export function nextStatus(current: ContentStatus): ContentStatus {
  return current === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
}

export async function reorderTransaction(
  items: { id: string; sortOrder: number }[],
  run: (id: string, sortOrder: number) => Prisma.PrismaPromise<unknown>,
): Promise<void> {
  await prisma.$transaction(items.map((item) => run(item.id, item.sortOrder)));
}

export function copySuffix(slug: string): string {
  return slug.endsWith("-copy") ? `${slug}-2` : `${slug}-copy`;
}

export function toInputJson(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return {};
  }
  return value as Prisma.InputJsonValue;
}
