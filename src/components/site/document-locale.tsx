"use client";

import { useEffect } from "react";

import { localeDir, localeLang, type Locale } from "@/i18n/locales";

export function DocumentLocale({ locale }: { locale: Locale }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = localeLang(locale);
    root.dir = localeDir(locale);
  }, [locale]);
  return null;
}
