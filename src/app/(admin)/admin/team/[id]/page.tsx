import { notFound } from "next/navigation";

import { TeamEditor } from "@/components/admin/team/team-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { getAdminTeamMember } from "@/server/queries/admin-team";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return adminPageMetadata("Edit team member", `/admin/team/${id}`);
}

export default async function EditTeamMemberPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const member = await getAdminTeamMember(id);
  if (!member) {
    notFound();
  }
  return <TeamEditor member={member} canEdit={canEdit} />;
}
