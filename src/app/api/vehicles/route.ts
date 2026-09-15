import { ok } from "@/lib/api";
import { vehicles, getStartingPrice } from "@/data/vehicles";

export async function GET() {
  return ok({
    vehicles: vehicles.map((v) => ({
      slug: v.slug,
      brand: v.brand,
      name: v.name,
      tagline: v.tagline,
      bodyType: v.bodyType,
      powertrain: v.powertrain,
      availability: v.availability,
      startingPrice: getStartingPrice(v),
      hero: v.hero.src,
      trims: v.trims.map((t) => ({ id: t.id, name: t.name, price: t.price, rangeKm: t.rangeKm, accel: t.accel, powerKw: t.powerKw })),
    })),
  });
}
