"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { VehicleSummary } from "@/data/types";
import type { Store } from "@/data/site";
import type { City } from "@/data/cities";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, isValidCNPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/primitives";

const SLOTS = ["09:00-11:00", "11:00-13:00", "13:00-15:00", "15:00-17:00", "17:00-19:00", "19:00-21:00"];

function nextDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 1; i <= n; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`);
  }
  return out;
}

export function TestDriveForm({ vehicles, stores, cities, initialVehicle }: { vehicles: VehicleSummary[]; stores: Store[]; cities: City[]; initialVehicle?: string }) {
  const { t, pick, locale } = useI18n();
  const orderable = vehicles.filter((v) => v.availability !== "overseas");
  const [vehicleSlug, setVehicleSlug] = useState(orderable.some((v) => v.slug === initialVehicle) ? (initialVehicle as string) : orderable[0].slug);
  const vehicle = orderable.find((v) => v.slug === vehicleSlug) ?? orderable[0];
  const [mode, setMode] = useState<"store" | "home">("store");
  const [cityId, setCityId] = useState("beijing");
  const cityStores = useMemo(() => stores.filter((s) => s.cityId === cityId && s.brands.includes(vehicle.brand)), [stores, cityId, vehicle.brand]);
  const [storeId, setStoreId] = useState<string>("");
  const effectiveStore = cityStores.some((s) => s.id === storeId) ? storeId : cityStores[0]?.id ?? "";
  const days = useMemo(() => nextDays(14), []);
  const [date, setDate] = useState(days[0]);
  const [slot, setSlot] = useState(SLOTS[1]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<{ id: string } | null>(null);

  const citiesWithStores = cities.filter((c) => stores.some((s) => s.cityId === c.id));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(t.forms.invalidName);
    if (!isValidCNPhone(phone)) return setError(t.forms.invalidPhone);
    if (mode === "store" && !effectiveStore) return setError(locale === "zh" ? "该城市暂无此品牌门店，请选择上门试驾" : "No store for this brand in the city — choose at-home");
    if (mode === "home" && address.trim().length < 5) return setError(locale === "zh" ? "请填写上门试驾地址" : "Enter your address");
    if (!agree) return setError(t.forms.mustAgree);
    setError(null);
    setLoading(true);
    const res = await apiFetch<{ booking: { id: string } }>("/api/test-drive", {
      method: "POST",
      json: { name, phone, vehicleSlug, mode, storeId: mode === "store" ? effectiveStore : undefined, city: pick(cities.find((c) => c.id === cityId)?.name ?? { zh: "", en: "" }), address: mode === "home" ? address : undefined, date, slot, note: note || undefined, agree: true },
    });
    setLoading(false);
    if (!res.ok || !res.data) return setError(t.common.error);
    setBooking(res.data.booking);
  }

  if (booking) {
    const st = stores.find((s) => s.id === effectiveStore);
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center hairline">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h2 className="mt-4 text-2xl font-semibold">{t.testDrive.successTitle}</h2>
        <p className="mt-2 text-slate">{t.testDrive.successBody}</p>
        <dl className="mt-8 grid gap-3 rounded-2xl bg-cloud p-5 text-left text-sm">
          <div className="flex justify-between"><dt className="text-slate">{t.testDrive.bookingNo}</dt><dd className="font-mono font-semibold">{booking.id}</dd></div>
          <div className="flex justify-between"><dt className="text-slate">{t.forms.model}</dt><dd className="font-medium">{pick(vehicle.name)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate">{t.forms.date}</dt><dd className="font-medium">{date} · {slot}</dd></div>
          <div className="flex justify-between"><dt className="text-slate">{mode === "store" ? t.forms.store : t.testDrive.door}</dt><dd className="max-w-[60%] text-right font-medium">{mode === "store" ? pick(st?.name ?? { zh: "", en: "" }) : address}</dd></div>
        </dl>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => setBooking(null)} variant="secondary">{t.testDrive.another}</Button>
          <Button href={`/vehicles/${vehicle.slug}/design`}>{t.nav.design}</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]" noValidate>
      <div className="min-w-0 space-y-8">
        <section>
          <h2 className="text-lg font-semibold">{t.forms.model}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {orderable.map((v) => {
              const active = v.slug === vehicleSlug;
              return (
                <button key={v.slug} type="button" onClick={() => setVehicleSlug(v.slug)} aria-pressed={active} className={cn("overflow-hidden rounded-2xl border text-left transition-all focus-ring", active ? "border-ink ring-1 ring-ink" : "border-line hover:border-ash")}>
                  <div className="relative aspect-[16/9] bg-mist">
                    <Image src={v.hero.src} alt="" fill sizes="240px" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ash"><span className={cn("size-1.5 rounded-full", v.brand === "xiaomi" ? "bg-mi" : "bg-tesla")} />{v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</p>
                    <p className="mt-0.5 truncate text-sm font-semibold">{pick(v.name)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{locale === "zh" ? "试驾方式" : "Format"}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["store", "home"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={cn("rounded-2xl border p-4 text-left transition-all focus-ring", mode === m ? "border-ink ring-1 ring-ink" : "border-line hover:border-ash")}>
                <p className="font-semibold">{m === "store" ? t.testDrive.inStore : t.testDrive.door}</p>
                <p className="mt-1 text-xs text-slate">{m === "store" ? (locale === "zh" ? "到最近的体验中心，全系车型可选" : "Visit your nearest experience centre") : (locale === "zh" ? "顾问将车开到您指定地点" : "A specialist brings the car to you")}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="td-city" required>{t.forms.city}</Label>
              <Select id="td-city" value={cityId} onChange={(e) => setCityId(e.target.value)}>
                {citiesWithStores.map((c) => (
                  <option key={c.id} value={c.id}>{pick(c.name)}</option>
                ))}
              </Select>
            </div>
            {mode === "store" ? (
              <div>
                <Label htmlFor="td-store" required>{t.forms.store}</Label>
                <Select id="td-store" value={effectiveStore} onChange={(e) => setStoreId(e.target.value)}>
                  {cityStores.length === 0 ? <option value="">{locale === "zh" ? "该城市暂无门店" : "No store in this city"}</option> : null}
                  {cityStores.map((s) => (
                    <option key={s.id} value={s.id}>{pick(s.name)}</option>
                  ))}
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="td-address" required>{locale === "zh" ? "上门地址" : "Address"}</Label>
                <Input id="td-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={locale === "zh" ? "小区 / 写字楼 / 门牌号" : "Street, building, unit"} />
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarDays className="size-5" />{t.forms.date}</h2>
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => {
              const [y, m, day] = d.split("-").map(Number);
              const dt = new Date(y, m - 1, day);
              const active = d === date;
              return (
                <button key={d} type="button" onClick={() => setDate(d)} aria-pressed={active} className={cn("flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 text-sm transition-colors focus-ring", active ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}>
                  <span className="text-[10px] uppercase opacity-70">{dt.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { weekday: "short" })}</span>
                  <span className="mt-1 text-base font-semibold tabular-nums">{dt.getDate()}</span>
                  <span className="text-[10px] opacity-70">{dt.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { month: "short" })}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SLOTS.map((s) => (
              <button key={s} type="button" onClick={() => setSlot(s)} aria-pressed={slot === s} className={cn("h-10 rounded-xl border text-xs font-medium tabular-nums transition-colors focus-ring", slot === s ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}>{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{locale === "zh" ? "联系方式" : "Contact"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="td-name" required>{t.forms.name}</Label>
              <Input id="td-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="td-phone" required>{t.forms.phone}</Label>
              <Input id="td-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="13800000000" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="td-note" hint={t.common.optionalField}>{t.forms.message}</Label>
              <Textarea id="td-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
            </div>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm text-graphite">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-4 rounded accent-ink" />
            <span>{t.forms.agree} <a href="/legal/privacy" className="underline" target="_blank">{t.forms.privacy}</a>{locale === "zh" ? "，同意顾问通过电话与您联系" : ", and to be contacted by a product specialist"}</span>
          </label>
          <FieldError>{error}</FieldError>
        </section>
      </div>

      <aside className="h-fit rounded-3xl bg-cloud p-6 hairline lg:sticky lg:top-24">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-mist">
          <Image src={vehicle.hero.src} alt={pick(vehicle.hero.alt)} fill sizes="380px" className="object-cover" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">{pick(vehicle.name)}</h3>
        <p className="text-sm text-slate">{pick(vehicle.tagline)}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-slate">{locale === "zh" ? "方式" : "Format"}</dt><dd className="font-medium">{mode === "store" ? t.testDrive.inStore : t.testDrive.door}</dd></div>
          <div className="flex justify-between"><dt className="text-slate">{t.forms.date}</dt><dd className="font-medium tabular-nums">{date} · {slot}</dd></div>
          <div className="flex justify-between"><dt className="text-slate">{t.forms.city}</dt><dd className="font-medium">{pick(cities.find((c) => c.id === cityId)?.name ?? { zh: "", en: "" })}</dd></div>
        </dl>
        <Button type="submit" size="lg" fullWidth className="mt-6" loading={loading}>{t.testDrive.title}</Button>
        <p className="mt-3 text-center text-xs text-ash">{locale === "zh" ? "免费试驾 · 30 分钟内电话确认" : "Free · phone confirmation within 30 minutes"}</p>
      </aside>
    </form>
  );
}
