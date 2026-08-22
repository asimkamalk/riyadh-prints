import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  DashboardActivityBlock,
  DashboardInquiriesBlock,
  DashboardSeoBlock,
  DashboardStatsBlock,
  DashboardTopProductsBlock,
} from "@/components/admin/dashboard/blocks";
import {
  DashboardPanelSkeleton,
  DashboardStatsSkeleton,
} from "@/components/admin/dashboard/skeletons";
import { adminPageMetadata } from "@/components/admin/page-meta";

export const generateMetadata = () => adminPageMetadata("Dashboard", "/admin");

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="Publishing, inquiries, SEO gaps, and recent staff activity."
        crumbs={[
          { href: "/admin", label: "Dashboard" },
        ]}
      />
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStatsBlock />
      </Suspense>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<DashboardPanelSkeleton />}>
            <DashboardInquiriesBlock />
          </Suspense>
        </div>
        <Suspense fallback={<DashboardPanelSkeleton className="h-72 rounded-xl" />}>
          <DashboardTopProductsBlock />
        </Suspense>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<DashboardPanelSkeleton />}>
          <DashboardSeoBlock />
        </Suspense>
        <Suspense fallback={<DashboardPanelSkeleton />}>
          <DashboardActivityBlock />
        </Suspense>
      </div>
    </div>
  );
}
