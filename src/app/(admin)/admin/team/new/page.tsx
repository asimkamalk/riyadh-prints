import { TeamEditor } from "@/components/admin/team/team-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";

export async function generateMetadata() {
  return adminPageMetadata("New team member", "/admin/team/new");
}

export default async function NewTeamMemberPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  return <TeamEditor member={null} canEdit={canEdit} />;
}
