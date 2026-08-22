import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/utils/site-url";

type Crumb = { href?: string; label: string };

export function AdminPageHeader({
  title,
  description,
  crumbs,
}: {
  title: string;
  description?: string;
  crumbs: readonly Crumb[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? {
            item: item.href.startsWith("http")
              ? item.href
              : absoluteUrl(item.href),
          }
        : {}),
    })),
  };

  return (
    <header className="mb-6 grid gap-1">
      <JsonLd data={jsonLd} />
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
