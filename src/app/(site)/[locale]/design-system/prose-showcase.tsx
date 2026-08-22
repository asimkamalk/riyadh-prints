export function ProseShowcase({ rtl }: { rtl: boolean }) {
  return (
    <section aria-labelledby={rtl ? "prose-ar" : "prose-en"}>
      <h2 id={rtl ? "prose-ar" : "prose-en"} className="mb-md">
        Long-form prose
      </h2>
      {rtl ? (
        <article className="prose-rp">
          <p>
            مطبعة الرياض تطبع داخل المدينة: قمصان، هدايا شركات، لوحات، وتنفيذ
            حسب الموعد. لا سلة ولا دفع إلكتروني — الطلب يبدأ بطلب عرض سعر.
          </p>
          <blockquote>عرض السعر وواتساب هما الإجراءان الأساسيان.</blockquote>
          <ul>
            <li>طباعة محلية في الرياض</li>
            <li>مواعيد مكتوبة من الموافقة على البروفة</li>
            <li>أمر شراء واحد للملابس والهدايا واللوحات</li>
          </ul>
        </article>
      ) : (
        <article className="prose-rp">
          <p>
            Riyadh Prints produces in the city: apparel, corporate gifts, signage,
            and large format with dates given in writing. There is no cart and no
            checkout — work starts with a quote.
          </p>
          <blockquote>
            Request a Quote and WhatsApp are the only primary actions.
          </blockquote>
          <ul>
            <li>Printed in Riyadh, not imported</li>
            <li>Lead times from proof approval</li>
            <li>One purchase order across categories</li>
          </ul>
        </article>
      )}
    </section>
  );
}
