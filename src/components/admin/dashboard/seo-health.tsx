import Link from "next/link";

import type { SeoHealthIssue } from "@/server/queries/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardSeoHealth({ issues }: { issues: SeoHealthIssue[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO health</CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Published pages have a title (H1) and a meta description.
          </p>
        ) : (
          <ul className="grid gap-3">
            {issues.map((issue) => (
              <li key={issue.id} className="grid gap-1">
                <Link href={issue.href as never} className="text-sm font-medium hover:underline">
                  {issue.title}
                </Link>
                <div className="flex flex-wrap gap-1">
                  {issue.problems.map((problem) => (
                    <Badge key={problem} variant="outline">
                      {problem}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
