"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { ClientVehicle } from "@/data/types";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatCNY, formatPriceFrom, formatPriceHeadline } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useScrollLock } from "@/lib/use-scroll-lock";

interface Slot {
  slug: string;
  trimId: string;
}

const MAX = 4;

export function CompareTable({ vehicles }: { vehicles: ClientVehicle[] }) {
  const { t, pick, locale } = useI18n();
  const params = useSearchParams();
  const bySlug = useMemo(() => Object.fromEntries(vehicles.map((v) => [v.slug, v])), [vehicles]);

  const [slots, setSlots] = useState<Slot[]>(() => {
    // `?v=slug:trim,slug:trim` — the trim part is optional and defaults to the entry trim.
    const raw = params.get("v")?.split(",").filter(Boolean) ?? [];
    const initial = raw
      .map((entry) => entry.split(":"))
      .filter(([slug]) => bySlug[slug])
      .slice(0, MAX)
      .map(([slug, trimId]) => ({ slug, trimId: bySlug[slug].trims.some((tr) => tr.id === trimId) ? trimId : bySlug[slug].trims[0].id }));
    if (initial.length === 0) return [
      { slug: "xiaomi-su7", trimId: "max" },
      { slug: "tesla-model-3", trimId: "lr-awd" },
    ].filter((s) => bySlug[s.slug]);
    if (initial.length === 1) {
      // Arriving from a single vehicle: pre-fill its closest cross-brand rival so
      // the table is immediately meaningful.
      const base = bySlug[initial[0].slug];
      const basePrice = Math.min(...base.trims.map((tr) => tr.price));
      const rival = vehicles
        .filter((v) => v.brand !== base.brand && v.availability !== "overseas")
        .map((v) => ({ v, score: (v.bodyType === base.bodyType ? 0 : 1) * 1_000_000 + Math.abs(Math.min(...v.trims.map((tr) => tr.price)) - basePrice) }))
        .sort((a, b) => a.score - b.score)[0]?.v;
      if (rival) initial.push({ slug: rival.slug, trimId: rival.trims[0].id });
    }
    return initial;
  });
  const [diffOnly, setDiffOnly] = useState(false);
  const [picker, setPicker] = useState(false);
  const pickerCloseRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);
  useScrollLock(picker);

  useEffect(() => {
    // Don't rewrite a clean URL on mount; only reflect user changes.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const qs = slots.length ? `?v=${slots.map((s) => `${s.slug}:${s.trimId}`).join(",")}` : "";
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs}`);
  }, [slots]);

  useEffect(() => {
    if (!picker) return;
    const trigger = addButtonRef.current;
    pickerCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicker(false);
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Keep Tab inside the dialog.
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [picker]);

  const columns = useMemo(
    () =>
      slots.map((s) => {
        const v = bySlug[s.slug];
        const trim = v.trims.find((tr) => tr.id === s.trimId) ?? v.trims[0];
        return { v, trim, slot: s };
      }),
    [slots, bySlug],
  );

  type Row = { key: string; label: string; values: string[]; group?: string };
  const rows: Row[] = useMemo(() => {
    const fmt = (n: number | undefined, unit = "") => (n === undefined ? "—" : `${n}${unit}`);
    const build: Row[] = [
      { key: "price", label: t.common.price, values: columns.map((c) => formatPriceHeadline(c.trim.price, locale)) },
      { key: "brand", label: t.nav.vehicles, values: columns.map((c) => (c.v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla)) },
      { key: "segment", label: t.vehicles.bodyFilter, values: columns.map((c) => pick(c.v.segment)) },
      { key: "drive", label: t.common.drivetrain, values: columns.map((c) => pick(c.trim.drivetrain)) },
      { key: "power", label: t.common.power, values: columns.map((c) => `${c.trim.powerKw} kW / ${c.trim.powerPs} PS`) },
      { key: "torque", label: locale === "zh" ? "峰值扭矩" : "Peak torque", values: columns.map((c) => fmt(c.trim.torqueNm, " N·m")) },
      { key: "accel", label: t.common.accel, values: columns.map((c) => `${c.trim.accel} s`) },
      { key: "top", label: t.common.topSpeed, values: columns.map((c) => `${c.trim.topSpeed} km/h`) },
      { key: "battery", label: t.common.battery, values: columns.map((c) => `${c.trim.batteryKwh} kWh · ${pick(c.trim.batteryType)}`) },
      { key: "range", label: locale === "zh" ? "续航" : "Range", values: columns.map((c) => (c.trim.evRangeKm ? `${c.trim.rangeKm} km (${locale === "zh" ? "纯电" : "EV"} ${c.trim.evRangeKm} km)` : `${c.trim.rangeKm} km ${c.trim.rangeStandard}`)) },
      { key: "charge", label: locale === "zh" ? "充电峰值" : "Peak charging", values: columns.map((c) => fmt(c.trim.peakChargeKw, " kW")) },
      { key: "charge1080", label: "10-80%", values: columns.map((c) => fmt(c.trim.charge10to80Min, ` ${t.common.min}`)) },
      { key: "voltage", label: locale === "zh" ? "平台电压" : "Architecture", values: columns.map((c) => c.trim.platformVoltage ?? "—") },
      { key: "seats", label: t.common.seats, values: columns.map((c) => String(c.trim.seats)) },
      { key: "length", label: t.vehicles.length, values: columns.map((c) => `${c.v.dimensions.length} mm`) },
      { key: "width", label: t.vehicles.width, values: columns.map((c) => `${c.v.dimensions.width} mm`) },
      { key: "height", label: t.vehicles.height, values: columns.map((c) => `${c.v.dimensions.height} mm`) },
      { key: "wheelbase", label: t.vehicles.wheelbase, values: columns.map((c) => `${c.v.dimensions.wheelbase} mm`) },
      { key: "cargo", label: t.vehicles.cargo, values: columns.map((c) => (c.v.cargoL ? `${c.v.cargoL} L${c.v.frunkL ? ` + ${c.v.frunkL} L` : ""}` : "—")) },
      { key: "weight", label: locale === "zh" ? "整备质量" : "Kerb weight", values: columns.map((c) => fmt(c.trim.weightKg, " kg")) },
      { key: "delivery", label: t.configurator.deliveryEta, values: columns.map((c) => `${c.trim.deliveryWeeks[0]}-${c.trim.deliveryWeeks[1]} ${t.common.weeks}`) },
      { key: "deposit", label: t.common.deposit, values: columns.map((c) => formatCNY(c.v.deposit)) },
      { key: "warranty", label: t.vehicles.warranty, values: columns.map((c) => pick(c.v.warranty[0])) },
    ];
    return diffOnly ? build.filter((r) => new Set(r.values).size > 1) : build;
  }, [columns, diffOnly, locale, pick, t]);

  const addVehicle = (slug: string) => {
    if (slots.length >= MAX || slots.some((s) => s.slug === slug)) return;
    setSlots([...slots, { slug, trimId: bySlug[slug].trims[0].id }]);
    setPicker(false);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="size-4 rounded border-line accent-ink" />
          {t.compare.highlightDiff}
        </label>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSlots([])}>{t.compare.clear}</Button>
          <Button ref={addButtonRef} size="sm" onClick={() => setPicker(true)} disabled={slots.length >= MAX} icon={<Plus className="size-4" />}>{t.compare.add}</Button>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-3xl bg-mist p-12 text-center text-slate">{t.compare.empty}</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl hairline">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-44 bg-white p-4 text-left align-bottom text-xs font-semibold uppercase tracking-wider text-ash">{t.compare.title}</th>
                {columns.map(({ v, trim, slot }) => (
                  <th key={slot.slug} scope="col" aria-label={`${pick(v.name)} · ${pick(trim.name)}`} className="min-w-[200px] bg-white p-4 text-left align-top">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist">
                      <Image src={v.hero.src} alt={pick(v.hero.alt)} fill sizes="240px" className="object-cover" />
                      <button type="button" onClick={() => setSlots(slots.filter((s) => s.slug !== slot.slug))} className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-ink focus-ring" aria-label={`${t.compare.remove} ${pick(v.name)}`}>
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ash">
                      <span className={cn("size-1.5 rounded-full", v.brand === "xiaomi" ? "bg-mi" : "bg-tesla")} />
                      {v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}
                    </p>
                    <Link href={`/vehicles/${v.slug}`} className="mt-1 block text-base font-semibold hover:underline">{pick(v.name)}</Link>
                    <select
                      value={trim.id}
                      onChange={(e) => setSlots(slots.map((s) => (s.slug === slot.slug ? { ...s, trimId: e.target.value } : s)))}
                      className="mt-2 h-9 w-full rounded-xl border border-line bg-white pl-3 pr-9 text-xs font-normal focus:border-ink focus:outline-none"
                      aria-label={`${t.compare.chooseTrim} · ${pick(v.name)}`}
                    >
                      {v.trims.map((tr) => (
                        <option key={tr.id} value={tr.id}>{pick(tr.name)}</option>
                      ))}
                    </select>
                  </th>
                ))}
                {slots.length < MAX ? (
                  <th scope="col" className="min-w-[200px] bg-white p-4 align-top">
                    <button type="button" onClick={() => setPicker(true)} className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ash text-sm text-slate hover:border-ink hover:text-ink focus-ring">
                      <Plus className="size-5" />
                      {t.compare.add}
                    </button>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const differs = new Set(row.values).size > 1;
                return (
                  <tr key={row.key} className={i % 2 === 0 ? "bg-cloud" : "bg-white"}>
                    <th scope="row" className={cn("sticky left-0 z-10 p-4 text-left font-medium text-graphite", i % 2 === 0 ? "bg-cloud" : "bg-white")}>{row.label}</th>
                    {row.values.map((val, j) => (
                      <td key={j} className={cn("p-4 tabular-nums", differs && "font-medium text-ink")}>{val}</td>
                    ))}
                    {slots.length < MAX ? <td /> : null}
                  </tr>
                );
              })}
              <tr>
                <td className="sticky left-0 z-10 bg-white p-4" />
                {columns.map(({ v }) => (
                  <td key={v.slug} className="bg-white p-4">
                    {v.availability !== "overseas" ? (
                      <Button href={`/vehicles/${v.slug}/design`} size="sm" fullWidth>{t.vehicles.designCta}</Button>
                    ) : (
                      <Button href={`/vehicles/${v.slug}`} size="sm" variant="secondary" fullWidth>{t.nav.learnMore}</Button>
                    )}
                  </td>
                ))}
                {slots.length < MAX ? <td className="bg-white" /> : null}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {picker ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={t.compare.add} onClick={() => setPicker(false)}>
          <div ref={dialogRef} className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t.compare.add}</h2>
              <button ref={pickerCloseRef} type="button" onClick={() => setPicker(false)} className="flex size-9 items-center justify-center rounded-full bg-mist focus-ring" aria-label={t.nav.close}><X className="size-4" /></button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {vehicles.map((v) => {
                const taken = slots.some((s) => s.slug === v.slug);
                return (
                  <li key={v.slug}>
                    <button type="button" disabled={taken} onClick={() => addVehicle(v.slug)} className={cn("flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left transition-colors hover:border-ink focus-ring", taken && "opacity-40")}>
                      <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
                        <Image src={v.hero.src} alt="" fill sizes="96px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{pick(v.name)}</span>
                        <span className="block text-xs text-slate">{formatPriceFrom(Math.min(...v.trims.map((tr) => tr.price)), locale)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
