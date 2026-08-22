"use client";

import { useState } from "react";

import { chromeText } from "@/components/site/copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/locales";
import { subscribeNewsletter } from "@/server/actions/newsletter";

export function NewsletterForm({ locale }: { locale: Locale }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await subscribeNewsletter({
      email: String(formData.get("email") ?? ""),
      locale,
      website: String(formData.get("website") ?? ""),
    });
    setPending(false);
    setError(!result.ok);
    setMessage(
      result.ok ? chromeText(locale, "newsletterSuccess") : result.error || chromeText(locale, "newsletterError"),
    );
  }

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
    >
      <p className="font-medium">{chromeText(locale, "newsletterTitle")}</p>
      <p className="text-sm text-muted-foreground">{chromeText(locale, "newsletterHint")}</p>
      <div className="hidden" aria-hidden>
        <Input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="newsletter-email">
          {chromeText(locale, "newsletterPlaceholder")}
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={chromeText(locale, "newsletterPlaceholder")}
        />
        <Button type="submit" disabled={pending}>
          {chromeText(locale, "newsletterSubmit")}
        </Button>
      </div>
      {message ? (
        <p className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"} aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  );
}
