const scale = [
  { label: "h1", className: "text-h1 font-bold" },
  { label: "h2", className: "text-h2 font-bold" },
  { label: "h3", className: "text-h3 font-semibold" },
  { label: "h4", className: "text-h4 font-semibold" },
  { label: "h5", className: "text-h5 font-semibold" },
  { label: "h6", className: "text-h6 font-semibold" },
] as const;

export function TypeShowcase({ rtl }: { rtl: boolean }) {
  const sample = rtl
    ? "مطبعة الرياض للطباعة الفاخرة"
    : "Riyadh Prints premium type";

  return (
    <section aria-labelledby={rtl ? "type-ar" : "type-en"}>
      <h2 id={rtl ? "type-ar" : "type-en"} className="mb-md">
        Type scale
      </h2>
      <p className="mb-lg text-muted-foreground">
        Fluid <code>clamp()</code> sizes. Latin is Plus Jakarta Sans; Arabic is IBM
        Plex Sans Arabic when <code>dir=&quot;rtl&quot;</code>.
      </p>
      <div className="space-y-md">
        {scale.map((row) => (
          <div key={row.label} className="border-b border-border pb-sm">
            <p className="mb-2xs text-xs tracking-wide text-muted-foreground uppercase">
              {row.label}
            </p>
            <p className={row.className}>{sample}</p>
          </div>
        ))}
        <p>
          {rtl
            ? "نص المتن بمقياس مرن. طباعة حسب طلب السعر للشركات في الرياض — بلا سلة وبلا دفع."
            : "Body copy at the fluid scale. Quote-request printing for companies in Riyadh — no cart, no checkout, one conversation."}
        </p>
      </div>
    </section>
  );
}
