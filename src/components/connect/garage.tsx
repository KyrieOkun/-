"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Battery, Car, Fan, Lock, LockOpen, MapPin, Plus, RefreshCw, Sun, Thermometer, Trash2, Zap, ZapOff, Lightbulb, ShieldCheck } from "lucide-react";
import type { Vehicle } from "@/data/types";
import type { GarageVehicle, VehicleStatus, GarageCommand } from "@/lib/garage";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatDateTime, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, FieldError, Input, Label, Select } from "@/components/ui/primitives";
import { PaintSwatch } from "@/components/vehicles/swatches";
import { useUser } from "@/components/auth/auth-gate";

type GarageEntry = GarageVehicle & { status: VehicleStatus };

export function Garage({ vehicles }: { vehicles: Vehicle[] }) {
  const { t, pick, locale } = useI18n();
  const { user } = useUser();
  const [entries, setEntries] = useState<GarageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const bySlug = useMemo(() => Object.fromEntries(vehicles.map((v) => [v.slug, v])), [vehicles]);

  const load = useCallback(async () => {
    const res = await apiFetch<{ vehicles: GarageEntry[] }>("/api/garage");
    setEntries(res.data?.vehicles ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const sendCommand = async (id: string, command: GarageCommand, temp?: number) => {
    const res = await apiFetch<{ status: VehicleStatus }>(`/api/garage/${id}/command`, { method: "POST", json: { command, temp } });
    if (res.ok && res.data) {
      const status = res.data.status;
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status, state: { ...e.state, locked: status.locked, climateOn: status.climateOn, charging: status.charging, pluggedIn: status.pluggedIn, sentry: status.sentry, targetTemp: status.targetTempC } } : e)));
      setToast(t.connect.commandSent);
    } else {
      setToast(t.common.error);
    }
  };

  const removeVehicle = async (id: string) => {
    const res = await apiFetch(`/api/garage/${id}`, { method: "DELETE" });
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate">{t.account.welcome}，{user?.name}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t.connect.garage}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void load()} icon={<RefreshCw className="size-4" />}>{t.connect.lastSync}</Button>
          <Button onClick={() => setAdding(true)} icon={<Plus className="size-4" />} disabled={entries.length >= 6}>{t.connect.addVehicle}</Button>
        </div>
      </div>

      {adding ? (
        <AddVehicleForm
          vehicles={vehicles}
          onCancel={() => setAdding(false)}
          onAdded={(entry) => {
            setEntries((prev) => [...prev, entry]);
            setAdding(false);
            setToast(t.connect.vehicleAdded);
          }}
        />
      ) : null}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-3xl bg-mist" />
          <div className="h-80 animate-pulse rounded-3xl bg-mist" />
        </div>
      ) : entries.length === 0 && !adding ? (
        <div className="rounded-3xl bg-cloud p-12 text-center hairline">
          <Car className="mx-auto size-10 text-ash" />
          <p className="mt-4 text-slate">{t.connect.noVehicles}</p>
          <Button className="mt-6" onClick={() => setAdding(true)} icon={<Plus className="size-4" />}>{t.connect.addVehicle}</Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {entries.map((e) => {
            const v = bySlug[e.vehicleSlug];
            if (!v) return null;
            const trim = v.trims.find((tr) => tr.id === e.trimId) ?? v.trims[0];
            const paint = v.paints.find((p) => p.id === e.paintId) ?? v.paints[0];
            const s = e.status;
            return (
              <article key={e.id} className="overflow-hidden rounded-3xl bg-white hairline">
                <div className="relative aspect-[16/8] bg-carbon">
                  <Image src={v.hero.src} alt={pick(v.hero.alt)} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                  <div className="scrim-b absolute inset-x-0 bottom-0 h-2/3" />
                  <div className="absolute inset-x-5 bottom-4 flex items-end justify-between text-white">
                    <div>
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                        <span className={cn("size-1.5 rounded-full", v.brand === "xiaomi" ? "bg-mi" : "bg-tesla")} />
                        {v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla} · {pick(trim.name)}
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold">{e.nickname}</h3>
                      <p className="text-xs text-white/70">{pick(v.name)}{e.plate ? ` · ${e.plate}` : ""} · VIN {e.vin.slice(0, 5)}…{e.vin.slice(-4)}</p>
                    </div>
                    <PaintSwatch paint={paint} size={28} />
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative size-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7ea" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke={s.batteryPercent <= 20 ? "#dc2626" : s.charging ? "#1f9d55" : "#171a20"} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(s.batteryPercent / 100) * 97.4} 97.4`} />
                      </svg>
                      <span className="absolute inset-0 flex flex-col items-center justify-center text-sm font-semibold tabular-nums">
                        {s.batteryPercent}%
                      </span>
                    </div>
                    <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                      <div><dt className="text-ash">{t.connect.rangeLeft}</dt><dd className="font-semibold tabular-nums">{s.rangeKm} km</dd></div>
                      <div><dt className="text-ash">{t.connect.odometer}</dt><dd className="font-semibold tabular-nums">{formatNumber(s.odometerKm, locale)} km</dd></div>
                      <div><dt className="text-ash">{t.connect.cabinTemp}</dt><dd className="font-semibold tabular-nums">{s.cabinTempC}°C</dd></div>
                      <div><dt className="text-ash">{t.connect.location}</dt><dd className="flex items-center gap-1 font-semibold"><MapPin className="size-3.5 text-ash" />{pick(s.location.label)}</dd></div>
                      <div><dt className="text-ash">{t.connect.softwareVersion}</dt><dd className="truncate font-semibold" title={s.softwareVersion}>{s.softwareVersion.split(" (")[0]}</dd></div>
                      <div><dt className="text-ash">{t.connect.chargingState}</dt><dd className="font-semibold">{s.charging ? `${t.connect.chargingNow} · ${s.chargePowerKw} kW` : s.pluggedIn ? t.connect.plugged : t.connect.notCharging}</dd></div>
                    </dl>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone={s.locked ? "success" : "tesla"}>{s.locked ? t.connect.locked : t.connect.unlocked}</Badge>
                    <Badge tone={s.climateOn ? "mi" : "neutral"}>{s.climateOn ? `${t.connect.climateOn} · ${s.targetTempC}°C` : t.connect.climateOff}</Badge>
                    <Badge tone={s.sentry ? "dark" : "neutral"}><ShieldCheck className="size-3" />{locale === "zh" ? "哨兵" : "Sentry"} {s.sentry ? "ON" : "OFF"}</Badge>
                    {s.updateAvailable ? <Badge tone="gold">OTA · {s.updateAvailable.split(" (")[0]}</Badge> : null}
                    <Badge tone="neutral">{locale === "zh" ? "电池健康" : "Battery health"} {s.health.batteryHealthPercent}%</Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    <Action icon={s.locked ? <LockOpen className="size-4" /> : <Lock className="size-4" />} label={s.locked ? t.connect.unlock : t.connect.lock} onClick={() => sendCommand(e.id, s.locked ? "unlock" : "lock")} />
                    <Action icon={<Fan className="size-4" />} label={s.climateOn ? t.connect.climateStop : t.connect.climateStart} onClick={() => sendCommand(e.id, s.climateOn ? "climate_off" : "climate_on")} active={s.climateOn} />
                    <Action icon={<Lightbulb className="size-4" />} label={t.connect.flash} onClick={() => sendCommand(e.id, "flash")} />
                    <Action icon={s.charging ? <ZapOff className="size-4" /> : <Zap className="size-4" />} label={s.charging ? t.connect.stopCharge : t.connect.startCharge} onClick={() => sendCommand(e.id, s.charging ? "charge_stop" : "charge_start")} active={s.charging} />
                    <Action icon={<Thermometer className="size-4" />} label={`${s.targetTempC + 1}°C`} onClick={() => sendCommand(e.id, "set_temp", Math.min(30, s.targetTempC + 1))} />
                    <Action icon={<Sun className="size-4" />} label={`${s.targetTempC - 1}°C`} onClick={() => sendCommand(e.id, "set_temp", Math.max(16, s.targetTempC - 1))} />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-ash">
                    <span className="flex items-center gap-1"><Battery className="size-3.5" />{t.connect.lastSync} {formatDateTime(s.lastSync, locale)}</span>
                    <button type="button" onClick={() => removeVehicle(e.id)} className="inline-flex items-center gap-1 text-ash hover:text-danger focus-ring rounded">
                      <Trash2 className="size-3.5" />{t.common.remove}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
          <div role="status" className="rounded-2xl bg-ink px-4 py-2.5 text-sm text-white shadow-lift">{toast}</div>
        </div>
      ) : null}
    </div>
  );
}

function Action({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-[11px] font-medium transition-colors focus-ring", active ? "bg-ink text-white" : "bg-mist text-graphite hover:bg-line")}>
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function AddVehicleForm({ vehicles, onCancel, onAdded }: { vehicles: Vehicle[]; onCancel: () => void; onAdded: (entry: GarageEntry) => void }) {
  const { t, pick, locale } = useI18n();
  const orderable = vehicles.filter((v) => v.availability !== "overseas");
  const [slug, setSlug] = useState(orderable[0].slug);
  const vehicle = orderable.find((v) => v.slug === slug) ?? orderable[0];
  const [trimId, setTrimId] = useState(vehicle.trims[0].id);
  const [paintId, setPaintId] = useState(vehicle.paints[0].id);
  const [nickname, setNickname] = useState("");
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTrimId(vehicle.trims[0].id);
    setPaintId(vehicle.paints[0].id);
  }, [vehicle]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return setError(locale === "zh" ? "请输入车辆昵称" : "Enter a nickname");
    if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return setError(locale === "zh" ? "车架号需为 17 位（不含 I/O/Q）" : "VIN must be 17 characters (no I/O/Q)");
    setError(null);
    setLoading(true);
    const res = await apiFetch<{ vehicle: GarageEntry }>("/api/garage", { method: "POST", json: { vehicleSlug: slug, trimId, paintId, nickname, plate: plate || undefined, vin: vin || undefined } });
    setLoading(false);
    if (!res.ok || !res.data) {
      setError(res.error === "VIN_EXISTS" ? (locale === "zh" ? "该车架号已在车库中" : "This VIN is already in your garage") : t.common.error);
      return;
    }
    onAdded(res.data.vehicle);
  }

  return (
    <form onSubmit={onSubmit} className="mb-8 rounded-3xl bg-cloud p-6 hairline" noValidate>
      <h3 className="text-lg font-semibold">{t.connect.addVehicle}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="gv-model" required>{t.connect.model}</Label>
          <Select id="gv-model" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {orderable.map((v) => (
              <option key={v.slug} value={v.slug}>{v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla} · {pick(v.name)}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="gv-trim" required>{t.configurator.trim}</Label>
          <Select id="gv-trim" value={trimId} onChange={(e) => setTrimId(e.target.value)}>
            {vehicle.trims.map((tr) => (
              <option key={tr.id} value={tr.id}>{pick(tr.name)}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="gv-paint">{t.configurator.color}</Label>
          <Select id="gv-paint" value={paintId} onChange={(e) => setPaintId(e.target.value)}>
            {vehicle.paints.map((p) => (
              <option key={p.id} value={p.id}>{pick(p.name)}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="gv-nick" required>{t.connect.nickname}</Label>
          <Input id="gv-nick" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={locale === "zh" ? "例如：我的 SU7" : "e.g. My SU7"} maxLength={30} />
        </div>
        <div>
          <Label htmlFor="gv-plate" hint={t.common.optionalField}>{t.connect.plate}</Label>
          <Input id="gv-plate" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="京A·D12345" maxLength={10} />
        </div>
        <div>
          <Label htmlFor="gv-vin" hint={locale === "zh" ? "留空自动生成演示车辆" : "Leave blank for a demo VIN"}>{t.connect.vin}</Label>
          <Input id="gv-vin" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="17 位" maxLength={17} className="font-mono uppercase" />
        </div>
      </div>
      <FieldError>{error}</FieldError>
      <div className="mt-5 flex gap-3">
        <Button type="submit" loading={loading}>{t.common.confirm}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>{t.common.cancel}</Button>
      </div>
    </form>
  );
}
