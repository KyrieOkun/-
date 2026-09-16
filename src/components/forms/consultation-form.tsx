"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Vehicle } from "@/data/types";
import type { AtelierProgram } from "@/data/site";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, isValidCNPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/primitives";

export function ConsultationForm({ vehicles, programs }: { vehicles: Vehicle[]; programs: AtelierProgram[] }) {
  const { t, pick, locale } = useI18n();
  const zh = locale === "zh";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleSlug, setVehicleSlug] = useState(vehicles[0]?.slug ?? "");
  const [picked, setPicked] = useState<string[]>([programs[0]?.id ?? ""].filter(Boolean));
  const [budget, setBudget] = useState<"lt50k" | "50k-150k" | "150k-300k" | "gt300k">("50k-150k");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(t.forms.invalidName);
    if (!isValidCNPhone(phone)) return setError(t.forms.invalidPhone);
    if (picked.length === 0) return setError(zh ? "请至少选择一个定制项目" : "Choose at least one program");
    if (!agree) return setError(t.forms.mustAgree);
    setError(null);
    setLoading(true);
    const res = await apiFetch<{ consultation: { id: string } }>("/api/consultation", { method: "POST", json: { name, phone, vehicleSlug, programs: picked, budget, city: city || undefined, note: note || undefined, agree: true } });
    setLoading(false);
    if (!res.ok || !res.data) return setError(t.common.error);
    setDone(res.data.consultation.id);
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center hairline">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h3 className="mt-4 text-xl font-semibold">{t.atelier.consultSuccess}</h3>
        <p className="mt-3 font-mono text-sm text-slate">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 hairline sm:p-8" noValidate>
      <h3 className="text-xl font-semibold">{t.atelier.bookConsult}</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name" required>{t.forms.name}</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="c-phone" required>{t.forms.phone}</Label>
          <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        </div>
        <div>
          <Label htmlFor="c-vehicle">{t.forms.model}</Label>
          <Select id="c-vehicle" value={vehicleSlug} onChange={(e) => setVehicleSlug(e.target.value)}>
            {vehicles.map((v) => (
              <option key={v.slug} value={v.slug}>{v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla} · {pick(v.name)}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="c-budget">{zh ? "定制预算" : "Budget"}</Label>
          <Select id="c-budget" value={budget} onChange={(e) => setBudget(e.target.value as typeof budget)}>
            <option value="lt50k">{zh ? "5 万元以内" : "Under ¥50k"}</option>
            <option value="50k-150k">¥50k – ¥150k</option>
            <option value="150k-300k">¥150k – ¥300k</option>
            <option value="gt300k">{zh ? "30 万元以上" : "Over ¥300k"}</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>{t.atelier.programs}</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {programs.map((p) => {
              const on = picked.includes(p.id);
              return (
                <button key={p.id} type="button" onClick={() => setPicked(on ? picked.filter((x) => x !== p.id) : [...picked, p.id])} aria-pressed={on} className={cn("rounded-2xl border p-3 text-left text-sm transition-colors focus-ring", on ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}>
                  <span className="font-medium">{pick(p.title)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label htmlFor="c-city" hint={t.common.optionalField}>{t.forms.city}</Label>
          <Input id="c-city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="c-note" hint={t.common.optionalField}>{zh ? "定制想法" : "Your ideas"}</Label>
          <Textarea id="c-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={zh ? "例如：靛石绿 + 砂陶米内饰 + 碳纤维尾翼，希望 11 月前交付" : "e.g. Indigo Green + Sand Beige interior + carbon wing, delivery before November"} />
        </div>
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm text-graphite">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-4 rounded accent-ink" />
        <span>{t.forms.agree} <a href="/legal/privacy" className="underline" target="_blank">{t.forms.privacy}</a></span>
      </label>
      <FieldError>{error}</FieldError>
      <Button type="submit" size="lg" className="mt-5" loading={loading}>{t.atelier.bookConsult}</Button>
    </form>
  );
}
