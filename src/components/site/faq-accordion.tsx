"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TiptapBody } from "@/components/sections/tiptap-body";
import { groupFaqs } from "@/components/site/faq-groups";
import { cn } from "@/lib/utils";
import type { FaqDto } from "@/types/content";

export function FaqAccordion({
  faqs,
  appearance = "pills",
}: {
  faqs: FaqDto[];
  appearance?: "pills" | "contained";
}) {
  if (faqs.length === 0) {
    return null;
  }
  const groups = groupFaqs(faqs);
  const pills = appearance === "pills";
  return (
    <div className="grid gap-8">
      {groups.map((group) => (
        <div key={group.heading ?? "default"} className={cn(!pills && "rounded-xl border px-4")}>
          {group.heading ? (
            <p className={cn("text-base font-medium", pills ? "mb-3" : "pt-4")}>{group.heading}</p>
          ) : null}
          <Accordion type="single" collapsible className={cn(pills && "grid gap-3")}>
            {group.items.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className={cn(pills && "overflow-hidden rounded-2xl border-0 bg-card px-5 shadow-sm ring-1 ring-border")}
              >
                <AccordionTrigger
                  indicator={pills ? "plus" : "chevron"}
                  className={cn(
                    "text-start text-base font-semibold hover:no-underline",
                    pills && "hover:text-primary data-[state=open]:text-primary",
                  )}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose-rp max-w-none text-sm text-muted-foreground">
                    <TiptapBody value={faq.answer} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
