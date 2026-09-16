"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import type { L10n } from "@/lib/i18n/types";
import { cn, formatPriceHeadline } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

export interface ExplorerVehicle {
  slug: string;
  brand: "xiaomi" | "tesla";
  bodyType: "sedan" | "suv" | "truck";
  powertrain: "bev" | "erev";
  name: L10n;
  tagline: L10n;
  hero: string;
  heroAlt: L10n;
  price: number;
  rangeKm: number;
  accel: number;
  powerKw: number;
  availability: string;
  launchDate: string;
  isPerformance: boolean;
  trimCount: number;
}

type Sort = "default" | "priceAsc" | "priceDesc" | "range" | "accel";
type BrandFilter = "all" | "xiaomi" | "tesla";
type BodyFilter = "all" | "sedan" | "suv" | "truck" | "performance";

const BRANDS: BrandFilter[] = ["all", "xiaomi", "tesla"];
const BODIES: BodyFilter[] = ["all", "sedan", "suv", "truck", "performance"];
const SORTS: Sort[] = ["default", "priceAsc", "priceDesc", "range", "accel"];

function pickParam<T extends string>(value: string | null, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function VehicleExplorer({ vehicles }: { vehicles: ExplorerVehicle[] }) {
  const { t, pick, locale } = useI18n();
  const params = useSearchParams();
  const [brand, setBrand] = useState<BrandFilter>(() => pickParam(params.get("brand"), BRANDS, "all"));
  const [body, setBody] = useState<BodyFilter>(() => pickParam(params.get("body"), BODIES, "all"));
  const [sort, setSort] = useState<Sort>(() => pickParam(params.get("sort"), SORTS, "default"));

  // Keep filters shareable and stable across back/forward without triggering navigation.
  useEffect(() => {
    const qs = new URLSearchParams();
    if (brand !== "all") qs.set("brand", brand);
    if (body !== "all") qs.set("body", body);
    if (sort !== "default") qs.set("sort", sort);
    const search = qs.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }, [brand, body, sort]);

  const list = useMemo(() => {
    let out = vehicles.filter((v) => (brand === "all" ? true : v.brand === brand));
    out = out.filter((v) => {
      if (body === "all") return true;
      if (body === "performance") return v.isPerformance;
      return v.bodyType === body;
    });
    const sorted = [...out];
    switch (sort) {
      case "priceAsc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "range":
        sorted.sort((a, b) => b.rangeKm - a.rangeKm);
        break;
      case "accel":
        sorted.sort((a, b) => a.accel - b.accel);
        break;
    }
    return sorted;
  }, [vehicles, brand, body, sort]);

  const chip = (active: boolean) =>
    cn("h-9 rounded-pill px-4 text-sm font-medium transition-colors focus-ring", active ? "bg-ink text-white" : "bg-mist text-graphite hover:bg-line");

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-5 border-b border-line bg-white/85 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 hidden text-xs font-semibold uppercase tracking-wider text-ash sm:inline">{t.vehicles.brandFilter}</span>
          <button type="button" aria-pressed={brand === "all"} className={chip(brand === "all")} onClick={() => setBrand("all")}>{t.common.all}</button>
          <button type="button" aria-pressed={brand === "xiaomi"} className={chip(brand === "xiaomi")} onClick={() => setBrand("xiaomi")}>{t.nav.xiaomi}</button>
          <button type="button" aria-pressed={brand === "tesla"} className={chip(brand === "tesla")} onClick={() => setBrand("tesla")}>{t.nav.tesla}</button>
          <span className="mx-2 hidden h-5 w-px bg-line sm:block" />
          <span className="mr-1 hidden text-xs font-semibold uppercase tracking-wider text-ash sm:inline">{t.vehicles.bodyFilter}</span>
          <button type="button" aria-pressed={body === "all"} className={chip(body === "all")} onClick={() => setBody("all")}>{t.common.all}</button>
          <button type="button" aria-pressed={body === "sedan"} className={chip(body === "sedan")} onClick={() => setBody("sedan")}>{t.vehicles.sedan}</button>
          <button type="button" aria-pressed={body === "suv"} className={chip(body === "suv")} onClick={() => setBody("suv")}>{t.vehicles.suv}</button>
          <button type="button" aria-pressed={body === "truck"} className={chip(body === "truck")} onClick={() => setBody("truck")}>{t.vehicles.truck}</button>
          <button type="button" aria-pressed={body === "performance"} className={chip(body === "performance")} onClick={() => setBody("performance")}>{t.vehicles.performance}</button>
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort" className="text-xs font-semibold uppercase tracking-wider text-ash">{t.vehicles.sortBy}</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 rounded-pill border border-line bg-white pl-3 pr-9 text-sm focus:border-ink focus:outline-none">
              <option value="default">{t.vehicles.sortDefault}</option>
              <option value="priceAsc">{t.vehicles.sortPriceAsc}</option>
              <option value="priceDesc">{t.vehicles.sortPriceDesc}</option>
              <option value="range">{t.vehicles.sortRange}</option>
              <option value="accel">{t.vehicles.sortAccel}</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate" aria-live="polite">
        {list.length} {t.vehicles.results}
      </p>

      {list.length === 0 ? (
        <p className="mt-10 rounded-3xl bg-mist p-10 text-center text-slate">{t.vehicles.noResults}</p>
      ) : (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((v, i) => (
            <Reveal key={v.slug} as="li" delay={(i % 3) * 60}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white hairline transition-shadow hover:shadow-lift">
                <Link href={`/vehicles/${v.slug}`} className="relative aspect-[16/10] overflow-hidden bg-mist">
                  <Image src={v.hero} alt={pick(v.heroAlt)} fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge tone={v.brand === "xiaomi" ? "mi" : "tesla"}>{v.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</Badge>
                    {v.availability === "inventory" ? <Badge tone="neutral">{t.common.inventoryOnly}</Badge> : null}
                    {v.availability === "overseas" ? <Badge tone="neutral">{t.common.overseasOnly}</Badge> : null}
                    {v.launchDate >= "2026-01-01" && v.availability !== "overseas" ? <Badge tone="dark">{t.common.new}</Badge> : null}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold tracking-tight">{pick(v.name)}</h2>
                      <p className="mt-1 text-sm text-slate">{pick(v.tagline)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] uppercase tracking-wider text-ash">{t.common.from}</p>
                      <p className="whitespace-nowrap text-base font-semibold tabular-nums">{formatPriceHeadline(v.price, locale)}</p>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
                    <div>
                      <dt className="text-[11px] text-ash">{v.powertrain === "erev" ? (locale === "zh" ? "综合续航" : "Combined range") : t.common.rangeCLTC}</dt>
                      <dd className="text-sm font-semibold tabular-nums">{v.rangeKm} <span className="text-xs font-normal text-slate">km</span></dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-ash">{t.common.accel}</dt>
                      <dd className="text-sm font-semibold tabular-nums">{v.accel} <span className="text-xs font-normal text-slate">s</span></dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-ash">{t.common.power}</dt>
                      <dd className="text-sm font-semibold tabular-nums">{v.powerKw} <span className="text-xs font-normal text-slate">kW</span></dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex gap-2 pt-5">
                    <Link href={v.availability === "overseas" ? `/vehicles/${v.slug}` : `/vehicles/${v.slug}/design`} className="inline-flex h-10 flex-1 items-center justify-center rounded-pill bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-black">
                      {v.availability === "overseas" ? t.nav.learnMore : t.nav.design}
                    </Link>
                    <Link href={`/compare?v=${v.slug}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-pill bg-mist px-4 text-sm font-medium transition-colors hover:bg-line">
                      {t.vehicles.compareCta}
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
