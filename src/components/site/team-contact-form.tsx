"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { chromeText } from "@/components/site/copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/locales";
import { submitInquiry } from "@/server/actions/inquiry";

const teamContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
  honeypot: z.string().max(200).optional(),
});

type TeamContactValues = z.infer<typeof teamContactSchema>;

const copy = {
  en: {
    fullName: "Full Name",
    email: "Email Address",
    message: "Message",
    send: "Send Message",
    success: "Thank you — your message was sent.",
  },
  ar: {
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    message: "الرسالة",
    send: "إرسال الرسالة",
    success: "شكراً — تم إرسال رسالتكم.",
  },
} as const;

export function TeamContactForm({
  locale,
  memberName,
  memberPhone,
}: {
  locale: Locale;
  memberName: string;
  memberPhone?: string | null;
}) {
  const text = copy[locale];
  const startedAt = useMemo(() => Date.now(), []);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<TeamContactValues>({
    resolver: zodResolver(teamContactSchema),
    defaultValues: { name: "", email: "", message: "", website: "", honeypot: "" },
  });

  async function onSubmit(values: TeamContactValues) {
    setFormError(null);
    const result = await submitInquiry({
      name: values.name,
      email: values.email,
      phone: memberPhone?.trim() || "0000000000",
      message: `[Contact for ${memberName}]\n\n${values.message}`,
      serviceInterest: `Team: ${memberName}`,
      locale,
      website: values.website,
      honeypot: values.honeypot,
      formStartedAt: startedAt,
    });
    if (!result.ok) {
      setFormError(result.error || chromeText(locale, "quoteError"));
      return;
    }
    setDone(true);
  }

  if (done) {
    return <p className="rounded-xl border p-4 text-sm">{text.success}</p>;
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="team-contact-name">{text.fullName}</Label>
          <Input id="team-contact-name" autoComplete="name" {...form.register("name")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="team-contact-email">{text.email}</Label>
          <Input id="team-contact-email" type="email" autoComplete="email" {...form.register("email")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="team-contact-message">{text.message}</Label>
        <Textarea id="team-contact-message" rows={6} {...form.register("message")} />
      </div>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...form.register("website")} />
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...form.register("honeypot")} />
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      <Button type="submit" className="w-fit rounded-full px-6">
        {text.send}
        <ArrowUpRight className="size-4" aria-hidden />
      </Button>
    </form>
  );
}
