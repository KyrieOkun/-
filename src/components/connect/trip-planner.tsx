"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeftRight, ArrowRight, Clock, Fuel, Navigation, PlugZap, Route as RouteIcon, Zap } from "lucide-react";
import type { City } from "@/data/cities";
import type { Vehicle } from "@/data/types";
import type { TripPlan, TripError } from "@/lib/trip";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatCNY } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, FieldError, Label, Select } from "@/components/ui/primitives";
import { NetworkMap, type MapStation } from "@/components/charging/network-map";

const NETWORK_LABEL = { tesla: { zh: "特斯拉超充", en: "Tesla" }, xiaomi: { zh: "小米超充", en: "Xiaomi" }, partner: { zh: "合作网络", en: "Partner" } } as const;

export function TripPlanner({ cities, majorCityIds, vehicles, initialVehicle, stations }: { cities: City[]; majorCityIds?: string[]; vehicles: Vehicle[]; initialVehicle?: string; stations: MapStation[] }) {
  const { t, pick, locale } = useI18n();
  const [originId, setOriginId] = useState("beijing");
  const [destinationId, setDestinationId] = useState("shanghai");
  const [vehicleSlug, setVehicleSlug] = useState(initialVehicle && vehicles.some((v) => v.slug === initialVehicle) ? initialVehicle : "xiaomi-su7");
  const vehicle = vehicles.find((v) => v.slug === vehicleSlug) ?? vehicles[0];
  const [trimId, setTrimId] = useState(vehicle.trims[0].id);
  const [startSoc, setStartSoc] = useState(90);
  const [minArrivalSoc, setMinArrivalSoc] = useState(15);
  const [network, setNetwork] = useState<"any" | "tesla" | "xiaomi">("any");
  const [season, setSeason] = useState<"mild" | "summer" | "winter">("mild");
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedCities = useMemo(() => [...cities].sort((a, b) => pick(a.name).localeCompare(pick(b.name), locale === "zh" ? "zh-Hans-CN" : "en")), [cities, pick, locale]);
  const majorSet = useMemo(() => new Set(majorCityIds ?? cities.map((c) => c.id)), [majorCityIds, cities]);
  const cityGroups = useMemo(
    () => [
      { label: locale === "zh" ? "主要城市" : "Major cities", items: sortedCities.filter((c) => majorSet.has(c.id)) },
      { label: locale === "zh" ? "沿线城镇 / 服务区" : "Corridor towns", items: sortedCities.filter((c) => !majorSet.has(c.id)) },
    ].filter((g) => g.items.length > 0),
    [sortedCities, majorSet, locale],
  );
  const sameCity = originId === destinationId;
  const originCity = cities.find((c) => c.id === originId);
  const destinationCity = cities.find((c) => c.id === destinationId);

  const swap = () => {
    setOriginId(destinationId);
    setDestinationId(originId);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sameCity) {
      setError(locale === "zh" ? "出发地与目的地不能相同" : "Origin and destination must differ");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await apiFetch<TripPlan>("/api/trip/plan", {
      method: "POST",
      json: { originId, destinationId, vehicleSlug, trimId, startSoc, minArrivalSoc, network, season },
    });
    setLoading(false);
    if (!res.ok || !res.data) {
      const details = res.details as TripError | undefined;
      setError(details?.message ? pick(details.message) : t.common.error);
      setPlan(null);
      return;
    }
    setPlan(res.data);
  }

  const fmtMin = (m: number) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return locale === "zh" ? `${h ? `${h} 小时 ` : ""}${mm} 分钟` : `${h ? `${h}h ` : ""}${mm}m`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      <form onSubmit={onSubmit} className="h-fit rounded-3xl bg-white p-6 hairline lg:sticky lg:top-24" noValidate>
        <div className="grid gap-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div className="min-w-0">
              <Label htmlFor="origin" required>{t.connect.origin}</Label>
              <Select id="origin" value={originId} onChange={(e) => setOriginId(e.target.value)} aria-invalid={sameCity || undefined}>
                {cityGroups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((c) => (
                      <option key={c.id} value={c.id}>{pick(c.name)}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>
            <button type="button" onClick={swap} className="mb-1 flex size-10 items-center justify-center rounded-full bg-mist text-graphite transition-colors hover:bg-line focus-ring" aria-label={locale === "zh" ? "交换出发地与目的地" : "Swap origin and destination"}>
              <ArrowLeftRight className="size-4" />
            </button>
            <div className="min-w-0">
              <Label htmlFor="destination" required>{t.connect.destination}</Label>
              <Select id="destination" value={destinationId} onChange={(e) => setDestinationId(e.target.value)} aria-invalid={sameCity || undefined}>
                {cityGroups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((c) => (
                      <option key={c.id} value={c.id}>{pick(c.name)}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="vehicle" required>{t.connect.vehicle}</Label>
            <Select
              id="vehicle"
              value={vehicleSlug}
              onChange={(e) => {
                const next = vehicles.find((v) => v.slug === e.target.value) ?? vehicles[0];
                setVehicleSlug(next.slug);
                setTrimId(next.trims[0].id);
              }}
            >
              {vehicles.map((v) => (
                <option key={v.slug} value={v.slug}>{v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla} · {pick(v.name)}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="trim" required>{t.configurator.trim}</Label>
            <Select id="trim" value={trimId} onChange={(e) => setTrimId(e.target.value)}>
              {vehicle.trims.map((tr) => (
                <option key={tr.id} value={tr.id}>{pick(tr.name)} · {tr.evRangeKm ?? tr.rangeKm} km</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="start-soc" hint={`${startSoc}%`}>{t.connect.startSoc}</Label>
            <input id="start-soc" type="range" min={10} max={100} step={5} value={startSoc} onChange={(e) => setStartSoc(Number(e.target.value))} aria-valuetext={`${startSoc}%`} className="w-full accent-ink" />
          </div>
          <div>
            <Label htmlFor="arrival-soc" hint={`${minArrivalSoc}%`}>{t.connect.arrivalSoc}</Label>
            <input id="arrival-soc" type="range" min={5} max={40} step={5} value={minArrivalSoc} onChange={(e) => setMinArrivalSoc(Number(e.target.value))} aria-valuetext={`${minArrivalSoc}%`} className="w-full accent-ink" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="network">{locale === "zh" ? "偏好网络" : "Network"}</Label>
              <Select id="network" value={network} onChange={(e) => setNetwork(e.target.value as typeof network)}>
                <option value="any">{locale === "zh" ? "全部网络（推荐）" : "All networks"}</option>
                <option value="tesla">{t.charging.filterTesla}</option>
                <option value="xiaomi">{t.charging.filterXiaomi}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="season">{locale === "zh" ? "季节" : "Season"}</Label>
              <Select id="season" value={season} onChange={(e) => setSeason(e.target.value as typeof season)}>
                <option value="mild">{locale === "zh" ? "春秋（15-25℃）" : "Mild"}</option>
                <option value="summer">{locale === "zh" ? "夏季（空调）" : "Summer"}</option>
                <option value="winter">{locale === "zh" ? "冬季（-5℃）" : "Winter"}</option>
              </Select>
            </div>
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" size="lg" loading={loading} disabled={sameCity} icon={<RouteIcon className="size-4" />}>{loading ? t.connect.planning : t.connect.plan}</Button>
        </div>
      </form>

      <div>
        {!plan ? (
          <div className="space-y-4">
            <NetworkMap
              stations={stations}
              route={originCity && destinationCity && !sameCity ? [
                { lat: originCity.lat, lng: originCity.lng, label: originCity.name, kind: "origin" },
                { lat: destinationCity.lat, lng: destinationCity.lng, label: destinationCity.name, kind: "destination" },
              ] : undefined}
              compact
              preview
            />
            <div className="flex items-center gap-3 rounded-3xl bg-cloud p-5 text-sm text-slate hairline">
              <Navigation className="size-5 shrink-0 text-ash" />
              <p>{t.connect.tripSubtitle}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl bg-ink p-6 text-white sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">{pick(plan.vehicle.name)} · {pick(plan.vehicle.trim)}</p>
              <h2 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-semibold sm:text-3xl">
                {pick(plan.origin.name)} <ArrowRight className="size-6 text-white/50" /> {pick(plan.destination.name)}
              </h2>
              {plan.via.length ? <p className="mt-2 text-sm text-white/60">{locale === "zh" ? "途经" : "Via"} {plan.via.map((c) => pick(c.name)).join(" · ")}</p> : null}
              <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div><dt className="text-xs text-white/60">{t.connect.distance}</dt><dd className="text-2xl font-semibold tabular-nums">{plan.distanceKm} <span className="text-sm text-white/60">km</span></dd></div>
                <div><dt className="text-xs text-white/60">{t.connect.duration}</dt><dd className="text-2xl font-semibold tabular-nums">{fmtMin(plan.totalMinutes)}</dd></div>
                <div><dt className="text-xs text-white/60">{t.connect.stops}</dt><dd className="text-2xl font-semibold tabular-nums">{plan.stops.length}</dd></div>
                <div><dt className="text-xs text-white/60">{t.connect.arriveWith}</dt><dd className="text-2xl font-semibold tabular-nums">{plan.arrivalSoc}%</dd></div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/70">
                <span className="flex items-center gap-1"><Clock className="size-3.5" />{t.connect.driveTime} {fmtMin(plan.driveMinutes)}</span>
                <span className="flex items-center gap-1"><PlugZap className="size-3.5" />{t.connect.chargeTime} {fmtMin(plan.chargeMinutes)}</span>
                <span className="flex items-center gap-1"><Zap className="size-3.5" />{t.connect.energy} {plan.energyKwh} kWh · {plan.consumptionKwhPer100} kWh/100km</span>
                {plan.fuelLitres ? <span className="flex items-center gap-1"><Fuel className="size-3.5" />{locale === "zh" ? "增程油耗" : "Fuel"} {plan.fuelLitres} L</span> : null}
              </div>
            </div>

            <NetworkMap
              stations={stations}
              route={[
                { lat: plan.origin.lat, lng: plan.origin.lng, label: plan.origin.name, kind: "origin" },
                ...plan.via.map((c) => ({ lat: c.lat, lng: c.lng, label: c.name, kind: "via" as const })),
                { lat: plan.destination.lat, lng: plan.destination.lng, label: plan.destination.name, kind: "destination" },
              ]}
              stops={plan.stops.map((s) => ({ lat: s.station.lat, lng: s.station.lng, label: s.station.name, network: s.station.network, kind: "stop" as const }))}
              compact
            />

            <RouteStrip plan={plan} />

            {plan.stops.length === 0 ? (
              <div className="rounded-3xl bg-success/10 p-6 text-success-deep">
                <p className="font-semibold">{plan.vehicle.powertrain === "erev" && plan.fuelLitres ? (locale === "zh" ? "纯电优先，增程器接管剩余里程，无需停靠充电" : "Electric first — the range extender covers the rest, no charging stops") : t.connect.noStopsNeeded}</p>
              </div>
            ) : (
              <ol className="space-y-3">
                {plan.stops.map((stop, i) => (
                  <li key={stop.station.id} className="rounded-3xl bg-white p-5 hairline">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-4">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{i + 1}</span>
                        <div>
                          <p className="font-semibold">{pick(stop.station.name)}</p>
                          <p className="mt-0.5 text-xs text-slate">{pick(stop.station.address)}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge tone={stop.station.network === "tesla" ? "tesla" : stop.station.network === "xiaomi" ? "mi" : "neutral"}>{pick(NETWORK_LABEL[stop.station.network])}</Badge>
                            <Badge tone="neutral">{stop.station.maxKw} kW · {stop.station.stalls} {t.charging.stalls}</Badge>
                            {stop.station.openToAll ? <Badge tone="success">{t.charging.openToAll}</Badge> : null}
                          </div>
                        </div>
                      </div>
                      <dl className="grid grid-cols-3 gap-4 text-right text-sm">
                        <div><dt className="text-xs text-ash">{locale === "zh" ? "到达" : "Arrive"}</dt><dd className="font-semibold tabular-nums">{stop.arrivalSoc}%</dd></div>
                        <div><dt className="text-xs text-ash">{locale === "zh" ? "充至" : "Charge to"}</dt><dd className="font-semibold tabular-nums">{stop.departSoc}%</dd></div>
                        <div><dt className="text-xs text-ash">{t.connect.chargeTime}</dt><dd className="font-semibold tabular-nums">{stop.chargeMinutes} {t.common.min}</dd></div>
                      </dl>
                    </div>
                    <p className="mt-3 text-xs text-slate">
                      {locale === "zh" ? `距出发 ${stop.distanceFromOriginKm} km · 本段 ${stop.legDistanceKm} km · 补能 ${stop.energyKwh} kWh · 预计 ${formatCNY(stop.costCny)}` : `${stop.distanceFromOriginKm} km from origin · leg ${stop.legDistanceKm} km · ${stop.energyKwh} kWh · est. ${formatCNY(stop.costCny)}`}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-cloud p-5 hairline">
              <p className="flex-1 text-sm text-slate">{locale === "zh" ? "已规划好？一键发送到车机导航，或先查看沿途站点详情。" : "Happy with the plan? Send it to your car or browse the stations first."}</p>
              <Button href="/connect/garage" variant="secondary">{locale === "zh" ? "发送至车机" : "Send to car"}</Button>
              <Link href="/charging" className="inline-flex h-10 items-center rounded-pill bg-ink px-5 text-sm font-medium text-white">{t.charging.stationsTitle}</Link>
            </div>
            {plan.notes.includes("LOW_ARRIVAL") ? <p className="rounded-2xl bg-warning/10 p-4 text-sm text-warning-deep">{locale === "zh" ? `到达电量约 ${plan.arrivalSoc}%，低于您设定的下限，但高于 8% 安全余量。如需更高余量，请在最后一站多充几分钟。` : `Arrival charge is about ${plan.arrivalSoc}%, below your target but above the 8% safety reserve. Add a few minutes at the last stop for more buffer.`}</p> : null}
            {plan.notes.includes("WINTER") ? <p className="text-xs text-ash">{locale === "zh" ? "冬季模式已按 -5℃ 与座舱加热修正能耗（约 +25%）。" : "Winter mode applies a -5 °C and cabin-heating correction (about +25% consumption)."}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function RouteStrip({ plan }: { plan: TripPlan }) {
  const { pick } = useI18n();
  const points = [
    { x: 0, label: pick(plan.origin.name), soc: null as number | null, network: null as string | null },
    ...plan.stops.map((s) => ({ x: s.distanceFromOriginKm / plan.distanceKm, label: pick(s.station.name).replace(/超级充电站|超充站|Supercharger|Fast Charger/g, "").trim(), soc: s.arrivalSoc, network: s.station.network })),
    { x: 1, label: pick(plan.destination.name), soc: plan.arrivalSoc, network: null },
  ];
  return (
    <div className="overflow-x-auto rounded-3xl bg-white p-6 hairline">
      <div className="relative h-24 min-w-[560px]">
        <div className="absolute left-3 right-3 top-6 h-1 rounded-full bg-line" />
        <div className="absolute left-3 right-3 top-6 h-1 rounded-full bg-gradient-to-r from-mi via-ink to-tesla opacity-70" />
        {points.map((p, i) => (
          <div key={i} className="absolute top-0 -translate-x-1/2" style={{ left: `calc(12px + ${p.x} * (100% - 24px))` }}>
            <div className={cn("mx-auto size-4 rounded-full border-2 border-white shadow-soft", p.network === "tesla" ? "bg-tesla" : p.network === "xiaomi" ? "bg-mi" : p.network === "partner" ? "bg-slate" : "bg-ink", "mt-4")} />
            <p className="mt-2 w-24 truncate text-center text-[11px] font-medium" title={p.label}>{p.label}</p>
            {p.soc !== null ? <p className="text-center text-[10px] tabular-nums text-ash">{p.soc}%</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
