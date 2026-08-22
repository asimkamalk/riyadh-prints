import Link from "next/link";

import type { DashboardProductRow } from "@/server/queries/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardTopProducts({ rows }: { rows: DashboardProductRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top-viewed products</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No published products yet.</p>
        ) : (
          <ol className="grid gap-2">
            {rows.map((row, index) => (
              <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
                <Link href={`/admin/products/${row.id}` as never} className="min-w-0 truncate hover:underline">
                  <span className="text-muted-foreground me-2 tabular-nums">{index + 1}.</span>
                  {row.name}
                </Link>
                <span className="text-muted-foreground shrink-0 tabular-nums">{row.viewCount} views</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
