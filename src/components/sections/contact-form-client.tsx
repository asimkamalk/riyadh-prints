"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/locales";
import { submitInquiry } from "@/server/actions/inquiry";

export function ContactFormClient({
  locale,
  submitLabel,
  variant,
}: {
  locale: Locale;
  submitLabel: string;
  variant: "contact" | "quote";
}) {
  const [startedAt] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const messageMin = variant === "quote" ? 10 : 10;

  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await submitInquiry({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      company: String(formData.get("company") ?? "") || undefined,
      message: String(formData.get("message") ?? ""),
      locale,
      website: String(formData.get("website") ?? ""),
      formStartedAt: startedAt,
    });
    setPending(false);
    if (result.ok) {
      toast.success(locale === "ar" ? "تم إرسال الرسالة." : "Message sent.");
      return;
    }
    toast.error(result.error ?? "Could not send.");
  }

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
    >
      <div className="hidden" aria-hidden>
        <Input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Field id="inquiry-name" name="name" label={locale === "ar" ? "الاسم" : "Name"} required />
      <Field id="inquiry-email" name="email" label={locale === "ar" ? "البريد" : "Email"} type="email" required />
      <Field id="inquiry-phone" name="phone" label={locale === "ar" ? "الهاتف" : "Phone"} required />
      <Field id="inquiry-company" name="company" label={locale === "ar" ? "الشركة" : "Company"} />
      <div className="grid gap-2">
        <Label htmlFor="inquiry-message">{locale === "ar" ? "الرسالة" : "Message"}</Label>
        <Textarea id="inquiry-message" name="message" rows={5} required minLength={messageMin} />
      </div>
      <Button type="submit" disabled={pending}>
        {submitLabel || (locale === "ar" ? "إرسال" : "Submit")}
      </Button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} required={required} />
    </div>
  );
}
