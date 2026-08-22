"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { chromeText } from "@/components/site/copy";
import { QuoteField, QuoteSelect, type QuoteOption } from "@/components/site/quote-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/locales";
import { submitInquiry, uploadInquiryAttachment } from "@/server/actions/inquiry";

const quoteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().min(8).max(30),
  company: z.string().trim().max(120).optional(),
  serviceId: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
  honeypot: z.string().max(200).optional(),
});

type QuoteValues = z.infer<typeof quoteSchema>;

export type { QuoteOption };

export function QuoteRequestForm({
  locale,
  whatsappHref,
  services,
  products,
  defaultProductId,
  defaultServiceId,
  submitLabel,
}: {
  locale: Locale;
  whatsappHref: string;
  services: QuoteOption[];
  products: QuoteOption[];
  defaultProductId?: string;
  defaultServiceId?: string;
  submitLabel?: string;
}) {
  const startedAt = useMemo(() => Date.now(), []);
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      serviceId: defaultServiceId ?? "",
      productId: defaultProductId ?? "",
      quantity: "",
      message: "",
      website: "",
      honeypot: "",
    },
  });

  async function onSubmit(values: QuoteValues) {
    setFormError(null);
    let fileUrls: string[] | undefined;
    if (file) {
      const data = new FormData();
      data.append("file", file);
      const uploaded = await uploadInquiryAttachment(data);
      if (!uploaded.ok) {
        setFormError(uploaded.error);
        return;
      }
      fileUrls = [uploaded.data.url];
    }
    const serviceName = services.find((item) => item.id === values.serviceId)?.name;
    const result = await submitInquiry({
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company || undefined,
      serviceId: values.serviceId || undefined,
      productId: values.productId || undefined,
      serviceInterest: serviceName,
      quantity: values.quantity || undefined,
      message: values.message,
      locale,
      website: values.website,
      honeypot: values.honeypot,
      formStartedAt: startedAt,
      fileUrls,
    });
    if (!result.ok) {
      setFormError(result.error || chromeText(locale, "quoteError"));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid max-w-xl gap-4 rounded-xl border p-6">
        <p className="font-medium">{chromeText(locale, "quoteSuccess")}</p>
        {whatsappHref ? (
          <Button asChild variant="accent">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              {chromeText(locale, "quoteWhatsapp")}
            </a>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form className="grid max-w-xl gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <div className="hidden" aria-hidden>
        <Input tabIndex={-1} autoComplete="off" {...form.register("website")} />
        <Input tabIndex={-1} autoComplete="off" {...form.register("honeypot")} />
      </div>
      <QuoteField id="quote-name" label={chromeText(locale, "quoteName")} error={form.formState.errors.name?.message}>
        <Input id="quote-name" autoComplete="name" {...form.register("name")} />
      </QuoteField>
      <QuoteField id="quote-email" label={chromeText(locale, "quoteEmail")} error={form.formState.errors.email?.message}>
        <Input id="quote-email" type="email" autoComplete="email" {...form.register("email")} />
      </QuoteField>
      <QuoteField id="quote-phone" label={chromeText(locale, "quotePhone")} error={form.formState.errors.phone?.message}>
        <Input id="quote-phone" type="tel" autoComplete="tel" {...form.register("phone")} />
      </QuoteField>
      <QuoteField id="quote-company" label={chromeText(locale, "quoteCompany")}>
        <Input id="quote-company" autoComplete="organization" {...form.register("company")} />
      </QuoteField>
      {services.length ? (
        <QuoteField id="quote-service" label={chromeText(locale, "quoteService")}>
          <QuoteSelect id="quote-service" locale={locale} options={services} {...form.register("serviceId")} />
        </QuoteField>
      ) : null}
      {products.length ? (
        <QuoteField id="quote-product" label={chromeText(locale, "quoteProduct")}>
          <QuoteSelect id="quote-product" locale={locale} options={products} {...form.register("productId")} />
        </QuoteField>
      ) : null}
      <QuoteField id="quote-qty" label={chromeText(locale, "quoteQuantity")}>
        <Input id="quote-qty" {...form.register("quantity")} />
      </QuoteField>
      <QuoteField id="quote-message" label={chromeText(locale, "quoteMessage")} error={form.formState.errors.message?.message}>
        <Textarea id="quote-message" rows={5} {...form.register("message")} />
      </QuoteField>
      <QuoteField id="quote-file" label={chromeText(locale, "quoteFile")}>
        <Input
          id="quote-file"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </QuoteField>
      {formError ? <p role="alert" className="text-sm text-destructive">{formError}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {submitLabel || chromeText(locale, "quoteSubmit")}
        </Button>
        {whatsappHref ? (
          <Button asChild variant="outline">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              {chromeText(locale, "quoteWhatsapp")}
            </a>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
