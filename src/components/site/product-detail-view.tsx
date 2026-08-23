import { TiptapBody } from "@/components/sections/tiptap-body";
import { Breadcrumbs, type Crumb } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/site/content-chrome";
import { ProductGrid } from "@/components/site/content-grids";
import { DraftPreviewBanner } from "@/components/site/draft-preview-banner";
import { formatStartingPrice } from "@/components/site/format";
import { mediaToGalleryItem } from "@/components/site/gallery-types";
import { pageText } from "@/components/site/page-copy";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductTabs } from "@/components/site/product-tabs";
import { OptionsList, PriceTiersTable, SpecsTable } from "@/components/site/product-tables";
import { QuoteCta } from "@/components/site/quote-cta";
import type { Locale } from "@/i18n/locales";
import { parseKvRows, parseStringList } from "@/lib/catalogue-json";
import { productFromDetail } from "@/lib/seo/json-ld";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type { FaqDto, ProductCard, ProductDetail } from "@/types/content";

export function ProductDetailView({
  locale,
  product,
  faqs,
  related,
  crumbs,
  isPreview,
  quoteHref,
  whatsappHref,
}: {
  locale: Locale;
  product: ProductDetail;
  faqs: FaqDto[];
  related: ProductCard[];
  crumbs: Crumb[];
  isPreview: boolean;
  quoteHref: string;
  whatsappHref: string;
}) {
  const specs = parseKvRows(product.specifications);
  const materials = parseStringList(product.materials);
  const gallery = (product.images.length ? product.images : product.primaryImage ? [product.primaryImage] : [])
    .map((image) => mediaToGalleryItem({ ...image, alt: image.alt || product.name }));
  const price = formatStartingPrice(locale, product.basePrice, product.priceUnit);
  const hasLong = Boolean(tiptapToPlainText(product.longDescription));

  return (
    <article className="container-page py-xl">
      {isPreview ? <DraftPreviewBanner /> : null}
      <Breadcrumbs items={crumbs} />
      <JsonLd data={productFromDetail(product)} />
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery items={gallery} locale={locale} />
        <div className="grid gap-4 self-start">
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          {product.shortDescription ? (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          ) : null}
          {price ? <p className="text-lg font-medium">{price}</p> : null}
          <QuoteCta
            locale={locale}
            quoteHref={quoteHref}
            whatsappHref={whatsappHref}
            quoteLabel={pageText(locale, "quoteThis")}
          />
        </div>
      </div>
      <PriceTiersTable locale={locale} tiers={product.priceTiers} />
      <OptionsList locale={locale} options={product.options} />
      <SpecsTable locale={locale} rows={specs} />
      {materials.length ? (
        <p className="mt-6 text-sm">
          <span className="text-muted-foreground">{pageText(locale, "materials")}: </span>
          {materials.join(", ")}
        </p>
      ) : null}
      {hasLong ? (
        <ProductTabs
          locale={locale}
          quoteHref={quoteHref}
          whatsappHref={whatsappHref}
          description={
            <div className="prose-rp prose-rp-wide">
              <TiptapBody value={product.longDescription} />
            </div>
          }
        />
      ) : null}
      <FaqSection locale={locale} faqs={faqs} />
      {related.length ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">{pageText(locale, "related")}</h2>
          <ProductGrid products={related} locale={locale} />
        </section>
      ) : null}
    </article>
  );
}
