"use client";

export type FaqPreviewItem = {
  id: string;
  question: string;
  answer: string;
};

export function FaqRichResultPreview({ items }: { items: FaqPreviewItem[] }) {
  const visible = items.filter((item) => item.question.trim());
  return (
    <section className="rounded-lg border p-4">
      <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        How this looks in Google
      </p>
      <div className="max-w-[640px] font-sans">
        <p className="text-sm text-[#202124] dark:text-foreground">riyadhprints.com › faqs</p>
        <p className="text-xl text-[#1a0dab] dark:text-blue-400">Frequently asked questions</p>
        <ul className="mt-3 divide-y rounded-md border">
          {visible.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">Add a question to preview the FAQ rich result.</li>
          ) : (
            visible.slice(0, 4).map((item) => (
              <li key={item.id} className="grid gap-1 p-3">
                <p className="text-sm font-medium">{item.question}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.answer || "Answer"}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
