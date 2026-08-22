import { getSiteUrl } from "@/lib/utils/site-url";

const FALLBACK = "/admin";

function isSafeRelativePath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return false;
  }
  if (path.startsWith("/admin/login")) {
    return false;
  }
  return true;
}

/**
 * Prevents open redirects after sign-in. Allows same-origin absolute URLs
 * and relative paths; everything else falls back to /admin.
 */
export function safeCallbackUrl(raw: string | null | undefined): string {
  if (!raw) {
    return FALLBACK;
  }

  let path = raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      const site = new URL(getSiteUrl());
      if (url.origin !== site.origin) {
        return FALLBACK;
      }
      path = `${url.pathname}${url.search}`;
    } catch {
      return FALLBACK;
    }
  }

  return isSafeRelativePath(path) ? path : FALLBACK;
}
