import { ContactFormClient } from "@/components/sections/contact-form-client";
import { SectionIntro, SectionShell, dataString } from "@/components/sections/shell";
import { asString } from "@/lib/sections/parse";
import type { SectionRenderProps } from "@/lib/sections/types";

export function ContactFormRenderer({ data, settings, headingLevel, locale }: SectionRenderProps) {
  const variant = asString(settings.variant, "contact") === "quote" ? "quote" : "contact";
  return (
    <SectionShell settings={settings}>
      <SectionIntro heading={dataString(data, "heading")} headingLevel={headingLevel} />
      <ContactFormClient
        locale={locale}
        submitLabel={dataString(data, "submit")}
        variant={variant}
      />
    </SectionShell>
  );
}
