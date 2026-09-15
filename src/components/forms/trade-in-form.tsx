"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeftRight, CheckCircle2 } from "lucide-react";
import type { Vehicle } from "@/data/types";
import type { TradeInEstimate } from "@/lib/trade-in";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatCNY, formatDate, isValidCNPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/primitives";

const BRANDS = ["小米汽车 Xiaomi", "特斯拉 Tesla", "比亚迪 BYD", "蔚来 NIO", "小鹏 XPeng", "理想 Li Auto", "问界 AITO", "极氪 ZEEKR", "宝马 BMW", "奔驰 Mercedes-Benz", "奥迪 Audi", "丰田 Toyota", "本田 Honda", "大众 Volkswagen", "其他 Other"];

export function TradeInForm({ vehicles }: { vehicles: Vehicle[] }) {
  const { t, pick, locale } = useI18n();
  const zh = locale === "zh";
  const [brand, setBrand] = useState(BRANDS[1]);
  const [model, setModel] = useState("Model 3");
  const [year, setYear] = useState(2022);
  const [mileageKm, setMileageKm] = useState(45000);
  const [condition, setCondition] = useState<"excellent" | "good" | "fair">("good");
  const [originalPrice, setOriginalPrice] = useState(279900);
  const [targetBrand, setTargetBrand] = useState<"xiaomi" | "tesla">("xiaomi");
  const [targetVehicle, setTargetVehicle] = useState("xiaomi-su7");
  const [estimate, setEstimate] = useState<TradeInEstimate | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"estimate" | "apply" | null>(null);
  const [applied, setApplied] = useState<{ id: string } | null>(null);

  const payload = { brand, model, year, mileageKm, condition, originalPrice, targetBrand, isEv: true };

  async function onEstimate(e: FormEvent) {
    e.preventDefault();
    if (!model.trim()) return setError(zh ? "请输入车型" : "Enter the model");
    setError(null);
    setLoading("estimate");
    const res = await apiFetch<{ estimate: TradeInEstimate }>("/api/trade-in", { method: "POST", json: payload });
    setLoading(null);
    if (!res.ok || !res.data) return setError(t.common.error);
    setEstimate(res.data.estimate);
  }

  async function onApply() {
    if (!name.trim()) return setError(t.forms.invalidName);
    if (!isValidCNPhone(phone)) return setError(t.forms.invalidPhone);
    setError(null);
    setLoading("apply");
    const res = await apiFetch<{ application: { id: string } }>("/api/trade-in", { method: "POST", json: { ...payload, name, phone, targetVehicleSlug: targetVehicle } });
    setLoading(null);
    if (!res.ok || !res.data) return setError(t.common.error);
    setApplied(res.data.application);
  }

  const targets = vehicles.filter((v) => v.brand === targetBrand && v.availability !== "overseas");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <form onSubmit={onEstimate} className="space-y-6 rounded-3xl bg-white p-6 hairline" noValidate>
        <h2 className="text-lg font-semibold">{zh ? "旧车信息" : "Your current car"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ti-brand" required>{zh ? "品牌" : "Brand"}</Label>
            <Select id="ti-brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ti-model" required>{zh ? "车型" : "Model"}</Label>
            <Input id="ti-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder={zh ? "例如：Model 3 长续航" : "e.g. Model 3 Long Range"} />
          </div>
          <div>
            <Label htmlFor="ti-year" required>{t.forms.year}</Label>
            <Select id="ti-year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 12 }).map((_, i) => {
                const y = 2026 - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </Select>
          </div>
          <div>
            <Label htmlFor="ti-price" required hint={zh ? "新车购买价（元）" : "Original price (¥)"}>{zh ? "购买价" : "Purchase price"}</Label>
            <Input id="ti-price" type="number" min={30000} step={1000} value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ti-km" hint={`${mileageKm.toLocaleString()} km`}>{t.forms.mileage}</Label>
            <input id="ti-km" type="range" min={0} max={300000} step={1000} value={mileageKm} onChange={(e) => setMileageKm(Number(e.target.value))} className="w-full" />
          </div>
          <div className="sm:col-span-2">
            <Label>{t.forms.condition}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["excellent", "good", "fair"] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCondition(c)} aria-pressed={condition === c} className={cn("h-11 rounded-xl border text-sm font-medium transition-colors focus-ring", condition === c ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}>
                  {c === "excellent" ? t.forms.conditionExcellent : c === "good" ? t.forms.conditionGood : t.forms.conditionFair}
                </button>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold">{zh ? "置换目标" : "Trading up to"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{zh ? "目标品牌" : "Target brand"}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["xiaomi", "tesla"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setTargetBrand(b);
                    setTargetVehicle(vehicles.find((v) => v.brand === b && v.availability !== "overseas")?.slug ?? "");
                  }}
                  aria-pressed={targetBrand === b}
                  className={cn("flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors focus-ring", targetBrand === b ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}
                >
                  <span className={cn("size-1.5 rounded-full", b === "xiaomi" ? "bg-mi" : "bg-tesla")} />
                  {b === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="ti-target">{zh ? "目标车型" : "Target vehicle"}</Label>
            <Select id="ti-target" value={targetVehicle} onChange={(e) => setTargetVehicle(e.target.value)}>
              {targets.map((v) => (
                <option key={v.slug} value={v.slug}>{pick(v.name)}</option>
              ))}
            </Select>
          </div>
        </div>
        <FieldError>{!estimate ? error : null}</FieldError>
        <Button type="submit" size="lg" loading={loading === "estimate"} icon={<ArrowLeftRight className="size-4" />}>{t.tradeIn.estimate}</Button>
      </form>

      <aside className="h-fit lg:sticky lg:top-24">
        {applied ? (
          <div className="rounded-3xl bg-white p-8 text-center hairline">
            <CheckCircle2 className="mx-auto size-12 text-success" />
            <h3 className="mt-4 text-xl font-semibold">{zh ? "置换申请已提交" : "Application submitted"}</h3>
            <p className="mt-2 text-sm text-slate">{zh ? "置换顾问将在 1 个工作日内联系您安排上门验车。" : "A trade-in advisor will contact you within one business day to schedule an inspection."}</p>
            <p className="mt-4 font-mono text-sm font-semibold">{applied.id}</p>
            <Button href={`/vehicles/${targetVehicle}/design`} className="mt-6">{t.nav.design}</Button>
          </div>
        ) : estimate ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-ink p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">{t.tradeIn.result}</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums">{formatCNY(estimate.mid)}</p>
              <p className="mt-1 text-sm text-white/70">{formatCNY(estimate.low)} – {formatCNY(estimate.high)}</p>
              <dl className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-white/70">{t.tradeIn.subsidy}{estimate.crossBrand ? (zh ? "（跨品牌）" : " (cross-brand)") : ""}</dt><dd className="font-semibold tabular-nums">+{formatCNY(estimate.subsidy)}</dd></div>
                <div className="flex justify-between text-base"><dt className="font-semibold">{t.tradeIn.totalCredit}</dt><dd className="font-semibold tabular-nums">{formatCNY(estimate.totalCredit)}</dd></div>
              </dl>
              <p className="mt-4 text-[11px] leading-4 text-white/60">{t.tradeIn.note} · {zh ? "有效期至" : "Valid until"} {formatDate(estimate.validUntil, locale)}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 hairline">
              <h3 className="font-semibold">{t.tradeIn.apply}</h3>
              <div className="mt-4 grid gap-3">
                <div>
                  <Label htmlFor="ti-name" required>{t.forms.name}</Label>
                  <Input id="ti-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ti-phone" required>{t.forms.phone}</Label>
                  <Input id="ti-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                </div>
                <FieldError>{error}</FieldError>
                <Button onClick={onApply} loading={loading === "apply"} fullWidth>{t.tradeIn.apply}</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-cloud p-8 hairline">
            <h3 className="font-semibold">{zh ? "两分钟拿到报价" : "A quote in two minutes"}</h3>
            <ul className="mt-4 space-y-2 text-sm text-graphite">
              {(zh
                ? ["基于 2026 年二手新能源车市场残值模型", "跨品牌置换补贴最高 12,000 元，同品牌 8,000 元", "旧车上门验车、代办过户，置换款直接抵扣尾款"]
                : ["Residual-value model calibrated to the 2026 used-EV market", "Up to ¥12,000 cross-brand bonus, ¥8,000 same-brand", "At-home inspection, transfer handled, value applied to your balance"]
              ).map((s) => (
                <li key={s} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{s}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
