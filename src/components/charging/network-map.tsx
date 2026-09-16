"use client";

import { useMemo, useState } from "react";
import type { Network } from "@/data/charging";
import { useI18n } from "@/lib/i18n/provider";
import type { L10n } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export interface MapStation {
  id: string;
  name: L10n;
  network: Network;
  lat: number;
  lng: number;
  maxKw: number;
  cityId: string;
}

export interface MapPoint {
  lat: number;
  lng: number;
  label?: L10n;
  network?: Network;
  kind?: "origin" | "destination" | "stop" | "via";
}

interface Props {
  stations: MapStation[];
  route?: MapPoint[];
  stops?: MapPoint[];
  activeNetwork?: Network | "all";
  className?: string;
  compact?: boolean;
  /** Draw the route as a faint dashed line (origin/destination chosen, not yet planned). */
  preview?: boolean;
}

// Schematic projection of the mainland charging network (equirectangular,
// no administrative boundaries drawn). Bounds cover 73–135°E, 18–54°N.
const LNG_MIN = 73;
const LNG_MAX = 135;
const LAT_MIN = 18;
const LAT_MAX = 54;
const W = 1000;
const H = 720;

function project(p: { lat: number; lng: number }): { x: number; y: number } {
  return {
    x: ((p.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W,
    y: ((LAT_MAX - p.lat) / (LAT_MAX - LAT_MIN)) * H,
  };
}

const COLOR: Record<Network, string> = { tesla: "#e82127", xiaomi: "#ff6900", partner: "#8e8e93" };

export function NetworkMap({ stations, route, stops, activeNetwork = "all", className, compact, preview }: Props) {
  const { t, pick, locale } = useI18n();
  const [hover, setHover] = useState<MapStation | null>(null);

  const dots = useMemo(() => stations.map((s) => ({ s, ...project(s) })), [stations]);
  const routePts = useMemo(() => (route ?? []).map((p) => ({ p, ...project(p) })), [route]);
  const stopPts = useMemo(() => (stops ?? []).map((p) => ({ p, ...project(p) })), [stops]);
  const counts = useMemo(
    () => stations.reduce<Record<Network, number>>((acc, s) => ({ ...acc, [s.network]: acc[s.network] + 1 }), { tesla: 0, xiaomi: 0, partner: 0 }),
    [stations],
  );

  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-[#0b0c0e] text-white", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={locale === "zh" ? "跨品牌充电网络示意图" : "Cross-brand charging network schematic"}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.08)" />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <ellipse cx={W * 0.62} cy={H * 0.55} rx={W * 0.35} ry={H * 0.4} fill="url(#glow)" />

        {/* Station dots */}
        {dots.map(({ s, x, y }) => {
          const dim = activeNetwork !== "all" && s.network !== activeNetwork;
          return (
            <g key={s.id} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
              <circle cx={x} cy={y} r={compact ? 3 : 3.6} fill={COLOR[s.network]} opacity={dim ? 0.18 : 0.9} />
              {!dim && s.maxKw >= 480 ? <circle cx={x} cy={y} r={7} fill={COLOR[s.network]} opacity={0.18} /> : null}
              <title>{`${pick(s.name)} · ${s.maxKw} kW`}</title>
            </g>
          );
        })}

        {/* Route */}
        {routePts.length > 1 && preview ? (
          <polyline points={routePts.map((r) => `${r.x},${r.y}`).join(" ")} fill="none" stroke="#ffffff" strokeWidth={1.5} strokeOpacity={0.45} strokeDasharray="6 8" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {routePts.length > 1 && !preview ? (
          <>
            <polyline points={routePts.map((r) => `${r.x},${r.y}`).join(" ")} fill="none" stroke="#ffffff" strokeWidth={10} strokeOpacity={0.25} strokeLinecap="round" strokeLinejoin="round" filter="url(#soft)" />
            <polyline points={routePts.map((r) => `${r.x},${r.y}`).join(" ")} fill="none" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {stopPts.map(({ p, x, y }, i) => (
          <g key={`${x}-${y}-${i}`}>
            <circle cx={x} cy={y} r={9} fill={p.network ? COLOR[p.network] : "#fff"} stroke="#0b0c0e" strokeWidth={3} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{i + 1}</text>
          </g>
        ))}
        {routePts.filter((r) => r.p.kind === "origin" || r.p.kind === "destination").map(({ p, x, y }) => (
          <g key={`${p.kind}-${x}-${y}`}>
            <circle cx={x} cy={y} r={11} fill="#fff" />
            <circle cx={x} cy={y} r={5} fill="#0b0c0e" />
            {p.label ? (
              <text x={x + 16} y={y + 5} fontSize="16" fontWeight="600" fill="#fff" stroke="#0b0c0e" strokeWidth="4" paintOrder="stroke">{pick(p.label)}</text>
            ) : null}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-3 text-[11px] text-white/80">
        <span className="flex items-center gap-1.5 rounded-pill bg-white/10 px-2.5 py-1 backdrop-blur"><span className="size-2 rounded-full bg-tesla" />{t.charging.filterTesla} · {counts.tesla}</span>
        <span className="flex items-center gap-1.5 rounded-pill bg-white/10 px-2.5 py-1 backdrop-blur"><span className="size-2 rounded-full bg-mi" />{t.charging.filterXiaomi} · {counts.xiaomi}</span>
        <span className="flex items-center gap-1.5 rounded-pill bg-white/10 px-2.5 py-1 backdrop-blur"><span className="size-2 rounded-full bg-ash" />{t.charging.filterPartner} · {counts.partner}</span>
      </div>
      {hover ? (
        <div className="pointer-events-none absolute right-4 top-4 max-w-[260px] rounded-2xl bg-white/95 px-3 py-2 text-xs text-ink shadow-lift">
          <p className="font-semibold">{pick(hover.name)}</p>
          <p className="text-slate">{hover.maxKw} kW · {hover.network === "tesla" ? t.charging.filterTesla : hover.network === "xiaomi" ? t.charging.filterXiaomi : t.charging.filterPartner}</p>
        </div>
      ) : (
        <p className="pointer-events-none absolute right-4 top-4 text-[11px] text-white/50">{locale === "zh" ? "示意图 · 不含行政边界" : "Schematic · no administrative boundaries"}</p>
      )}
    </div>
  );
}
