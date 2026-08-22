import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { parseMediaSearchParams } from "@/components/admin/media/filters";
import { MediaLibrary } from "@/components/admin/media/library";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { MEDIA_PAGE_SIZE } from "@/lib/media-types";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminMediaPage, listMediaFolders } from "@/server/queries/media";

type MediaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata() {
  return adminPageMetadata("Media Library", "/admin/media");
}

export default async function AdminMediaPage({ searchParams }: MediaPageProps) {
  const filters = parseMediaSearchParams(await searchParams);
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const [result, folders] = await Promise.all([
    listAdminMediaPage({
      query: filters.query || undefined,
      folder: filters.folder || undefined,
      type: filters.type,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: filters.page,
      perPage: MEDIA_PAGE_SIZE,
    }),
    listMediaFolders(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Upload, organize, and reuse images across the site."
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/media", label: "Media Library" },
        ]}
      />
      <MediaLibrary
        items={result.items}
        total={result.total}
        totalPages={result.totalPages}
        folders={folders}
        filters={filters}
        canEdit={canEdit}
      />
    </div>
  );
}
