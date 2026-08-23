import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { TeamTable } from "@/components/admin/team/team-table";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminTeamMembers } from "@/server/queries/admin-team";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export async function generateMetadata() {
  return adminPageMetadata("Team", "/admin/team");
}

export default async function AdminTeamPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = firstParam(params.query);
  const page = Math.max(1, Number(firstParam(params.page)) || 1);
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const result = await listAdminTeamMembers({ query: query || undefined, page });

  return (
    <div>
      <AdminPageHeader
        title="Team"
        description="Team profiles shown on /about and linked from the About page."
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/team", label: "Team" },
        ]}
        actions={
          canEdit ? (
            <Button asChild>
              <Link href={"/admin/team/new" as never}>New team member</Link>
            </Button>
          ) : null
        }
      />
      <TeamTable
        items={result.items}
        total={result.total}
        totalPages={result.totalPages}
        page={result.page}
        query={query}
        canEdit={canEdit}
      />
    </div>
  );
}
