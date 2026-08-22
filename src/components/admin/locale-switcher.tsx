"use client";

import { useTransition } from "react";

import type { Locale } from "@/i18n/locales";
import { Button } from "@/components/ui/button";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_EDIT_LOCALE_COOKIE,
} from "@/components/admin/cookies";

type LocaleSwitcherProps = {
  value: Locale;
};

export function LocaleSwitcher({ value }: LocaleSwitcherProps) {
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    startTransition(() => {
      document.cookie = `${ADMIN_EDIT_LOCALE_COOKIE}=${next}; path=/; max-age=${ADMIN_COOKIE_MAX_AGE}; samesite=lax`;
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center rounded-md border border-border p-0.5" role="group" aria-label="Content locale">
      <Button
        type="button"
        size="xs"
        variant={value === "en" ? "secondary" : "ghost"}
        disabled={pending}
        onClick={() => setLocale("en")}
      >
        EN
      </Button>
      <Button
        type="button"
        size="xs"
        variant={value === "ar" ? "secondary" : "ghost"}
        disabled={pending}
        onClick={() => setLocale("ar")}
      >
        AR
      </Button>
    </div>
  );
}
