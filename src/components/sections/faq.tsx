import { FaqAccordion } from "@/components/site/faq-accordion";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import type { SectionRenderProps } from "@/lib/sections/types";

export function FaqRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <FaqAccordion faqs={resolved.faqs} />
    </SectionShell>
  );
}
