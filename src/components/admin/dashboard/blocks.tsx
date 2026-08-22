import {
  DashboardActivity,
} from "@/components/admin/dashboard/activity-feed";
import { DashboardInquiries } from "@/components/admin/dashboard/inquiries-panel";
import { DashboardSeoHealth } from "@/components/admin/dashboard/seo-health";
import { DashboardStatCards } from "@/components/admin/dashboard/stat-cards";
import { DashboardTopProducts } from "@/components/admin/dashboard/top-products";
import {
  getDashboardActivity,
  getDashboardInquiries,
  getDashboardSeoHealth,
  getDashboardStats,
  getDashboardTopProducts,
} from "@/server/queries/admin-dashboard";

export async function DashboardStatsBlock() {
  const stats = await getDashboardStats();
  return <DashboardStatCards stats={stats} />;
}

export async function DashboardInquiriesBlock() {
  const rows = await getDashboardInquiries();
  return <DashboardInquiries rows={rows} />;
}

export async function DashboardTopProductsBlock() {
  const rows = await getDashboardTopProducts();
  return <DashboardTopProducts rows={rows} />;
}

export async function DashboardSeoBlock() {
  const issues = await getDashboardSeoHealth();
  return <DashboardSeoHealth issues={issues} />;
}

export async function DashboardActivityBlock() {
  const rows = await getDashboardActivity();
  return <DashboardActivity rows={rows} />;
}
