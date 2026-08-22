import { QuoteRequestForm } from "@/components/site/quote-request-form";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import type { SectionRenderProps } from "@/lib/sections/types";

export function ContactFormRenderer({ data, settings, headingLevel, locale, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <QuoteRequestForm
        locale={locale}
        whatsappHref={resolved.whatsappUrl}
        submitLabel={dataString(data, "submit")}
        services={resolved.services.map((service) => ({ id: service.id, name: service.name }))}
        products={resolved.products.map((product) => ({ id: product.id, name: product.name }))}
      />
    </SectionShell>
  );
}
