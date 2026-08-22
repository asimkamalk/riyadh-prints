import type { DashboardActivityRow } from "@/server/queries/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function DashboardActivity({ rows }: { rows: DashboardActivityRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit events yet.</p>
        ) : (
          <ol className="grid gap-3">
            {rows.map((row) => (
              <li key={row.id} className="grid gap-0.5 text-sm">
                <p>
                  <span className="font-medium">{row.actor}</span>{" "}
                  <span className="text-muted-foreground">{row.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.entityType} · {row.entityId} · {formatWhen(row.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
