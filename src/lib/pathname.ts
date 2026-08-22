/**
 * Path helpers safe to import from Edge middleware (no Prisma / Node APIs).
 */
export function normalizePathname(path: string): string {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }
  return path === "" ? "/" : path;
}
