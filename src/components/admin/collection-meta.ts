import type { FaqScope } from "@/generated/prisma/enums";
import type { SlugModel } from "@/lib/slug";

export type AdminCollectionMeta = {
  slug: string;
  href: string;
  slugModel?: SlugModel;
  pathPrefix: string;
  faqScope?: FaqScope;
  faqEntityKey?:
    | "productId"
    | "pageId"
    | "postId"
    | "serviceId"
    | "categoryId"
    | "projectId";
};

export const adminCollectionMeta: Record<string, AdminCollectionMeta> = {
  products: {
    slug: "products",
    href: "/admin/products",
    slugModel: "product",
    pathPrefix: "/product",
    faqScope: "PRODUCT",
    faqEntityKey: "productId",
  },
  categories: {
    slug: "categories",
    href: "/admin/categories",
    slugModel: "category",
    pathPrefix: "/product-category",
    faqScope: "CATEGORY",
    faqEntityKey: "categoryId",
  },
  "product-options": {
    slug: "product-options",
    href: "/admin/product-options",
    pathPrefix: "",
  },
  pages: {
    slug: "pages",
    href: "/admin/pages",
    slugModel: "page",
    pathPrefix: "",
    faqScope: "PAGE",
    faqEntityKey: "pageId",
  },
  services: {
    slug: "services",
    href: "/admin/services",
    slugModel: "service",
    pathPrefix: "/services",
    faqScope: "SERVICE",
    faqEntityKey: "serviceId",
  },
  posts: {
    slug: "posts",
    href: "/admin/posts",
    slugModel: "post",
    pathPrefix: "/blog",
    faqScope: "POST",
    faqEntityKey: "postId",
  },
  "blog-categories": {
    slug: "blog-categories",
    href: "/admin/blog-categories",
    slugModel: "category",
    pathPrefix: "/blog",
  },
  tags: {
    slug: "tags",
    href: "/admin/tags",
    slugModel: "tag",
    pathPrefix: "/blog/tags",
  },
  authors: {
    slug: "authors",
    href: "/admin/authors",
    slugModel: "author",
    pathPrefix: "/blog/authors",
  },
  portfolio: {
    slug: "portfolio",
    href: "/admin/portfolio",
    slugModel: "project",
    pathPrefix: "/portfolio",
    faqScope: "PROJECT",
    faqEntityKey: "projectId",
  },
  inquiries: {
    slug: "inquiries",
    href: "/admin/inquiries",
    pathPrefix: "",
  },
  faqs: {
    slug: "faqs",
    href: "/admin/faqs",
    pathPrefix: "/faqs",
    faqScope: "GLOBAL",
  },
};

export function isAdminCollection(slug: string): boolean {
  return slug in adminCollectionMeta;
}
