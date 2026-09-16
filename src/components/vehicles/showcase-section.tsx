import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Vehicle } from "@/data/types";
import { getDictionary, pick, type Locale } from "@/lib/i18n";
import { getStartingPrice } from "@/data/vehicles";
import { formatPriceHeadline, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

interface Props {
  vehicle: Vehicle;
  locale: Locale;
  priority?: boolean;
  align?: "center" | "left";
  image?: string;
  className?: string;
}

/** Tesla-style full-viewport vehicle section: headline top, CTAs bottom, image behind. */
export function ShowcaseSection({ vehicle, locale, priority, align = "center", image, className }: Props) {
  const t = getDictionary(locale);
  const price = getStartingPrice(vehicle);
  const isOverseas = vehicle.availability === "overseas";
  const isInventory = vehicle.availability === "inventory";
  const stats = vehicle.highlights.slice(0, 3);
  const light = vehicle.theme === "light";
  const muted = light ? "text-graphite" : "text-white/85";
  const subtle = light ? "text-slate" : "text-white/80";

  return (
    <section className={cn("snap-section relative flex min-h-[100svh] flex-col overflow-hidden", light ? "bg-mist text-ink" : "bg-carbon text-white", className)}>
      <Image
        src={image ?? vehicle.hero.src}
        alt={pick(vehicle.hero.alt, locale)}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      {light ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/70 via-white/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/80 via-white/35 to-transparent" />
        </>
      ) : (
        <>
          <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-2/5" />
          <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
        </>
      )}

      <div className={cn("relative flex flex-1 flex-col justify-between px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:px-12", align === "center" ? "items-center text-center" : "items-start")}>
        <Reveal className={cn("max-w-3xl", align === "center" && "flex flex-col items-center")}>
          <p className={cn("mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em]", muted)}>
            <span className={cn("size-1.5 rounded-full", vehicle.brand === "xiaomi" ? "bg-mi" : "bg-tesla")} />
            {vehicle.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}
            {isInventory ? <span className={cn("ml-2 rounded-pill px-2 py-0.5 text-[10px]", light ? "bg-ink/10" : "bg-white/15")}>{t.common.inventoryOnly}</span> : null}
            {isOverseas ? <span className={cn("ml-2 rounded-pill px-2 py-0.5 text-[10px]", light ? "bg-ink/10" : "bg-white/15")}>{t.common.overseasOnly}</span> : null}
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{pick(vehicle.name, locale)}</h2>
          <p className={cn("mt-3 text-pretty text-base sm:text-lg", light ? "text-graphite" : "text-white/80")}>{pick(vehicle.tagline, locale)}</p>
        </Reveal>

        <Reveal delay={120} className={cn("w-full", align === "center" ? "flex flex-col items-center" : "")}>
          <div className={cn("mb-6 hidden gap-10 sm:flex", align === "center" && "justify-center")}>
            {stats.map((s) => (
              <div key={s.label.zh} className={cn(align === "center" && "text-center")}>
                <div className="flex items-baseline gap-1 text-2xl font-semibold tabular-nums lg:text-3xl">
                  {s.value}
                  {s.unit ? <span className={cn("text-sm font-medium", muted)}>{typeof s.unit === "string" ? s.unit : pick(s.unit, locale)}</span> : null}
                </div>
                <div className={cn("mt-0.5 text-xs", subtle)}>{pick(s.label, locale)}</div>
              </div>
            ))}
          </div>
          <div className={cn("flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row", align === "center" && "sm:justify-center")}>
            <Button href={isOverseas ? `/vehicles/${vehicle.slug}` : `/vehicles/${vehicle.slug}/design`} variant={light ? "primary" : "light"} size="lg" className="w-full sm:w-64">
              {isOverseas ? t.nav.learnMore : t.nav.design}
            </Button>
            <Button href={isOverseas ? `/vehicles/${vehicle.slug}#interest` : `/test-drive?vehicle=${vehicle.slug}`} variant={light ? "light" : "glass"} size="lg" className={cn("w-full sm:w-64", light && "bg-white/70 backdrop-blur-md hover:bg-white")}>
              {isOverseas ? (locale === "zh" ? "登记关注" : "Register interest") : t.nav.testDrive}
            </Button>
          </div>
          <div className={cn("mt-4 flex items-center gap-3 text-xs", muted, align === "center" && "justify-center")}>
            <span>
              {t.common.from} {formatPriceHeadline(price, locale)}
            </span>
            <span aria-hidden>·</span>
            <Link href={`/vehicles/${vehicle.slug}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
              {t.nav.learnMore}
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
