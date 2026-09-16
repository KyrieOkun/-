"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/provider";
import { apiFetch } from "@/lib/client";
import { isValidCNPhone } from "@/lib/utils";

export function OrderLookup() {
  const { t } = useI18n();
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderNo.trim()) return setError(t.order.notFound);
    if (!isValidCNPhone(phone)) return setError(t.forms.invalidPhone);
    setError(null);
    setLoading(true);
    const id = orderNo.trim().toUpperCase();
    const res = await apiFetch(`/api/orders/${encodeURIComponent(id)}?phone=${encodeURIComponent(phone)}`);
    setLoading(false);
    if (!res.ok) return setError(t.order.notFound);
    router.push(`/order/${id}?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl bg-white p-6 hairline sm:grid-cols-[1fr_1fr_auto]" noValidate>
      <div>
        <Label htmlFor="lk-order" required>{t.order.orderNo}</Label>
        <Input id="lk-order" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="MI-XXXXXX-XXXXXX" className="font-mono uppercase" />
      </div>
      <div>
        <Label htmlFor="lk-phone" required>{t.forms.phone}</Label>
        <Input id="lk-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
      </div>
      <div className="flex items-end">
        <Button type="submit" size="lg" className="h-12 w-full" loading={loading}>{t.order.lookup}</Button>
      </div>
      <div className="sm:col-span-3"><FieldError>{error}</FieldError></div>
    </form>
  );
}
