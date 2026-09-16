import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/data/types";
import { getDictionary, pick, type Locale } from "@/lib/i18n";
import { getBestAccel, getMaxRange, getStartingPrice } from "@/data/vehicles";
import { formatPriceHeadline, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

export function VehicleCard({ vehicle, locale, className, compact }: { vehicle: Vehicle; locale: Locale; className?: string; compact?: boolean }) {
  const t = getDictionary(locale);
  const price = getStartingPrice(vehicle);
  const range = getMaxRange(vehicle);
  const accel = getBestAccel(vehicle);
  const isOverseas = vehicle.availability === "overseas";
  const isErev = vehicle.powertrain === "erev";

  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-3xl bg-white hairline transition-shadow duration-300 hover:shadow-lift", className)}>
      <Link href={`/vehicles/${vehicle.slug}`} className="relative aspect-[16/10] overflow-hidden bg-mist" aria-label={pick(vehicle.name, locale)}>
        <Image
          src={vehicle.hero.src}
          alt={pick(vehicle.hero.alt, locale)}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone={vehicle.brand === "xiaomi" ? "mi" : "tesla"}>{vehicle.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</Badge>
          {vehicle.availability === "inventory" ? <Badge tone="neutral">{t.common.inventoryOnly}</Badge> : null}
          {isOverseas ? <Badge tone="neutral">{t.common.overseasOnly}</Badge> : null}
          {vehicle.launchDate >= "2026-01-01" && !isOverseas ? <Badge tone="dark">{t.common.new}</Badge> : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold tracking-tight">
              <Link href={`/vehicles/${vehicle.slug}`} className="focus-ring rounded">
                {pick(vehicle.name, locale)}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-slate">{pick(vehicle.tagline, locale)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] uppercase tracking-wider text-ash">{t.common.from}</p>
            <p className="whitespace-nowrap text-base font-semibold tabular-nums">{formatPriceHeadline(price, locale)}</p>
          </div>
        </div>
        {!compact ? (
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <div>
              <dt className="text-[11px] text-ash">{isErev ? (locale === "zh" ? "综合续航" : "Combined") : t.common.rangeCLTC}</dt>
              <dd className="text-sm font-semibold tabular-nums">
                {isErev ? Math.max(...vehicle.trims.map((tr) => tr.rangeKm)) : range} <span className="text-xs font-normal text-slate">km</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-ash">{t.common.accel}</dt>
              <dd className="text-sm font-semibold tabular-nums">
                {accel} <span className="text-xs font-normal text-slate">s</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-ash">{t.common.power}</dt>
              <dd className="text-sm font-semibold tabular-nums">
                {Math.max(...vehicle.trims.map((tr) => tr.powerKw))} <span className="text-xs font-normal text-slate">kW</span>
              </dd>
            </div>
          </dl>
        ) : null}
        <div className="mt-auto flex gap-2 pt-5">
          <Link
            href={isOverseas ? `/vehicles/${vehicle.slug}` : `/vehicles/${vehicle.slug}/design`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-pill bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            {isOverseas ? t.nav.learnMore : t.nav.design}
          </Link>
          <Link
            href={`/vehicles/${vehicle.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-pill bg-mist px-4 text-sm font-medium text-ink transition-colors hover:bg-line"
          >
            {t.common.seeDetails}
          </Link>
        </div>
      </div>
    </article>
  );
}
