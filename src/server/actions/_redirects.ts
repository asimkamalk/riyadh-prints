import type { CategoryKind } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/locales";
import { prisma } from "@/server/db";
import {
  categoryHref,
  pageHref,
  postHref,
  productHref,
  projectHref,
  serviceHref,
} from "@/server/queries/_shared";

export function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }
  return path;
}

export type RedirectEntityType =
  | "product"
  | "category"
  | "service"
  | "page"
  | "post"
  | "project";

export function entityPublicPath(
  entityType: RedirectEntityType,
  slug: string,
  locale: Locale,
  extra?: { kind?: CategoryKind; pageSegments?: string[] },
): string {
  switch (entityType) {
    case "product":
      return productHref(locale, slug);
    case "category":
      return categoryHref(locale, extra?.kind ?? "PRODUCT", slug);
    case "service":
      return serviceHref(locale, slug);
    case "page":
      return pageHref(locale, extra?.pageSegments ?? [slug]);
    case "post":
      return postHref(locale, slug);
    case "project":
      return projectHref(locale, slug);
  }
}

/**
 * Creates (or updates) a PERMANENT redirect from an old public path to a new one.
 * Rewrites any existing redirects that already pointed at the old path, and
 * drops a redirect whose source is the new path to avoid loops.
 */
export async function ensurePermanentRedirect(
  oldPath: string,
  newPath: string,
  note?: string,
): Promise<{ created: boolean; source: string; destination: string }> {
  const source = normalizePath(oldPath);
  const destination = normalizePath(newPath);
  if (source === destination) {
    return { created: false, source, destination };
  }

  await prisma.$transaction(async (tx) => {
    await tx.redirect.deleteMany({ where: { source: destination } });
    await tx.redirect.updateMany({
      where: { destination: source },
      data: { destination },
    });
    const existing = await tx.redirect.findUnique({ where: { source } });
    if (existing) {
      await tx.redirect.update({
        where: { source },
        data: {
          destination,
          type: "PERMANENT",
          isActive: true,
          note: note ?? existing.note,
        },
      });
    } else {
      await tx.redirect.create({
        data: {
          source,
          destination,
          type: "PERMANENT",
          isActive: true,
          note,
        },
      });
    }
  });

  return { created: true, source, destination };
}

export async function redirectOnPublishedSlugChange(args: {
  published: boolean;
  entityType: RedirectEntityType;
  oldSlug: string;
  newSlug: string;
  locale: Locale;
  kind?: CategoryKind;
  pageSegmentsOld?: string[];
  pageSegmentsNew?: string[];
}): Promise<{ created: boolean } | null> {
  if (!args.published || args.oldSlug === args.newSlug) {
    return null;
  }
  return ensurePermanentRedirect(
    entityPublicPath(args.entityType, args.oldSlug, args.locale, {
      kind: args.kind,
      pageSegments: args.pageSegmentsOld,
    }),
    entityPublicPath(args.entityType, args.newSlug, args.locale, {
      kind: args.kind,
      pageSegments: args.pageSegmentsNew,
    }),
    `${args.entityType} slug change`,
  );
}
