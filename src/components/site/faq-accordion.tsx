import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type { FaqDto } from "@/types/content";

export function FaqAccordion({ faqs }: { faqs: FaqDto[] }) {
  if (faqs.length === 0) {
    return null;
  }
  const groups = groupFaqs(faqs);
  return (
    <div className="grid gap-8">
      {groups.map((group) => (
        <div key={group.heading ?? "default"} className="rounded-xl border px-4">
          {group.heading ? <p className="pt-4 text-base font-medium">{group.heading}</p> : null}
          <Accordion type="single" collapsible>
            {group.items.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-start">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{tiptapToPlainText(faq.answer)}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}

function groupFaqs(faqs: FaqDto[]): { heading: string | null; items: FaqDto[] }[] {
  const order: string[] = [];
  const map = new Map<string, FaqDto[]>();
  for (const faq of faqs) {
    const key = faq.groupHeading ?? "";
    if (!map.has(key)) {
      order.push(key);
      map.set(key, []);
    }
    map.get(key)?.push(faq);
  }
  return order.map((key) => ({
    heading: key || null,
    items: map.get(key) ?? [],
  }));
}
