import Link from "next/link";

import { adminNavItemByHref } from "@/components/admin/nav-config";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AdminBreadcrumbs({ pathname }: { pathname: string }) {
  const current = adminNavItemByHref(pathname);
  const isNested = Boolean(current && pathname !== current.href);
  const leaf = pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {pathname === "/admin" ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={"/admin" as never}>Dashboard</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {current && current.href !== "/admin" ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {pathname === current.href ? (
                <BreadcrumbPage>{current.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={current.href as never}>{current.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        ) : null}
        {isNested && leaf ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="capitalize">{leaf}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
        {!current && pathname !== "/admin" && leaf ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="capitalize">{leaf}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
