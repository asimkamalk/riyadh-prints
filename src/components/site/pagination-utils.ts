export function paginationWindow(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) {
    items.push("ellipsis");
  }
  for (let n = start; n <= end; n += 1) {
    items.push(n);
  }
  if (end < totalPages - 1) {
    items.push("ellipsis");
  }
  items.push(totalPages);
  return items;
}

export function pageSearchHref(pathname: string, page: number, extra: URLSearchParams | string = ""): string {
  const params = extra instanceof URLSearchParams ? extra : new URLSearchParams(extra);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
