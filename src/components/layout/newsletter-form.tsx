"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { isValidEmail } from "@/lib/utils";

export function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="mt-3 text-sm font-medium text-success-deep">{t.footer.subscribed}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex max-w-sm gap-2" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        {t.forms.email}
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        placeholder={t.forms.email}
        aria-invalid={state === "error"}
        className="h-10 flex-1 rounded-pill border border-line bg-white px-4 text-sm outline-none placeholder:text-ash focus:border-ink aria-[invalid=true]:border-danger"
      />
      <Button type="submit" size="sm" loading={state === "loading"} className="h-10">
        {t.footer.subscribe}
      </Button>
    </form>
  );
}
