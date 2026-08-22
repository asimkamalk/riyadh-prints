import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type { SectionRenderProps } from "@/lib/sections/types";

export function FaqRenderer({ data, settings, headingLevel, resolved }: SectionRenderProps) {
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <Accordion type="single" collapsible className="rounded-xl border px-4">
        {resolved.faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-start">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{tiptapToPlainText(faq.answer)}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}
