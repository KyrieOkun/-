"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Wrench } from "lucide-react";
import type { Vehicle } from "@/data/types";
import type { Store } from "@/data/site";
import type { City } from "@/data/cities";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, isValidCNPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/primitives";

const SLOTS = ["08:30-10:30", "10:30-12:30", "13:30-15:30", "15:30-17:30"];

export function ServiceForm({ vehicles, stores, cities }: { vehicles: Vehicle[]; stores: Store[]; cities: City[] }) {
  const { t, pick, locale } = useI18n();
  const zh = locale === "zh";
  const types = [
    { id: "maintenance", label: zh ? "常规保养" : "Maintenance" },
    { id: "repair", label: zh ? "故障维修" : "Repair" },
    { id: "bodywork", label: zh ? "钣金喷漆" : "Body & paint" },
    { id: "tyres", label: zh ? "轮胎 / 四轮定位" : "Tyres / alignment" },
    { id: "software", label: zh ? "软件 / 智驾检查" : "Software / ADAS check" },
    { id: "mobile-charging", label: zh ? "上门充电" : "Mobile charging" },
    { id: "pickup", label: zh ? "取送车" : "Pick-up & delivery" },
  ] as const;
  const [brand, setBrand] = useState<"xiaomi" | "tesla">("xiaomi");
  const brandVehicles = vehicles.filter((v) => v.brand === brand && v.availability !== "overseas");
  const [vehicleSlug, setVehicleSlug] = useState(brandVehicles[0]?.slug ?? "");
  const [plate, setPlate] = useState("");
  const [serviceType, setServiceType] = useState<(typeof types)[number]["id"]>("maintenance");
  const [cityId, setCityId] = useState("beijing");
  const cityStores = useMemo(() => stores.filter((s) => s.cityId === cityId && s.brands.includes(brand) && (s.type === "service" || s.type === "flagship")), [stores, cityId, brand]);
  const [storeId, setStoreId] = useState("");
  const effectiveStore = cityStores.some((s) => s.id === storeId) ? storeId : cityStores[0]?.id ?? "";
  const [valet, setValet] = useState(false);
  const days = useMemo(() => Array.from({ length: 10 }).map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }), []);
  const [date, setDate] = useState(days[0]);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(t.forms.invalidName);
    if (!isValidCNPhone(phone)) return setError(t.forms.invalidPhone);
    if (!agree) return setError(t.forms.mustAgree);
    setError(null);
    setLoading(true);
    const res = await apiFetch<{ booking: { id: string } }>("/api/service", { method: "POST", json: { name, phone, brand, vehicleSlug: vehicleSlug || undefined, plate: plate || undefined, serviceType, storeId: effectiveStore || undefined, valet, date, slot, note: note || undefined, agree: true } });
    setLoading(false);
    if (!res.ok || !res.data) return setError(t.common.error);
    setDone(res.data.booking);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center hairline">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h2 className="mt-4 text-2xl font-semibold">{zh ? "预约成功" : "Booked"}</h2>
        <p className="mt-2 text-slate">{zh ? "服务顾问将在 30 分钟内确认，取送车服务会提前一天与您联系。" : "A service advisor will confirm within 30 minutes; valet pick-up is arranged the day before."}</p>
        <p className="mt-4 font-mono text-sm font-semibold">{done.id}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => setDone(null)}>{zh ? "再预约一次" : "Book another"}</Button>
          <Button href="/connect/garage">{t.connect.garage}</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]" noValidate>
      <div className="space-y-6 rounded-3xl bg-white p-6 hairline">
        <div>
          <Label>{t.connect.brand}</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["xiaomi", "tesla"] as const).map((b) => (
              <button key={b} type="button" onClick={() => { setBrand(b); setVehicleSlug(vehicles.find((v) => v.brand === b && v.availability !== "overseas")?.slug ?? ""); }} aria-pressed={brand === b} className={cn("flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors focus-ring", brand === b ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}>
                <span className={cn("size-1.5 rounded-full", b === "xiaomi" ? "bg-mi" : "bg-tesla")} />{b === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sv-vehicle">{t.connect.model}</Label>
            <Select id="sv-vehicle" value={vehicleSlug} onChange={(e) => setVehicleSlug(e.target.value)}>
              {brandVehicles.map((v) => (
                <option key={v.slug} value={v.slug}>{pick(v.name)}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sv-plate" hint={t.common.optionalField}>{t.forms.licensePlate}</Label>
            <Input id="sv-plate" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="京A·D12345" />
          </div>
        </div>
        <div>
          <Label>{zh ? "服务类型" : "Service type"}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {types.map((ty) => (
              <button key={ty.id} type="button" onClick={() => setServiceType(ty.id)} aria-pressed={serviceType === ty.id} className={cn("h-11 rounded-xl border px-2 text-xs font-medium transition-colors focus-ring", serviceType === ty.id ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}>{ty.label}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sv-city" required>{t.forms.city}</Label>
            <Select id="sv-city" value={cityId} onChange={(e) => setCityId(e.target.value)}>
              {cities.filter((c) => stores.some((s) => s.cityId === c.id)).map((c) => (
                <option key={c.id} value={c.id}>{pick(c.name)}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sv-store">{t.support.serviceCenters}</Label>
            <Select id="sv-store" value={effectiveStore} onChange={(e) => setStoreId(e.target.value)}>
              {cityStores.length === 0 ? <option value="">{zh ? "由移动服务车上门" : "Mobile service van"}</option> : null}
              {cityStores.map((s) => (
                <option key={s.id} value={s.id}>{pick(s.name)}</option>
              ))}
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={valet} onChange={(e) => setValet(e.target.checked)} className="size-4 rounded accent-ink" />
          {zh ? "需要上门取送车（免费，50 km 内）" : "Valet pick-up & return (free within 50 km)"}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sv-date" required>{t.forms.date}</Label>
            <Select id="sv-date" value={date} onChange={(e) => setDate(e.target.value)}>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sv-slot" required>{t.forms.time}</Label>
            <Select id="sv-slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
              {SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sv-name" required>{t.forms.name}</Label>
            <Input id="sv-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sv-phone" required>{t.forms.phone}</Label>
            <Input id="sv-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sv-note" hint={t.common.optionalField}>{t.forms.message}</Label>
            <Textarea id="sv-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={zh ? "描述问题或需求，例如：右前轮异响" : "Describe the issue, e.g. noise from the front-right wheel"} />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-graphite">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-4 rounded accent-ink" />
          <span>{t.forms.agree} <a href="/legal/privacy" className="underline" target="_blank">{t.forms.privacy}</a></span>
        </label>
        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" loading={loading} icon={<Wrench className="size-4" />}>{t.connect.service}</Button>
      </div>
      <aside className="h-fit rounded-3xl bg-cloud p-6 hairline lg:sticky lg:top-24">
        <h3 className="font-semibold">{zh ? "服务承诺" : "Service promise"}</h3>
        <ul className="mt-4 space-y-2 text-sm text-graphite">
          {(zh
            ? ["全国 300+ 服务中心与移动服务车", "原厂配件、原厂标准工时", "维保进度实时推送到账户与 App", "24 小时道路救援 400-800-0000"]
            : ["300+ service centres and mobile vans", "Genuine parts, factory labour standards", "Live progress in your account and app", "24h roadside assistance 400-800-0000"]
          ).map((s) => (
            <li key={s} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{s}</li>
          ))}
        </ul>
      </aside>
    </form>
  );
}
