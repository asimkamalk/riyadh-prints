import type { Locale } from "@/i18n/locales";

export const ADMIN_SIDEBAR_COOKIE = "admin.sidebar.collapsed";
export const ADMIN_EDIT_LOCALE_COOKIE = "admin.edit-locale";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseSidebarCollapsed(value: string | undefined): boolean {
  return value === "1";
}

export function parseEditLocale(value: string | undefined): Locale {
  return value === "ar" ? "ar" : "en";
}
