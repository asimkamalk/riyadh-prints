import { tags } from "@/lib/cache-tags";
import type { RedirectMap } from "@/lib/middleware-redirects";
import { prisma } from "@/server/db";
import { cachedQuery } from "@/server/queries/_shared";

export type { RedirectMap, RedirectMapEntry } from "@/lib/middleware-redirects";

async function loadRedirectMap(): Promise<RedirectMap> {
  const rows = await prisma.redirect.findMany({
    where: { isActive: true },
    select: { source: true, destination: true, type: true },
  });
  const map: RedirectMap = {};
  for (const row of rows) {
    map[row.source] = { destination: row.destination, type: row.type };
  }
  return map;
}

/**
 * Cached lookup table for middleware. Invalidated with `tags.redirects()`.
 */
export function getRedirectMap(): Promise<RedirectMap> {
  return cachedQuery({
    key: ["redirect-map", "v2"],
    tags: [tags.redirects()],
    fn: loadRedirectMap,
  });
}
