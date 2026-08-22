import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import { cachedQuery } from "@/server/queries/_shared";

export type DashboardStat = {
  label: string;
  value: number;
  href: string;
};

export type DashboardInquiryRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
};

export type DashboardProductRow = {
  id: string;
  name: string;
  slug: string;
  viewCount: number;
};

export type SeoHealthIssue = {
  id: string;
  title: string;
  href: string;
  problems: string[];
};

export type DashboardActivityRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  createdAt: string;
};

function weekAgo(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export function getDashboardStats(): Promise<DashboardStat[]> {
  return cachedQuery({
    key: ["admin-dashboard-stats"],
    tags: [tags.global(), tags.products(), tags.pages(), tags.posts()],
    revalidate: 30,
    fn: async () => {
      const since = weekAgo();
      const [publishedProducts, publishedPages, publishedPosts, newInquiries] =
        await Promise.all([
          prisma.product.count({ where: { status: "PUBLISHED" } }),
          prisma.page.count({ where: { status: "PUBLISHED" } }),
          prisma.post.count({ where: { status: "PUBLISHED" } }),
          prisma.inquiry.count({ where: { createdAt: { gte: since } } }),
        ]);
      return [
        { label: "Published products", value: publishedProducts, href: "/admin/products" },
        { label: "Published pages", value: publishedPages, href: "/admin/pages" },
        { label: "Published posts", value: publishedPosts, href: "/admin/posts" },
        { label: "New inquiries this week", value: newInquiries, href: "/admin/inquiries" },
      ];
    },
  });
}

export function getDashboardInquiries(): Promise<DashboardInquiryRow[]> {
  return cachedQuery({
    key: ["admin-dashboard-inquiries"],
    tags: [tags.global()],
    revalidate: 30,
    fn: async () => {
      const rows = await prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, name: true, email: true, status: true, createdAt: true },
      });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      }));
    },
  });
}

export function getDashboardTopProducts(): Promise<DashboardProductRow[]> {
  return cachedQuery({
    key: ["admin-dashboard-top-products"],
    tags: [tags.products()],
    revalidate: 30,
    fn: async () => {
      const rows = await prisma.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: {
          id: true,
          slug: true,
          viewCount: true,
          translations: { where: { locale: "EN" }, select: { name: true }, take: 1 },
        },
      });
      return rows.map((row) => ({
        id: row.id,
        name: row.translations[0]?.name ?? row.slug,
        slug: row.slug,
        viewCount: row.viewCount,
      }));
    },
  });
}

export function getDashboardSeoHealth(): Promise<SeoHealthIssue[]> {
  return cachedQuery({
    key: ["admin-dashboard-seo"],
    tags: [tags.pages()],
    revalidate: 30,
    fn: async () => {
      const pageRows = await prisma.page.findMany({
        where: { status: "PUBLISHED" },
        take: 40,
        select: {
          id: true,
          slug: true,
          translations: {
            where: { locale: "EN" },
            select: { title: true, metaDescription: true },
            take: 1,
          },
        },
      });
      const seoIssues: SeoHealthIssue[] = [];
      for (const page of pageRows) {
        const tr = page.translations[0];
        const problems: string[] = [];
        if (!tr?.metaDescription?.trim()) {
          problems.push("Missing meta description");
        }
        if (!tr?.title?.trim()) {
          problems.push("Missing H1");
        }
        if (problems.length > 0) {
          seoIssues.push({
            id: page.id,
            title: tr?.title ?? page.slug,
            href: `/admin/pages/${page.id}`,
            problems,
          });
        }
      }
      return seoIssues.slice(0, 8);
    },
  });
}

export function getDashboardActivity(): Promise<DashboardActivityRow[]> {
  return cachedQuery({
    key: ["admin-dashboard-activity"],
    tags: [tags.global()],
    revalidate: 15,
    fn: async () => {
      const activity = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      });
      return activity.map((row) => ({
        id: row.id,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        actor: row.user?.name ?? row.user?.email ?? "System",
        createdAt: row.createdAt.toISOString(),
      }));
    },
  });
}
