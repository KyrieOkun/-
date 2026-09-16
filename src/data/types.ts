import type { L10n } from "@/lib/i18n/types";

export type Brand = "xiaomi" | "tesla";
export type BodyType = "sedan" | "suv" | "truck";
export type Availability = "available" | "inventory" | "overseas" | "presale";
export type PaintFinish = "solid" | "metallic" | "pearl" | "matte" | "special";
export type Powertrain = "bev" | "erev";

export interface Trim {
  id: string;
  name: L10n;
  /** CNY list price. For overseas-only vehicles this is an indicative CNY conversion. */
  price: number;
  priceUSD?: number;
  drivetrain: L10n;
  motors: number;
  powerKw: number;
  powerPs: number;
  torqueNm?: number;
  batteryKwh: number;
  batteryType: L10n;
  rangeKm: number;
  rangeStandard: "CLTC" | "EPA" | "WLTP";
  /** Pure-electric range for range-extended vehicles (CLTC). */
  evRangeKm?: number;
  accel: number;
  topSpeed: number;
  peakChargeKw?: number;
  charge10to80Min?: number;
  platformVoltage?: string;
  weightKg?: number;
  seats: number;
  features: L10n[];
  deliveryWeeks: [number, number];
  badge?: L10n;
}

export interface PaintOption {
  id: string;
  name: L10n;
  hex: string;
  hex2?: string;
  finish: PaintFinish;
  price: number;
  family?: L10n;
  isNew?: boolean;
  trims?: string[];
  /** Official photograph of the vehicle in this paint. */
  image?: string;
}

export interface WheelOption {
  id: string;
  name: L10n;
  size: number;
  price: number;
  style: "aero" | "sport" | "forged" | "multi";
  description?: L10n;
  rangeDeltaKm?: number;
  trims?: string[];
  /** Official product photograph of the wheel. */
  image?: string;
}

export interface InteriorOption {
  id: string;
  name: L10n;
  price: number;
  primary: string;
  secondary: string;
  material: L10n;
  trims?: string[];
  /** Official photograph of the interior colourway. */
  image?: string;
}

export type ExtraCategory = "adas" | "comfort" | "performance" | "exterior" | "charging" | "service";

export interface ExtraOption {
  id: string;
  name: L10n;
  description: L10n;
  price: number;
  category: ExtraCategory;
  trims?: string[];
  includedIn?: string[];
  /** Options that cannot be combined with this one (e.g. FSD supersedes EAP, 6- vs 7-seat). */
  excludes?: string[];
}

export interface SpecRow {
  label: L10n;
  value: L10n | string;
}

export interface SpecGroup {
  title: L10n;
  rows: SpecRow[];
}

export interface FeatureBlock {
  title: L10n;
  body: L10n;
  icon: string;
}

export interface VehicleImage {
  src: string;
  alt: L10n;
}

export interface Vehicle {
  slug: string;
  brand: Brand;
  name: L10n;
  series: L10n;
  tagline: L10n;
  description: L10n;
  bodyType: BodyType;
  powertrain: Powertrain;
  segment: L10n;
  availability: Availability;
  launchDate: string;
  modelYear: number;
  hero: VehicleImage;
  /** Paint shown in the hero photography; used as the configurator default. */
  heroPaintId?: string;
  images: VehicleImage[];
  theme: "dark" | "light";
  highlights: { value: string; unit?: string; label: L10n }[];
  trims: Trim[];
  paints: PaintOption[];
  wheels: WheelOption[];
  interiors: InteriorOption[];
  extras: ExtraOption[];
  specs: SpecGroup[];
  dimensions: { length: number; width: number; height: number; wheelbase: number; clearance?: number };
  seats: number[];
  cargoL?: number;
  frunkL?: number;
  warranty: L10n[];
  deposit: number;
  features: FeatureBlock[];
  tags: L10n[];
  order: number;
}

/**
 * Vehicle without the long-form content (specs tables, feature blocks, gallery,
 * marketing copy). Client components receive this shape so pages that list
 * every vehicle don't ship ~15 KB of prose per car in the RSC payload.
 */
export type ClientVehicle = Omit<Vehicle, "specs" | "features" | "images" | "description" | "highlights" | "tags">;

export function toClientVehicle(vehicle: Vehicle): ClientVehicle {
  const { specs: _specs, features: _features, images: _images, description: _description, highlights: _highlights, tags: _tags, ...rest } = vehicle;
  void _specs; void _features; void _images; void _description; void _highlights; void _tags;
  return rest;
}

/** Minimal shape for pickers, forms and the trip planner (a few hundred bytes per vehicle). */
export interface VehicleSummary {
  slug: string;
  brand: Brand;
  name: L10n;
  tagline: L10n;
  hero: VehicleImage;
  availability: Availability;
  powertrain: Powertrain;
  bodyType: BodyType;
  trims: Pick<Trim, "id" | "name" | "price" | "rangeKm" | "evRangeKm">[];
}

export function toVehicleSummary(vehicle: Vehicle): VehicleSummary {
  return {
    slug: vehicle.slug,
    brand: vehicle.brand,
    name: vehicle.name,
    tagline: vehicle.tagline,
    hero: vehicle.hero,
    availability: vehicle.availability,
    powertrain: vehicle.powertrain,
    bodyType: vehicle.bodyType,
    trims: vehicle.trims.map((tr) => ({ id: tr.id, name: tr.name, price: tr.price, rangeKm: tr.rangeKm, evRangeKm: tr.evRangeKm })),
  };
}

export interface VehicleSelection {
  trimId: string;
  paintId: string;
  wheelId: string;
  interiorId: string;
  extraIds: string[];
}
