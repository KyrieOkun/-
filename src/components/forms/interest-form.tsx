"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/provider";
import { isValidCNPhone, isValidEmail } from "@/lib/utils";

export function InterestForm({ vehicleSlug, vehicleName }: { vehicleSlug: string; vehicleName: string }) {
  const { t, locale } = useI18n();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(t.forms.invalidName);
    if (!isValidCNPhone(contact) && !isValidEmail(contact)) return setError(locale === "zh" ? "请输入手机号或邮箱" : "Enter a mobile number or email");
    setError(null);
    setState("loading");
    const res = await fetch("/api/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact, vehicleSlug }),
    });
    setState(res.ok ? "done" : "idle");
    if (!res.ok) setError(t.common.error);
  }

  if (state === "done") {
    return (
      <div className="rounded-3xl bg-success/10 p-6 text-success">
        <p className="font-semibold">{locale === "zh" ? "登记成功" : "You're on the list"}</p>
        <p className="mt-1 text-sm">{locale === "zh" ? `${vehicleName} 有引进信息时我们会第一时间通知您。` : `We'll notify you as soon as there's news on ${vehicleName}.`}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" noValidate>
      <div>
        <Label htmlFor="interest-name" required>{t.forms.name}</Label>
        <Input id="interest-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="interest-contact" required>{t.forms.phone} / {t.forms.email}</Label>
        <Input id="interest-contact" value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="tel" inputMode="text" />
      </div>
      <div className="flex items-end">
        <Button type="submit" size="lg" loading={state === "loading"} className="h-12 w-full sm:w-auto">
          {locale === "zh" ? "登记关注" : "Register interest"}
        </Button>
      </div>
      <FieldError>{error}</FieldError>
    </form>
  );
}
