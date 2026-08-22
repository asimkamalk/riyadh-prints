import type { CategoryDetail, ProductDetail, ServiceDetail } from "@/types/content";
import { absoluteUrl } from "@/lib/utils/site-url";

export function productJsonLd(product: ProductDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? undefined,
    sku: product.sku ?? undefined,
    image: product.images.map((image) => image.url),
    url: absoluteUrl(product.href),
    offers: product.basePrice
      ? {
          "@type": "Offer",
          price: product.basePrice,
          priceCurrency: "SAR",
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };
}

export function categoryJsonLd(category: CategoryDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.shortDescription ?? undefined,
    url: absoluteUrl(category.href),
    image: category.image?.url,
  };
}

export function serviceJsonLd(service: ServiceDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription ?? undefined,
    url: absoluteUrl(service.href),
    image: service.heroImage?.url ?? service.image?.url,
    areaServed: "Riyadh",
  };
}
