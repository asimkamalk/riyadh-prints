"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useUnsavedChanges(isDirty: boolean) {
  const router = useRouter();

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isDirty) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      if (anchor.target === "_blank" || anchor.origin !== window.location.origin) {
        return;
      }
      if (anchor.pathname === window.location.pathname && anchor.search === window.location.search) {
        return;
      }
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      router.push(anchor.pathname as never);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isDirty, router]);
}
