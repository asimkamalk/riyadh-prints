import { NextResponse, type NextRequest } from "next/server";

import { tags } from "@/lib/cache-tags";
import { normalizePathname } from "@/lib/pathname";

export type RedirectMapEntry = {
  destination: string;
  type: "PERMANENT" | "TEMPORARY";
};

export type RedirectMap = Record<string, RedirectMapEntry>;

export function lookupRedirect(
  pathname: string,
  map: RedirectMap,
): RedirectMapEntry | null {
  const source = normalizePathname(pathname);
  const hit = map[source];
  if (!hit) {
    return null;
  }
  if (normalizePathname(hit.destination) === source) {
    return null;
  }
  return hit;
}

export function destinationUrl(destination: string, request: NextRequest): URL {
  if (destination.startsWith("http://") || destination.startsWith("https://")) {
    return new URL(destination);
  }
  return new URL(destination, request.nextUrl.origin);
}

export function redirectStatus(type: RedirectMapEntry["type"]): 301 | 302 {
  return type === "PERMANENT" ? 301 : 302;
}

/**
 * Loads the redirect map via the tagged Data Cache (the route uses
 * `unstable_cache` + `tags.redirects()`). Middleware stays on the Edge and
 * never talks to Postgres directly.
 */
export async function loadRedirectMapForMiddleware(
  request: NextRequest,
): Promise<RedirectMap> {
  try {
    const url = new URL("/api/redirects", request.nextUrl.origin);
    const response = await fetch(url, {
      next: { tags: [tags.redirects()] },
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return {};
    }
    const body: unknown = await response.json();
    if (!body || typeof body !== "object") {
      return {};
    }
    return body as RedirectMap;
  } catch {
    return {};
  }
}

export function applyCachedRedirect(
  request: NextRequest,
  map: RedirectMap,
): NextResponse | null {
  const hit = lookupRedirect(request.nextUrl.pathname, map);
  if (!hit) {
    return null;
  }
  return NextResponse.redirect(
    destinationUrl(hit.destination, request),
    redirectStatus(hit.type),
  );
}
