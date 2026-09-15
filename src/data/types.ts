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
}

export interface InteriorOption {
  id: string;
  name: L10n;
  price: number;
  primary: string;
  secondary: string;
  material: L10n;
  trims?: string[];
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

export interface VehicleSelection {
  trimId: string;
  paintId: string;
  wheelId: string;
  interiorId: string;
  extraIds: string[];
}
