"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { KeyRound, Smartphone, Watch, Copy, Check } from "lucide-react";
import type { Vehicle } from "@/data/types";
import type { GarageVehicle } from "@/lib/garage";
import type { SharedKey } from "@/lib/orders";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatDate, isValidCNPhone, isValidEmail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, FieldError, Input, Label, Select } from "@/components/ui/primitives";

export function Keys({ vehicles }: { vehicles: Vehicle[] }) {
  const { t, pick, locale } = useI18n();
  const [garage, setGarage] = useState<GarageVehicle[]>([]);
  const [keys, setKeys] = useState<SharedKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [holderName, setHolderName] = useState("");
  const [holderContact, setHolderContact] = useState("");
  const [garageVehicleId, setGarageVehicleId] = useState("");
  const [permission, setPermission] = useState<"drive" | "unlock" | "valet">("drive");
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const bySlug = useMemo(() => Object.fromEntries(vehicles.map((v) => [v.slug, v])), [vehicles]);

  const load = useCallback(async () => {
    const [g, k] = await Promise.all([apiFetch<{ vehicles: GarageVehicle[] }>("/api/garage"), apiFetch<{ keys: SharedKey[] }>("/api/keys")]);
    const list = g.data?.vehicles ?? [];
    setGarage(list);
    setKeys(k.data?.keys ?? []);
    setGarageVehicleId((prev) => prev || list[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!garageVehicleId) return setError(locale === "zh" ? "请先在车库中添加车辆" : "Add a vehicle to your garage first");
    if (!holderName.trim()) return setError(t.forms.invalidName);
    if (!isValidCNPhone(holderContact) && !isValidEmail(holderContact)) return setError(locale === "zh" ? "请输入使用者手机号或邮箱" : "Enter the holder's mobile or email");
    setError(null);
    setSubmitting(true);
    const res = await apiFetch<{ key: SharedKey }>("/api/keys", { method: "POST", json: { garageVehicleId, holderName, holderContact, permission, days } });
    setSubmitting(false);
    if (!res.ok || !res.data) return setError(t.common.error);
    setKeys((prev) => [res.data!.key, ...prev]);
    setHolderName("");
    setHolderContact("");
  }

  async function revoke(id: string) {
    const res = await apiFetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
  }

  const permissionLabel = { drive: t.connect.keyDriver, unlock: t.connect.keyUnlockOnly, valet: t.connect.keyValet } as const;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-ink p-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">{locale === "zh" ? "我的钥匙" : "My keys"}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: <Smartphone className="size-5" />, label: locale === "zh" ? "手机 · UWB" : "Phone · UWB" },
              { icon: <Watch className="size-5" />, label: locale === "zh" ? "手表 / 手环" : "Watch / Band" },
              { icon: <KeyRound className="size-5" />, label: locale === "zh" ? "NFC 卡片" : "NFC card" },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl bg-white/10 p-4 text-center">
                <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-white/10">{k.icon}</span>
                <p className="mt-2 text-xs font-medium">{k.label}</p>
                <p className="mt-0.5 text-[10px] text-white/60">{locale === "zh" ? "已激活" : "Active"}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-white/60">{locale === "zh" ? "钥匙基于安全芯片与端到端加密，跨品牌车辆通用；手表与手环需 UWB 型号支持无感解锁。" : "Keys are secure-element based and end-to-end encrypted, valid across brands; hands-free unlock requires UWB watches/bands."}</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 hairline" noValidate>
          <h2 className="text-lg font-semibold">{t.connect.createKey}</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="key-vehicle" required>{t.connect.vehicle}</Label>
              <Select id="key-vehicle" value={garageVehicleId} onChange={(e) => setGarageVehicleId(e.target.value)} disabled={garage.length === 0}>
                {garage.length === 0 ? <option value="">{loading ? t.common.loading : t.connect.noVehicles}</option> : null}
                {garage.map((g) => (
                  <option key={g.id} value={g.id}>{g.nickname} · {pick(bySlug[g.vehicleSlug]?.name ?? { zh: g.vehicleSlug, en: g.vehicleSlug })}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="key-holder" required>{t.connect.keyHolder}</Label>
                <Input id="key-holder" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="key-contact" required>{t.forms.phone} / {t.forms.email}</Label>
                <Input id="key-contact" value={holderContact} onChange={(e) => setHolderContact(e.target.value)} />
              </div>
            </div>
            <fieldset>
              <legend className="mb-1.5 text-[13px] font-medium text-graphite">{t.connect.keyPermission}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["drive", "unlock", "valet"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPermission(p)} aria-pressed={permission === p} className={cn("h-11 rounded-xl border text-sm font-medium transition-colors focus-ring", permission === p ? "border-ink bg-ink text-white" : "border-line hover:border-ash")}>{permissionLabel[p]}</button>
                ))}
              </div>
            </fieldset>
            <div>
              <Label htmlFor="key-days" hint={`${days} ${locale === "zh" ? "天" : "days"}`}>{t.connect.keyExpiry}</Label>
              <input id="key-days" type="range" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} aria-valuetext={`${days} ${locale === "zh" ? "天" : "days"}`} className="w-full accent-ink" />
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" loading={submitting} disabled={garage.length === 0}>{t.connect.createKey}</Button>
            {garage.length === 0 && !loading ? (
              <Button href="/connect/garage" variant="secondary">{t.connect.addVehicle}</Button>
            ) : null}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold">{locale === "zh" ? "共享钥匙" : "Shared keys"}</h2>
        {loading ? (
          <div className="mt-4 h-40 animate-pulse rounded-3xl bg-mist" />
        ) : keys.length === 0 ? (
          <p className="mt-4 rounded-3xl bg-cloud p-8 text-center text-sm text-slate hairline">{locale === "zh" ? "还没有共享钥匙。创建后，使用者会收到短信 / 邮件邀请，在小米汽车 App 或 Tesla App 中一键领取。" : "No shared keys yet. Holders receive an SMS/email invite and accept in the Xiaomi EV or Tesla app."}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {keys.map((k) => {
              const g = garage.find((x) => x.id === k.garageVehicleId);
              const v = g ? bySlug[g.vehicleSlug] : undefined;
              const active = k.status === "active";
              return (
                <li key={k.id} className={cn("rounded-3xl bg-white p-5 hairline", !active && "opacity-60")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{k.holderName} <span className="text-sm font-normal text-slate">· {k.holderContact}</span></p>
                      <p className="mt-0.5 text-xs text-slate">{g?.nickname ?? "—"}{v ? ` · ${pick(v.name)}` : ""}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge tone="dark">{permissionLabel[k.permission]}</Badge>
                        <Badge tone={active ? "success" : "neutral"}>{active ? t.connect.status : k.status === "revoked" ? (locale === "zh" ? "已撤销" : "Revoked") : (locale === "zh" ? "已过期" : "Expired")}</Badge>
                        <Badge tone="neutral">{t.connect.keyExpiry} {formatDate(k.expiresAt, locale)}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(k.code).catch(() => {});
                          setCopied(k.id);
                          setTimeout(() => setCopied(null), 1500);
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-mist px-3 font-mono text-xs font-semibold tracking-widest focus-ring"
                        aria-label={`${t.common.copy} ${k.code}`}
                      >
                        {k.code}
                        {copied === k.id ? <Check className="size-3.5 text-success-deep" /> : <Copy className="size-3.5 text-ash" />}
                      </button>
                      {active ? <Button size="sm" variant="outline" onClick={() => revoke(k.id)}>{t.connect.revoke}</Button> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
