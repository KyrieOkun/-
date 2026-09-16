"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { ClientVehicle, VehicleSelection } from "@/data/types";
import { useI18n } from "@/lib/i18n/provider";
import { computeQuote, encodeSelection, normalizeSelection } from "@/lib/pricing";
import { useSavedBuilds } from "@/lib/saved-builds";
import { cn, formatCNY, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  vehicles: ClientVehicle[];
  /** Restrict the list to one vehicle (used inside its configurator). */
  vehicleSlug?: string;
  /** Called when the user chooses to load a build into the current configurator. */
  onLoad?: (selection: VehicleSelection) => void;
  className?: string;
  emptyHint?: boolean;
}

export function SavedBuilds({ vehicles, vehicleSlug, onLoad, className, emptyHint = true }: Props) {
  const { t, pick, locale } = useI18n();
  const { builds, remove } = useSavedBuilds(vehicleSlug);
  const zh = locale === "zh";

  if (builds.length === 0) {
    if (!emptyHint) return null;
    return (
      <div className={cn("rounded-3xl bg-cloud p-6 text-sm text-slate hairline", className)}>
        {zh ? "尚未保存配置。在选配器中点击“保存配置”，方案会保存在本设备上。" : "No saved builds yet. Use “Save configuration” in the configurator to keep a build on this device."}
      </div>
    );
  }

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {builds.map((b) => {
        const vehicle = vehicles.find((v) => v.slug === b.vehicle);
        if (!vehicle) return null;
        const selection = normalizeSelection(vehicle, b.selection);
        const quote = computeQuote(vehicle, selection);
        const qs = encodeSelection(selection);
        return (
          <li key={b.id} className="flex gap-4 rounded-3xl bg-white p-4 hairline">
            <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist">
              <Image src={quote.paint.image ?? vehicle.hero.src} alt="" fill sizes="96px" className="object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {pick(vehicle.name)} <span className="font-normal text-slate">· {pick(quote.trim.name)}</span>
              </p>
              <p className="mt-0.5 truncate text-xs text-slate">
                {pick(quote.paint.name)} · {quote.wheel.size}&quot; · {pick(quote.interior.name)}
                {quote.extras.length ? ` · +${quote.extras.length} ${zh ? "选装" : "extras"}` : ""}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{formatCNY(quote.total)}</p>
              <p className="text-[11px] text-ash">{formatDateTime(b.savedAt, locale)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {onLoad && vehicleSlug === vehicle.slug ? (
                  <Button size="sm" variant="secondary" onClick={() => onLoad(selection)}>
                    {zh ? "载入" : "Load"}
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" href={`/vehicles/${vehicle.slug}/design?${qs}`}>
                    {t.nav.design}
                  </Button>
                )}
                {vehicle.availability !== "overseas" ? (
                  <Link href={`/order?vehicle=${vehicle.slug}&${qs}`} className="text-xs font-medium text-graphite underline-offset-4 hover:underline">
                    {t.nav.order}
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  className="ml-auto inline-flex items-center gap-1 rounded text-xs text-ash hover:text-danger focus-ring"
                  aria-label={`${zh ? "删除已保存配置" : "Delete saved build"} ${pick(vehicle.name)}`}
                >
                  <Trash2 className="size-3.5" />
                  {zh ? "删除" : "Delete"}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
