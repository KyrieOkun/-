import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { vehicles, getBestAccel, getMaxRange, getStartingPrice } from "@/data/vehicles";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { VehicleExplorer, type ExplorerVehicle } from "@/components/vehicles/vehicle-explorer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.vehicles.title, description: t.vehicles.subtitle, alternates: { canonical: "/vehicles" } };
}

export default async function VehiclesPage() {
  const { t } = await getI18n();
  const list: ExplorerVehicle[] = vehicles.map((v) => ({
    slug: v.slug,
    brand: v.brand,
    bodyType: v.bodyType,
    powertrain: v.powertrain,
    name: v.name,
    tagline: v.tagline,
    hero: v.hero.src,
    heroAlt: v.hero.alt,
    price: getStartingPrice(v),
    rangeKm: v.powertrain === "erev" ? Math.max(...v.trims.map((tr) => tr.rangeKm)) : getMaxRange(v),
    accel: getBestAccel(v),
    powerKw: Math.max(...v.trims.map((tr) => tr.powerKw)),
    availability: v.availability,
    launchDate: v.launchDate,
    isPerformance: v.trims.some((tr) => tr.accel <= 3.5),
    trimCount: v.trims.length,
  }));

  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-14 lg:py-20">
          <Eyebrow className="mb-3">{t.nav.xiaomi} × {t.nav.tesla}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.vehicles.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.vehicles.subtitle}</p>
        </Container>
      </section>
      <Container className="pb-24">
        <VehicleExplorer vehicles={list} />
        <p className="mt-12 text-xs leading-5 text-ash">{t.common.officialNote}</p>
      </Container>
    </div>
  );
}
