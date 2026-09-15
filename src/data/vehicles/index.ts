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
