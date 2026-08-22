/**
 * Cache tag helpers for `unstable_cache` / `revalidateTag`.
 * Server actions must invalidate with these exact strings after writes.
 */
export const tags = {
  product: (slug: string) => `product:${slug}`,
  products: () => "products",
  category: (slug: string) => `category:${slug}`,
  categories: () => "categories",
  service: (slug: string) => `service:${slug}`,
  services: () => "services",
  page: (slug: string) => `page:${slug}`,
  pages: () => "pages",
  post: (slug: string) => `post:${slug}`,
  posts: () => "posts",
  project: (slug: string) => `project:${slug}`,
  projects: () => "projects",
  faqs: (scope: string, id?: string) =>
    id ? `faqs:${scope}:${id}` : `faqs:${scope}`,
  menu: (location: string) => `menu:${location}`,
  settings: () => "settings",
  testimonials: () => "testimonials",
  sitemap: () => "sitemap",
  search: () => "search",
  global: () => "global",
} as const;
