import { FaqAccordion } from "@/components/site/faq-accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { faqPage } from "@/lib/seo/json-ld";
import type { SectionRenderProps } from "@/lib/sections/types";

export function FaqRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  const faqs = resolved.faqs;
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} settings={settings} />
      <FaqAccordion faqs={faqs} />
      {faqs.length ? <JsonLd data={faqPage(faqs)} /> : null}
    </SectionShell>
  );
}
