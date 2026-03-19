"use client";

import { useEffect } from "react";

export default function FormConfirmGuard() {
  useEffect(() => {
    const onSubmit = (event: Event) => {
      const submitEvent = event as SubmitEvent;
      const submitter = submitEvent.submitter as HTMLElement | null;
      const message = submitter?.getAttribute("data-confirm");
      if (!message) return;

      const ok = window.confirm(message);
      if (!ok) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}
