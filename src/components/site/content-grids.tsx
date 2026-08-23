import { CategoryCard } from "@/components/site/category-card";
import { PostCard } from "@/components/site/post-card";
import { ProductCard } from "@/components/site/product-card";
import { ProjectCard } from "@/components/site/project-card";
import { ServiceCard } from "@/components/site/service-card";
import type { Locale } from "@/i18n/locales";
import type {
  CategorySummary,
  CategoryTreeNode,
  MediaDto,
  PostCard as PostCardDto,
  ProductCard as ProductCardDto,
  ProjectCard as ProjectCardDto,
  ServiceCard as ServiceCardDto,
} from "@/types/content";

export function ProductGrid({
  products,
  locale,
  appearance = "storefront",
  view = "grid",
}: {
  products: ProductCardDto[];
  locale: Locale;
  appearance?: "storefront" | "catalog";
  view?: "grid" | "list";
}) {
  if (view === "list") {
    return (
      <ul className="grid gap-6">
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} locale={locale} appearance="row" priority={index === 0} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            locale={locale}
            appearance={appearance}
            priority={index === 0}
          />
        </li>
      ))}
    </ul>
  );
}

export function PostGrid({ posts, locale }: { posts: PostCardDto[]; locale: Locale }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} locale={locale} />
        </li>
      ))}
    </ul>
  );
}

export function ProjectGrid({ projects }: { projects: ProjectCardDto[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}

export function ServiceGrid({
  services,
  locale,
}: {
  services: ServiceCardDto[];
  locale: Locale;
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <li key={service.id}>
          <ServiceCard service={service} locale={locale} />
        </li>
      ))}
    </ul>
  );
}

export function CategoryGrid({
  categories,
}: {
  categories: Array<CategorySummary & { shortDescription?: string | null; image?: MediaDto | null } | CategoryTreeNode>;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <li key={category.id}>
          <CategoryCard category={category} />
        </li>
      ))}
    </ul>
  );
}
