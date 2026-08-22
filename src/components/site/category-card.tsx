import Link from "next/link";

import { SiteImage } from "@/components/site/site-image";
import type { CategorySummary, CategoryTreeNode, MediaDto } from "@/types/content";

type CategoryCardData = CategorySummary & {
  shortDescription?: string | null;
  image?: MediaDto | null;
};

export function CategoryCard({
  category,
}: {
  category: CategoryCardData | CategoryTreeNode;
}) {
  const image = "image" in category ? category.image : null;
  const description = "shortDescription" in category ? category.shortDescription : null;
  return (
    <article className="group h-full overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-elevate-1">
      <Link href={category.href as never} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <SiteImage
              media={image}
              alt={image.alt || category.name}
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 100vw"
              className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <div className="grid gap-1 p-4">
          <h3 className="font-medium">{category.name}</h3>
          {description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
