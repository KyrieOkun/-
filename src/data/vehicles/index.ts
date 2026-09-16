import type { Brand, Vehicle, Trim } from "../types";
import { xiaomiVehicles } from "./xiaomi";
import { teslaVehicles } from "./tesla";

export const vehicles: Vehicle[] = [...xiaomiVehicles, ...teslaVehicles].sort((a, b) => a.order - b.order);

export const vehiclesBySlug: Record<string, Vehicle> = Object.fromEntries(vehicles.map((v) => [v.slug, v]));

export function getVehicle(slug: string): Vehicle | undefined {
  return vehiclesBySlug[slug];
}

export function getVehiclesByBrand(brand: Brand): Vehicle[] {
  return vehicles.filter((v) => v.brand === brand);
}

export function getTrim(vehicle: Vehicle, trimId?: string | null): Trim {
  return vehicle.trims.find((t) => t.id === trimId) ?? vehicle.trims[0];
}

export function getStartingPrice(vehicle: Vehicle): number {
  return Math.min(...vehicle.trims.map((t) => t.price));
}

export function getMaxRange(vehicle: Vehicle): number {
  return Math.max(...vehicle.trims.map((t) => (t.evRangeKm ?? t.rangeKm)));
}

export function getBestAccel(vehicle: Vehicle): number {
  return Math.min(...vehicle.trims.map((t) => t.accel));
}

export const featuredSlugs = ["xiaomi-su7", "tesla-model-y", "xiaomi-yu7", "tesla-model-3", "xiaomi-su7-ultra", "xiaomi-n90"];

export const BRAND_META: Record<Brand, { name: { zh: string; en: string }; color: string; wordmark: string }> = {
  xiaomi: { name: { zh: "小米汽车", en: "Xiaomi EV" }, color: "#ff6900", wordmark: "XIAOMI" },
  tesla: { name: { zh: "特斯拉", en: "Tesla" }, color: "#e82127", wordmark: "TESLA" },
};

export { xiaomiVehicles, teslaVehicles };

/** "New" for 180 days after launch (relative to now, not a hard-coded year). */
export function isNewVehicle(vehicle: Pick<Vehicle, "launchDate" | "availability">, now = Date.now()): boolean {
  if (vehicle.availability === "overseas") return false;
  const launched = new Date(vehicle.launchDate).getTime();
  return Number.isFinite(launched) && now - launched < 180 * 86_400_000 && launched <= now + 86_400_000;
}

/** Label for the range figure: CLTC / EPA / WLTP as declared per trim. */
export function rangeStandardOf(vehicle: Pick<Vehicle, "trims">): string {
  return vehicle.trims[0]?.rangeStandard ?? "CLTC";
}
