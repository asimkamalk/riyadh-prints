"use client";

import { useMemo, useState } from "react";

import { FaqAccordion } from "@/components/site/faq-accordion";
import { groupFaqs } from "@/components/site/faq-groups";
import { pageText } from "@/components/site/page-copy";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/locales";
import { headingSlug } from "@/lib/tiptap-toc";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type { FaqDto } from "@/types/content";

export function FaqBrowser({ locale, faqs }: { locale: Locale; faqs: FaqDto[] }) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => groupFaqs(faqs), [faqs]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return faqs;
    }
    return faqs.filter((faq) => {
      const answer = tiptapToPlainText(faq.answer).toLowerCase();
      return faq.question.toLowerCase().includes(needle) || answer.includes(needle);
    });
  }, [faqs, query]);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside className="grid gap-6 lg:sticky lg:top-28 lg:self-start">
        <div className="grid gap-2">
          <label htmlFor="faq-search" className="text-sm font-medium">
            {pageText(locale, "searchFaqs")}
          </label>
          <Input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={pageText(locale, "searchFaqs")}
          />
        </div>
        <nav aria-label={pageText(locale, "jumpTo")}>
          <p className="mb-3 text-sm font-medium">{pageText(locale, "jumpTo")}</p>
          <ul className="grid gap-1">
            {groups.map((group) => {
              const heading = group.heading || pageText(locale, "generalGroup");
              const id = headingSlug(heading);
              return (
                <li key={id}>
                  <a href={`#${id}`} className="block rounded-md px-3 py-1.5 text-sm hover:bg-muted">
                    {heading}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <div className="grid gap-10">
        {groupFaqs(filtered).map((group) => {
          const heading = group.heading || pageText(locale, "generalGroup");
          const id = headingSlug(heading);
          return (
            <section key={id} id={id} className="scroll-mt-28">
              <h2 className="mb-4 text-xl font-semibold">{heading}</h2>
              <FaqAccordion faqs={group.items.map((item) => ({ ...item, groupHeading: null }))} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
