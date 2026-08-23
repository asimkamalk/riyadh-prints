"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/** Re-apply the stored admin theme after leaving a public (forced-light) page. */
export function AdminThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const stored = window.localStorage.getItem("rp-admin-theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, [setTheme]);

  return null;
}
