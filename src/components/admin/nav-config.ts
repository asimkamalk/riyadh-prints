import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  FileText,
  FolderTree,
  ClipboardList,
  ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  LineChart,
  ListTree,
  Mail,
  Map,
  Megaphone,
  Menu,
  MessageSquareQuote,
  Newspaper,
  Package,
  PenLine,
  Puzzle,
  Search,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  Tags,
  Users,
  Waypoints,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  keywords: string;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: readonly AdminNavItem[];
};

export const adminNav: readonly AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        keywords: "home overview stats",
      },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue",
    items: [
      {
        href: "/admin/products",
        label: "Products",
        icon: Package,
        keywords: "catalogue print",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: FolderTree,
        keywords: "taxonomy",
      },
      {
        href: "/admin/product-options",
        label: "Product Options",
        icon: SlidersHorizontal,
        keywords: "variants sizes paper",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: FileText, keywords: "cms" },
      {
        href: "/admin/pages/builder",
        label: "Page Builder",
        icon: LayoutTemplate,
        keywords: "sections blocks",
      },
      {
        href: "/admin/services",
        label: "Services",
        icon: Puzzle,
        keywords: "printing services",
      },
      {
        href: "/admin/posts",
        label: "Blog Posts",
        icon: PenLine,
        keywords: "articles news",
      },
      {
        href: "/admin/blog-categories",
        label: "Blog Categories",
        icon: ListTree,
        keywords: "blog taxonomy",
      },
      { href: "/admin/tags", label: "Tags", icon: Tags, keywords: "labels" },
      {
        href: "/admin/authors",
        label: "Authors",
        icon: Users,
        keywords: "writers",
      },
      {
        href: "/admin/portfolio",
        label: "Portfolio",
        icon: Library,
        keywords: "projects work",
      },
    ],
  },
  {
    id: "site",
    label: "Site",
    items: [
      { href: "/admin/menus", label: "Menus", icon: Menu, keywords: "nav" },
      {
        href: "/admin/banners",
        label: "Banners",
        icon: Megaphone,
        keywords: "hero promo",
      },
      {
        href: "/admin/testimonials",
        label: "Testimonials",
        icon: MessageSquareQuote,
        keywords: "reviews",
      },
      {
        href: "/admin/partners",
        label: "Partners",
        icon: Share2,
        keywords: "logos clients",
      },
      {
        href: "/admin/stats",
        label: "Stats",
        icon: LineChart,
        keywords: "numbers",
      },
      { href: "/admin/faqs", label: "FAQs", icon: MessageSquareQuote, keywords: "questions" },
    ],
  },
  {
    id: "leads",
    label: "Leads",
    items: [
      {
        href: "/admin/inquiries",
        label: "Quote Requests",
        icon: Mail,
        keywords: "leads quotes rfq",
      },
      {
        href: "/admin/newsletter",
        label: "Newsletter",
        icon: Newspaper,
        keywords: "subscribers",
      },
    ],
  },
  {
    id: "seo",
    label: "SEO",
    items: [
      {
        href: "/admin/seo",
        label: "Meta Overview",
        icon: Search,
        keywords: "meta titles",
      },
      {
        href: "/admin/redirects",
        label: "Redirects",
        icon: ArrowRightLeft,
        keywords: "301 302",
      },
      {
        href: "/admin/sitemap",
        label: "Sitemap",
        icon: Map,
        keywords: "xml",
      },
      {
        href: "/admin/schema",
        label: "Schema Defaults",
        icon: Waypoints,
        keywords: "json-ld structured",
      },
      {
        href: "/admin/robots",
        label: "Robots",
        icon: Shield,
        keywords: "robots.txt",
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        href: "/admin/media",
        label: "Media Library",
        icon: ImageIcon,
        keywords: "images files",
      },
      { href: "/admin/users", label: "Users", icon: Users, keywords: "staff" },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
        keywords: "site config",
      },
      {
        href: "/admin/audit",
        label: "Audit Log",
        icon: ClipboardList,
        keywords: "history activity",
      },
    ],
  },
] as const;

export function flattenAdminNav(): AdminNavItem[] {
  return adminNav.flatMap((group) => [...group.items]);
}

export function adminNavItemByHref(pathname: string): AdminNavItem | undefined {
  const items = flattenAdminNav();
  const exact = items.find((item) => item.href === pathname);
  if (exact) {
    return exact;
  }
  return items
    .filter((item) => item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export const entityCollectionHrefs = {
  product: "/admin/products",
  category: "/admin/categories",
  service: "/admin/services",
  page: "/admin/pages",
  post: "/admin/posts",
  project: "/admin/portfolio",
  inquiry: "/admin/inquiries",
  media: "/admin/media",
} as const;
