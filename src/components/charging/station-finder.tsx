"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, RefreshCw, Zap } from "lucide-react";
import type { Station, Network } from "@/data/charging";
import type { City } from "@/data/cities";
import type { LiveAvailability } from "@/lib/charging";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

type LiveStation = Station & { live: LiveAvailability };

const AMENITY: Record<string, { zh: string; en: string }> = {
  wifi: { zh: "Wi-Fi", en: "Wi-Fi" },
  cafe: { zh: "咖啡", en: "Café" },
  restroom: { zh: "洗手间", en: "Restroom" },
  "24h": { zh: "24 小时", en: "24h" },
  shopping: { zh: "商场", en: "Mall" },
  lounge: { zh: "车主休息室", en: "Lounge" },
  food: { zh: "餐饮", en: "Food" },
};

export function StationFinder({ cities }: { cities: City[] }) {
  const { t, pick, locale } = useI18n();
  const [network, setNetwork] = useState<"all" | Network>("all");
  const [cityId, setCityId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<LiveStation[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch<{ stations: LiveStation[]; updatedAt: string }>("/api/charging/stations");
    setStations(res.data?.stations ?? []);
    setUpdatedAt(res.data?.updatedAt ?? null);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 60_000);
    return () => clearInterval(id);
  }, []);

  const cityMap = useMemo(() => Object.fromEntries(cities.map((c) => [c.id, c])), [cities]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stations.filter((s) => {
      if (network !== "all" && s.network !== network) return false;
      if (cityId !== "all" && s.cityId !== cityId) return false;
      if (q) {
        const hay = `${s.name.zh} ${s.name.en} ${s.address.zh} ${s.address.en} ${cityMap[s.cityId]?.name.zh ?? ""} ${cityMap[s.cityId]?.name.en ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stations, network, cityId, query, cityMap]);

  const cityOptions = useMemo(() => cities.filter((c) => stations.some((s) => s.cityId === c.id)), [cities, stations]);
  const totals = useMemo(() => filtered.reduce((acc, s) => ({ stalls: acc.stalls + s.stalls, available: acc.available + s.live.available }), { stalls: 0, available: 0 }), [filtered]);

  const chip = (active: boolean, tone?: "mi" | "tesla") =>
    cn("h-9 rounded-pill px-4 text-sm font-medium transition-colors focus-ring", active ? (tone === "mi" ? "bg-mi text-white" : tone === "tesla" ? "bg-tesla text-white" : "bg-ink text-white") : "bg-mist text-graphite hover:bg-line");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={chip(network === "all")} onClick={() => setNetwork("all")}>{t.charging.filterAll}</button>
        <button className={chip(network === "tesla", "tesla")} onClick={() => setNetwork("tesla")}>{t.charging.filterTesla}</button>
        <button className={chip(network === "xiaomi", "mi")} onClick={() => setNetwork("xiaomi")}>{t.charging.filterXiaomi}</button>
        <button className={chip(network === "partner")} onClick={() => setNetwork("partner")}>{t.charging.filterPartner}</button>
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="h-9 rounded-pill border border-line bg-white pl-3 pr-9 text-sm focus:border-ink focus:outline-none" aria-label={t.forms.city}>
          <option value="all">{locale === "zh" ? "全部城市 / 高速" : "All cities / corridors"}</option>
          {cityOptions.map((c) => (
            <option key={c.id} value={c.id}>{pick(c.name)}</option>
          ))}
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === "zh" ? "搜索站点 / 地址" : "Search station / address"} className="h-9 min-w-[200px] flex-1 rounded-pill border border-line bg-white px-4 text-sm focus:border-ink focus:outline-none" aria-label={t.common.search} />
        <button type="button" onClick={() => void load()} className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-mist px-3 text-xs font-medium text-graphite hover:bg-line focus-ring" aria-label={t.common.retry}>
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          {updatedAt ? formatDateTime(updatedAt, locale) : t.common.loading}
        </button>
      </div>

      <p className="mt-4 text-sm text-slate" aria-live="polite">
        {filtered.length} {locale === "zh" ? "个站点" : "stations"} · {totals.available}/{totals.stalls} {t.charging.available}
      </p>

      <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(loading && stations.length === 0 ? Array.from({ length: 6 }) : filtered).map((s, i) => {
          if (!s) return <li key={i} className="h-52 animate-pulse rounded-3xl bg-mist" />;
          const st = s as LiveStation;
          const ratio = st.live.available / Math.max(1, st.stalls);
          return (
            <li key={st.id} className="flex flex-col rounded-3xl bg-white p-5 hairline">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ash">
                    <span className={cn("size-1.5 rounded-full", st.network === "tesla" ? "bg-tesla" : st.network === "xiaomi" ? "bg-mi" : "bg-slate")} />
                    {pick(st.kind)}
                  </p>
                  <h3 className="mt-1 truncate font-semibold" title={pick(st.name)}>{pick(st.name)}</h3>
                  <p className="mt-0.5 flex items-start gap-1 text-xs text-slate"><MapPin className="mt-0.5 size-3 shrink-0" />{pick(st.address)}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-2xl font-semibold tabular-nums", ratio === 0 ? "text-danger" : ratio < 0.3 ? "text-warning" : "text-success")}>{st.live.available}</p>
                  <p className="text-[11px] text-ash">/ {st.stalls} {t.charging.available}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="dark"><Zap className="size-3" />{st.maxKw} kW</Badge>
                {st.openToAll ? <Badge tone="success">{t.charging.openToAll}</Badge> : null}
                {st.corridor ? <Badge tone="neutral">{st.corridor}</Badge> : null}
                {st.amenities.slice(0, 3).map((a) => (
                  <Badge key={a} tone="neutral">{pick(AMENITY[a] ?? { zh: a, en: a })}</Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate">
                <span>¥{st.pricePerKwh.toFixed(2)}/kWh · {st.hours}</span>
                <a href={`https://uri.amap.com/marker?position=${st.lng},${st.lat}&name=${encodeURIComponent(pick(st.name))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-ink underline-offset-4 hover:underline">
                  <Navigation className="size-3.5" />{t.charging.navigate}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      {!loading && filtered.length === 0 ? <p className="mt-6 rounded-3xl bg-mist p-10 text-center text-slate">{t.vehicles.noResults}</p> : null}
    </div>
  );
}
