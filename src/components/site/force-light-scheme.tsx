"use client";

import { useLayoutEffect } from "react";

/** Public pages stay light even if the admin theme toggle last set `dark` on <html>. */
export function ForceLightScheme() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);
  return null;
}
