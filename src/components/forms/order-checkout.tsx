"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import type { Vehicle, VehicleSelection } from "@/data/types";
import type { Store } from "@/data/site";
import type { City } from "@/data/cities";
import { computeQuote, encodeSelection } from "@/lib/pricing";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatCNY, isValidCNPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/primitives";
import { PaintSwatch } from "@/components/vehicles/swatches";

export function OrderCheckout({ vehicle, selection, stores, cities }: { vehicle: Vehicle; selection: VehicleSelection; stores: Store[]; cities: City[] }) {
  const { t, pick, locale } = useI18n();
  const router = useRouter();
  const quote = useMemo(() => computeQuote(vehicle, selection), [vehicle, selection]);
  const deliveryStores = stores.filter((s) => (s.type === "delivery" || s.type === "flagship" || s.type === "experience") && s.brands.includes(vehicle.brand));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [idType, setIdType] = useState<"id-card" | "passport" | "business">("id-card");
  const [idLast4, setIdLast4] = useState("");
  const [city, setCity] = useState("beijing");
  const [storeId, setStoreId] = useState(deliveryStores[0]?.id ?? "");
  const [financing, setFinancing] = useState<"cash" | "loan" | "lease">("cash");
  const [payment, setPayment] = useState<"wechat" | "alipay" | "card">("wechat");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(t.forms.invalidName);
    if (!isValidCNPhone(phone)) return setError(t.forms.invalidPhone);
    if (!/^[0-9A-Za-z]{4}$/.test(idLast4)) return setError(locale === "zh" ? "请输入证件号后 4 位" : "Enter the last 4 characters of your ID");
    if (!storeId) return setError(locale === "zh" ? "请选择交付中心" : "Choose a delivery centre");
    if (!agree) return setError(t.forms.mustAgree);
    setError(null);
    setLoading(true);
    const res = await apiFetch<{ order: { id: string } }>("/api/orders", {
      method: "POST",
      json: {
        vehicleSlug: vehicle.slug,
        ...selection,
        buyer: { name, phone, idType, idLast4, city: pick(cities.find((c) => c.id === city)?.name ?? { zh: city, en: city }) },
        deliveryStoreId: storeId,
        financing,
        payment,
        agree: true,
      },
    });
    setLoading(false);
    if (!res.ok || !res.data) return setError(t.common.error);
    router.push(`/order/${res.data.order.id}?phone=${encodeURIComponent(phone)}`);
  }

  const idTypeLabel = { "id-card": locale === "zh" ? "身份证" : "ID card", passport: locale === "zh" ? "护照" : "Passport", business: locale === "zh" ? "企业营业执照" : "Business licence" } as const;

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_420px]" noValidate>
      <div className="space-y-8">
        <section className="rounded-3xl bg-white p-6 hairline">
          <h2 className="text-lg font-semibold">{t.order.buyer}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="o-name" required>{t.forms.name}</Label>
              <Input id="o-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="o-phone" required>{t.forms.phone}</Label>
              <Input id="o-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
            </div>
            <div>
              <Label htmlFor="o-idtype" required>{locale === "zh" ? "证件类型" : "ID type"}</Label>
              <Select id="o-idtype" value={idType} onChange={(e) => setIdType(e.target.value as typeof idType)}>
                {(Object.keys(idTypeLabel) as (keyof typeof idTypeLabel)[]).map((k) => (
                  <option key={k} value={k}>{idTypeLabel[k]}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="o-id4" required hint={locale === "zh" ? "仅需后 4 位，用于交付核验" : "Last 4 only, for delivery verification"}>{locale === "zh" ? "证件号后 4 位" : "ID last 4"}</Label>
              <Input id="o-id4" value={idLast4} onChange={(e) => setIdLast4(e.target.value.slice(0, 4))} maxLength={4} className="font-mono" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 hairline">
          <h2 className="text-lg font-semibold">{t.order.deliveryCenter}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="o-city" required>{locale === "zh" ? "上牌城市" : "Registration city"}</Label>
              <Select id="o-city" value={city} onChange={(e) => setCity(e.target.value)}>
                {cities.slice(0, 40).map((c) => (
                  <option key={c.id} value={c.id}>{pick(c.name)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="o-store" required>{t.order.deliveryCenter}</Label>
              <Select id="o-store" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
                {deliveryStores.map((s) => (
                  <option key={s.id} value={s.id}>{pick(s.name)}</option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 hairline">
          <h2 className="text-lg font-semibold">{t.order.financing}</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(["cash", "loan", "lease"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFinancing(f)} aria-pressed={financing === f} className={cn("rounded-2xl border p-4 text-left transition-all focus-ring", financing === f ? "border-ink ring-1 ring-ink" : "border-line hover:border-ash")}>
                <p className="font-semibold">{t.order[f]}</p>
                <p className="mt-1 text-xs text-slate">
                  {f === "cash" ? formatCNY(quote.total) : f === "loan" ? `${formatCNY(quote.monthly)}${t.common.perMonth}` : `${formatCNY(Math.round(quote.subtotal * 0.0125))}${t.common.perMonth}`}
                </p>
              </button>
            ))}
          </div>
          {financing !== "cash" ? <p className="mt-3 text-xs text-ash">{t.configurator.monthlyNote}</p> : null}
        </section>

        <section className="rounded-3xl bg-white p-6 hairline">
          <h2 className="text-lg font-semibold">{t.order.payment}</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(["wechat", "alipay", "card"] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPayment(p)} aria-pressed={payment === p} className={cn("rounded-2xl border p-4 text-center font-medium transition-all focus-ring", payment === p ? "border-ink ring-1 ring-ink" : "border-line hover:border-ash")}>
                {t.order[p]}
              </button>
            ))}
          </div>
          <label className="mt-5 flex items-start gap-2 text-sm text-graphite">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-4 rounded accent-ink" />
            <span>
              {t.forms.agree} <Link href="/legal/terms" className="underline" target="_blank">{t.forms.terms}</Link> {t.common.and} <Link href="/legal/privacy" className="underline" target="_blank">{t.forms.privacy}</Link>{locale === "zh" ? "，并知悉" : ", and understand the "} {t.order.refundNote}
            </span>
          </label>
          <FieldError>{error}</FieldError>
        </section>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-3xl bg-white hairline">
          <div className="relative aspect-[16/9] bg-mist">
            <Image src={quote.paint.image ?? vehicle.hero.src} alt={`${pick(vehicle.name)} · ${pick(quote.paint.name)}`} fill sizes="420px" className="object-cover" />
          </div>
          <div className="p-6">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ash"><span className={cn("size-1.5 rounded-full", vehicle.brand === "xiaomi" ? "bg-mi" : "bg-tesla")} />{vehicle.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</p>
            <h3 className="mt-1 text-xl font-semibold">{pick(vehicle.name)} · {pick(quote.trim.name)}</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-slate"><PaintSwatch paint={quote.paint} size={14} />{pick(quote.paint.name)}</dt><dd className="tabular-nums">{quote.paintPrice ? formatCNY(quote.paintPrice) : t.common.included}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate">{pick(quote.wheel.name)}</dt><dd className="tabular-nums">{quote.wheelPrice ? formatCNY(quote.wheelPrice) : t.common.included}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate">{pick(quote.interior.name)}</dt><dd className="tabular-nums">{quote.interiorPrice ? formatCNY(quote.interiorPrice) : t.common.included}</dd></div>
              {quote.extras.map((e) => (
                <div key={e.id} className="flex items-center justify-between"><dt className="text-slate">{pick(e.name)}</dt><dd className="tabular-nums">{formatCNY(e.price)}</dd></div>
              ))}
              <div className="my-2 border-t border-line" />
              <div className="flex justify-between"><dt className="text-slate">{t.configurator.vehiclePrice}</dt><dd className="font-medium tabular-nums">{formatCNY(quote.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate">{t.configurator.purchaseTax}</dt><dd className="tabular-nums">{formatCNY(quote.purchaseTax)}</dd></div>
              <div className="flex justify-between text-base"><dt className="font-semibold">{t.configurator.totalPrice}</dt><dd className="font-semibold tabular-nums">{formatCNY(quote.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate">{t.configurator.deliveryEta}</dt><dd className="tabular-nums">{quote.deliveryWeeks[0]}-{quote.deliveryWeeks[1]} {t.common.weeks}</dd></div>
            </dl>
            <Link href={`/vehicles/${vehicle.slug}/design?${encodeSelection(selection)}`} className="mt-3 inline-block text-xs text-graphite underline-offset-4 hover:underline">{t.common.edit} {t.order.config}</Link>
          </div>
        </div>
        <div className="rounded-3xl bg-ink p-6 text-white">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-white/70">{t.order.payDeposit}</p>
            <p className="text-3xl font-semibold tabular-nums">{formatCNY(quote.deposit)}</p>
          </div>
          <Button type="submit" variant="light" size="lg" fullWidth className="mt-5" loading={loading} icon={<Lock className="size-4" />}>
            {loading ? t.order.paying : `${t.order.payDeposit} · ${t.order[payment]}`}
          </Button>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-white/60"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" />{t.order.refundNote}</p>
        </div>
      </aside>
    </form>
  );
}
