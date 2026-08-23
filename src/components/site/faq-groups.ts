import type { FaqDto } from "@/types/content";

export type FaqGroup = {
  heading: string | null;
  items: FaqDto[];
};

export function groupFaqs(faqs: FaqDto[]): FaqGroup[] {
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
