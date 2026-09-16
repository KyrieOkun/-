"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Link2, Save, ChevronRight } from "lucide-react";
import type { ClientVehicle, VehicleSelection } from "@/data/types";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatCNY, formatPriceHeadline } from "@/lib/utils";
import {
  availableExtras,
  availableInteriors,
  availablePaints,
  availableWheels,
  computeQuote,
  decodeSelection,
  encodeSelection,
  isIncludedInTrim,
  normalizeSelection,
} from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { saveBuild } from "@/lib/saved-builds";
import { InteriorSwatch, PaintPanel, PaintSwatch, WheelGlyph } from "./swatches";
import { SavedBuilds } from "./saved-builds";

export function Configurator({ vehicle }: { vehicle: ClientVehicle }) {
  const { t, pick, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selection, setSelection] = useState<VehicleSelection>(() => normalizeSelection(vehicle, decodeSelection(searchParams)));
  const [toast, setToast] = useState<string | null>(null);

  const quote = useMemo(() => computeQuote(vehicle, selection), [vehicle, selection]);
  const trimId = selection.trimId;
  const paints = availablePaints(vehicle, trimId);
  const wheels = availableWheels(vehicle, trimId);
  const interiors = availableInteriors(vehicle, trimId);
  const extras = availableExtras(vehicle, trimId);

  useEffect(() => {
    const qs = encodeSelection(selection);
    const url = `${window.location.pathname}?${qs}`;
    window.history.replaceState(window.history.state, "", url);
  }, [selection]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const update = useCallback(
    (patch: Partial<VehicleSelection>) => setSelection((prev) => normalizeSelection(vehicle, { ...prev, ...patch })),
    [vehicle],
  );

  const toggleExtra = (id: string) =>
    update({ extraIds: selection.extraIds.includes(id) ? selection.extraIds.filter((x) => x !== id) : [...selection.extraIds, id] });

  const orderHref = `/order?vehicle=${vehicle.slug}&${encodeSelection(selection)}`;

  const saveConfig = () => {
    try {
      saveBuild({ vehicle: vehicle.slug, selection, total: quote.total });
      setToast(locale === "zh" ? "配置已保存到本设备" : "Configuration saved on this device");
    } catch {
      setToast(t.common.error);
    }
  };

  const shareConfig = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: pick(vehicle.name), url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast(t.common.copied);
      }
    } catch {
      /* user cancelled */
    }
  };

  const groupedExtras = useMemo(() => {
    const order = ["adas", "performance", "comfort", "exterior", "charging", "service"] as const;
    const labels: Record<(typeof order)[number], string> =
      locale === "zh"
        ? { adas: "智能驾驶", performance: "性能", comfort: "舒适与座舱", exterior: "外观", charging: "充电", service: "服务" }
        : { adas: "Autopilot & ADAS", performance: "Performance", comfort: "Comfort & cabin", exterior: "Exterior", charging: "Charging", service: "Service" };
    return order
      .map((cat) => ({ cat, label: labels[cat], items: extras.filter((e) => e.category === cat) }))
      .filter((g) => g.items.length > 0);
  }, [extras, locale]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
      {/* Visual */}
      <div className="lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:overflow-hidden">
        <div className="relative aspect-[16/10] bg-carbon lg:h-[62%] lg:aspect-auto">
          <Image
            key={quote.paint.image ?? vehicle.hero.src}
            src={quote.paint.image ?? vehicle.hero.src}
            alt={`${pick(vehicle.name)} · ${pick(quote.paint.name)}`}
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="animate-fade-in object-cover"
          />
          <div className="scrim-b absolute inset-x-0 bottom-0 h-1/2" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/85 px-3 py-2 backdrop-blur sm:bottom-6 sm:left-6">
            <PaintSwatch paint={quote.paint} size={28} />
            <div>
              <p className="text-xs font-semibold text-ink">{pick(quote.paint.name)}</p>
              <p className="text-[11px] text-slate">{t.configurator.paintFinish[quote.paint.finish]}{quote.paint.image ? "" : ` · ${locale === "zh" ? "示意色板" : "colour sample"}`}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 bg-cloud p-4 sm:p-6 lg:h-[38%]">
          <div className="flex flex-col gap-2 overflow-hidden">
            {quote.paint.image ? (
              <div className="relative min-h-24 flex-1 overflow-hidden rounded-3xl bg-mist hairline">
                <Image src={quote.paint.image} alt={pick(quote.paint.name)} fill sizes="20vw" className="object-cover" />
              </div>
            ) : (
              <PaintPanel paint={quote.paint} className="min-h-24 flex-1" />
            )}
            <p className="truncate text-xs text-slate">{t.configurator.color} · <span className="font-medium text-ink">{pick(quote.paint.name)}</span></p>
          </div>
          <div className="flex flex-col gap-2 overflow-hidden">
            {quote.wheel.image ? (
              <div className="relative min-h-24 flex-1 overflow-hidden rounded-3xl bg-white hairline">
                <Image src={quote.wheel.image} alt={pick(quote.wheel.name)} fill sizes="20vw" className="object-cover" />
              </div>
            ) : (
              <div className="flex min-h-24 flex-1 items-center justify-center rounded-3xl bg-white hairline">
                <WheelGlyph wheel={quote.wheel} size={88} />
              </div>
            )}
            <p className="truncate text-xs text-slate">{t.configurator.wheel} · <span className="font-medium text-ink">{quote.wheel.size}&quot;</span></p>
          </div>
          <div className="flex flex-col gap-2 overflow-hidden">
            {quote.interior.image ? (
              <div className="relative min-h-24 flex-1 overflow-hidden rounded-3xl bg-mist hairline">
                <Image src={quote.interior.image} alt={pick(quote.interior.name)} fill sizes="20vw" className="object-cover" />
              </div>
            ) : (
              <div className="relative min-h-24 flex-1 overflow-hidden rounded-3xl hairline" style={{ background: `linear-gradient(160deg, ${quote.interior.primary} 0 62%, ${quote.interior.secondary} 62% 100%)` }}>
                <div className="metallic absolute inset-0 opacity-60" />
              </div>
            )}
            <p className="truncate text-xs text-slate">{t.configurator.interior} · <span className="font-medium text-ink">{pick(quote.interior.name)}</span></p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="px-5 pb-40 pt-8 sm:px-8 lg:h-[calc(100vh-56px)] lg:overflow-y-auto lg:px-10 lg:pb-12">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ash">{t.configurator.title}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{pick(vehicle.name)}</h1>
          <p className="mt-1 text-sm text-slate">{pick(vehicle.tagline)}</p>
        </div>

        {/* Trim */}
        <Step index={1} title={t.configurator.trim}>
          <div className="space-y-3">
            {vehicle.trims.map((tr) => {
              const active = tr.id === trimId;
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => update({ trimId: tr.id })}
                  aria-pressed={active}
                  className={cn("w-full rounded-2xl border p-4 text-left transition-all focus-ring", active ? "border-ink ring-1 ring-ink" : "border-line hover:border-ash")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{pick(tr.name)}</p>
                      <p className="mt-0.5 text-xs text-slate">{pick(tr.drivetrain)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatPriceHeadline(tr.price, locale)}</p>
                      {tr.badge ? <Badge tone="dark" className="mt-1">{pick(tr.badge)}</Badge> : null}
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div><dt className="text-ash">{vehicle.powertrain === "erev" ? (locale === "zh" ? "综合续航" : "Combined") : t.configurator.range}</dt><dd className="font-medium tabular-nums">{tr.rangeKm} km</dd></div>
                    <div><dt className="text-ash">{t.common.accel}</dt><dd className="font-medium tabular-nums">{tr.accel} s</dd></div>
                    <div><dt className="text-ash">{t.common.power}</dt><dd className="font-medium tabular-nums">{tr.powerKw} kW</dd></div>
                  </dl>
                </button>
              );
            })}
          </div>
        </Step>

        {/* Paint */}
        <Step index={2} title={t.configurator.color} meta={`${pick(quote.paint.name)} · ${quote.paint.price === 0 ? t.common.included : `+${formatCNY(quote.paint.price)}`}`}>
          <div className="flex flex-wrap gap-3">
            {paints.map((p) => (
              <button key={p.id} type="button" onClick={() => update({ paintId: p.id })} aria-label={pick(p.name)} aria-pressed={p.id === selection.paintId} className="focus-ring rounded-full">
                <PaintSwatch paint={p} size={44} selected={p.id === selection.paintId} />
              </button>
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-graphite">
            {paints.map((p) => (
              <li key={p.id} className={cn("flex items-center justify-between gap-2 rounded-lg px-2 py-1", p.id === selection.paintId && "bg-mist font-medium text-ink")}>
                <span className="flex items-center gap-2 truncate"><PaintSwatch paint={p} size={10} />{pick(p.name)}</span>
                <span className="tabular-nums text-ash">{p.price === 0 ? t.common.included : `+${formatCNY(p.price)}`}</span>
              </li>
            ))}
          </ul>
        </Step>

        {/* Wheels */}
        <Step index={3} title={t.configurator.wheel} meta={`${pick(quote.wheel.name)} · ${quote.wheel.price === 0 ? t.common.included : `+${formatCNY(quote.wheel.price)}`}`}>
          <div className="grid grid-cols-2 gap-3">
            {wheels.map((w) => {
              const active = w.id === selection.wheelId;
              return (
                <button key={w.id} type="button" onClick={() => update({ wheelId: w.id })} aria-pressed={active} className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left transition-all focus-ring", active ? "border-ink ring-1 ring-ink" : "border-line hover:border-ash")}>
                  {w.image ? (
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-mist">
                      <Image src={w.image} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                  ) : (
                    <WheelGlyph wheel={w} size={56} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{pick(w.name)}</p>
                    <p className="text-xs text-slate">{w.price === 0 ? t.common.included : `+${formatCNY(w.price)}`}{w.rangeDeltaKm ? ` · ${w.rangeDeltaKm > 0 ? "+" : ""}${w.rangeDeltaKm} km ${t.configurator.range}` : ""}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Step>

        {/* Interior */}
        <Step index={4} title={t.configurator.interior} meta={`${pick(quote.interior.name)} · ${quote.interior.price === 0 ? t.common.included : `+${formatCNY(quote.interior.price)}`}`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {interiors.map((i) => {
              const active = i.id === selection.interiorId;
              return (
                <button key={i.id} type="button" onClick={() => update({ interiorId: i.id })} aria-pressed={active} className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left transition-all focus-ring", active ? "border-ink ring-1 ring-ink" : "border-line hover:border-ash")}>
                  {i.image ? (
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-mist">
                      <Image src={i.image} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                  ) : (
                    <InteriorSwatch interior={i} size={44} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{pick(i.name)}</p>
                    <p className="truncate text-xs text-slate">{pick(i.material)} · {i.price === 0 ? t.common.included : `+${formatCNY(i.price)}`}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Step>

        {/* Extras */}
        <Step index={5} title={t.configurator.extras} meta={quote.extras.length ? `+${formatCNY(quote.extrasPrice)}` : undefined}>
          <div className="space-y-6">
            {groupedExtras.map((group) => (
              <div key={group.cat}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash">{group.label}</p>
                <div className="space-y-2">
                  {group.items.map((e) => {
                    const included = isIncludedInTrim(e, trimId);
                    const active = included || selection.extraIds.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        disabled={included}
                        onClick={() => toggleExtra(e.id)}
                        aria-pressed={active}
                        className={cn("flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all focus-ring", active ? "border-ink" : "border-line hover:border-ash", included && "cursor-default bg-mist/60")}
                      >
                        <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border", active ? "border-ink bg-ink text-white" : "border-ash")}>
                          {active ? <Check className="size-3.5" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="text-sm font-medium">{pick(e.name)}</span>
                            <span className="shrink-0 text-sm tabular-nums text-graphite">{included ? t.configurator.included : e.price === 0 ? t.common.included : `+${formatCNY(e.price)}`}</span>
                          </span>
                          <span className="mt-0.5 block text-xs text-slate">{pick(e.description)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Step>

        {/* Summary */}
        <section className="mt-10 rounded-3xl bg-cloud p-6 hairline" aria-labelledby="summary-title">
          <h2 id="summary-title" className="text-lg font-semibold">{t.configurator.summary}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={`${pick(vehicle.name)} ${pick(quote.trim.name)}`} value={formatCNY(quote.vehiclePrice)} />
            <Row label={`${t.configurator.color} · ${pick(quote.paint.name)}`} value={quote.paintPrice ? formatCNY(quote.paintPrice) : t.common.included} muted />
            <Row label={`${t.configurator.wheel} · ${pick(quote.wheel.name)}`} value={quote.wheelPrice ? formatCNY(quote.wheelPrice) : t.common.included} muted />
            <Row label={`${t.configurator.interior} · ${pick(quote.interior.name)}`} value={quote.interiorPrice ? formatCNY(quote.interiorPrice) : t.common.included} muted />
            {quote.extras.map((e) => (
              <Row key={e.id} label={pick(e.name)} value={isIncludedInTrim(e, trimId) ? t.configurator.included : formatCNY(e.price)} muted />
            ))}
            <div className="my-3 border-t border-line" />
            <Row label={t.configurator.vehiclePrice} value={formatCNY(quote.subtotal)} />
            {vehicle.availability !== "overseas" ? <Row label={t.configurator.purchaseTax} value={formatCNY(quote.purchaseTax)} muted hint={t.configurator.taxNote} /> : null}
            <div className="my-3 border-t border-line" />
            <div className="flex items-baseline justify-between">
              <dt className="text-base font-semibold">{t.configurator.totalPrice}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{formatCNY(quote.total)}</dd>
            </div>
            <Row label={t.configurator.monthly} value={`${formatCNY(quote.monthly)}${t.common.perMonth}`} muted hint={t.configurator.monthlyNote} />
            <Row label={t.configurator.deliveryEta} value={`${quote.deliveryWeeks[0]}-${quote.deliveryWeeks[1]} ${t.common.weeks}`} muted />
            <Row label={t.configurator.range} value={`${quote.rangeKm} km`} muted />
          </dl>
          <div className="mt-6 flex flex-col gap-3">
            <Button href={orderHref} size="lg" fullWidth iconRight={<ChevronRight className="size-4" />}>
              {t.configurator.continue} · {t.common.deposit} {formatCNY(quote.deposit)}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={saveConfig} icon={<Save className="size-4" />}>{t.configurator.saveConfig}</Button>
              <Button type="button" variant="secondary" onClick={shareConfig} icon={<Link2 className="size-4" />}>{t.configurator.shareConfig}</Button>
            </div>
            <Link href={`/test-drive?vehicle=${vehicle.slug}`} className="text-center text-sm text-graphite underline-offset-4 hover:underline">{t.nav.testDrive}</Link>
          </div>
          <p className="mt-4 text-[11px] leading-5 text-ash">{t.common.officialNote}</p>
        </section>

        <section className="mt-8" aria-labelledby="saved-builds-title">
          <h2 id="saved-builds-title" className="text-lg font-semibold">{locale === "zh" ? "已保存的配置" : "Saved builds"}</h2>
          <SavedBuilds
            className="mt-4"
            vehicles={[vehicle]}
            vehicleSlug={vehicle.slug}
            emptyHint={false}
            onLoad={(sel) => {
              setSelection(normalizeSelection(vehicle, sel));
              setToast(locale === "zh" ? "已载入配置" : "Build loaded");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-4 backdrop-blur lg:hidden" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ash">{t.configurator.totalPrice}</p>
            <p className="text-lg font-semibold tabular-nums">{formatCNY(quote.total)}</p>
          </div>
          <Button href={orderHref} className="shrink-0" onClick={() => router.prefetch(orderHref)}>
            {t.nav.order}
          </Button>
        </div>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center lg:bottom-8">
          <div role="status" className="rounded-2xl bg-ink px-4 py-2.5 text-sm text-white shadow-lift">{toast}</div>
        </div>
      ) : null}
    </div>
  );
}

function Step({ index, title, meta, children }: { index: number; title: string; meta?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8 first:border-t-0" aria-labelledby={`step-${index}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={`step-${index}`} className="flex items-baseline gap-3 text-lg font-semibold">
          <span className="text-xs font-semibold tabular-nums text-ash">0{index}</span>
          {title}
        </h2>
        {meta ? <p className="truncate text-xs text-slate">{meta}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, muted, hint }: { label: string; value: string; muted?: boolean; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={cn("min-w-0", muted ? "text-slate" : "font-medium")}>
        <span className="block truncate">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] leading-4 text-ash">{hint}</span> : null}
      </dt>
      <dd className={cn("shrink-0 tabular-nums", muted ? "text-graphite" : "font-medium")}>{value}</dd>
    </div>
  );
}
