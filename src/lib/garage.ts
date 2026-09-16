import { cities } from "@/data/cities";
import { getTrim, getVehicle } from "@/data/vehicles";
import { otaReleases } from "@/data/connect";
import { hashString, seededRandom } from "./utils";

export interface GarageVehicle {
  id: string;
  ownerId: string;
  vehicleSlug: string;
  trimId: string;
  vin: string;
  nickname: string;
  plate?: string;
  paintId?: string;
  createdAt: string;
  state: {
    locked: boolean;
    climateOn: boolean;
    targetTemp: number;
    charging: boolean;
    pluggedIn: boolean;
    sentry: boolean;
    lastCommandAt?: string;
  };
}

export interface VehicleStatus {
  batteryPercent: number;
  rangeKm: number;
  odometerKm: number;
  location: { cityId: string; label: { zh: string; en: string }; lat: number; lng: number };
  locked: boolean;
  climateOn: boolean;
  cabinTempC: number;
  targetTempC: number;
  outsideTempC: number;
  charging: boolean;
  pluggedIn: boolean;
  chargePowerKw: number;
  minutesToFull: number | null;
  sentry: boolean;
  tyrePressureBar: [number, number, number, number];
  softwareVersion: string;
  updateAvailable: string | null;
  lastSync: string;
  health: { batteryHealthPercent: number; nextServiceKm: number };
}

export type GarageCommand = "lock" | "unlock" | "climate_on" | "climate_off" | "flash" | "charge_start" | "charge_stop" | "sentry_on" | "sentry_off" | "set_temp";

/**
 * Deterministic pseudo-telemetry derived from the VIN so a vehicle looks the
 * same across requests, with slow time-based drift for realism. In production
 * this module is replaced by the Xiaomi EV Open Platform / Tesla Fleet API
 * adapters behind the same interface.
 */
export function computeStatus(gv: GarageVehicle, now = Date.now()): VehicleStatus {
  const vehicle = getVehicle(gv.vehicleSlug);
  const trim = vehicle ? getTrim(vehicle, gv.trimId) : undefined;
  const rand = seededRandom(hashString(gv.vin));
  const base = rand();
  const hourBucket = Math.floor(now / (1000 * 60 * 60));
  const drift = ((hourBucket + hashString(gv.vin)) % 17) / 100;

  let battery = Math.round(32 + base * 55 + drift * 20);
  if (gv.state.charging) {
    const minutesSince = gv.state.lastCommandAt ? (now - new Date(gv.state.lastCommandAt).getTime()) / 60000 : 0;
    battery = Math.min(100, battery + Math.floor(minutesSince * 1.2));
  }
  battery = Math.max(3, Math.min(100, battery));

  const ratedRange = trim ? (trim.evRangeKm ?? trim.rangeKm) : 600;
  const rangeKm = Math.round((battery / 100) * ratedRange * 0.86);
  const odometerKm = Math.round(1800 + rand() * 42000 + ((hourBucket % 720) * 1.3));
  const city = cities[Math.floor(rand() * 12)];
  const outsideTempC = Math.round(14 + rand() * 16);
  const cabinTempC = gv.state.climateOn ? gv.state.targetTemp : Math.round(outsideTempC + (rand() > 0.5 ? 4 : -1));
  const peak = trim?.peakChargeKw ?? 150;
  const chargePowerKw = gv.state.charging ? Math.round(Math.min(peak, battery > 80 ? peak * 0.3 : peak * 0.75)) : 0;
  const minutesToFull = gv.state.charging && trim ? Math.round((((100 - battery) / 100) * trim.batteryKwh) / Math.max(chargePowerKw, 20) * 60) : null;
  const brandReleases = otaReleases.filter((r) => r.brand === vehicle?.brand);
  const installed = brandReleases.find((r) => r.status === "released") ?? brandReleases[0];
  const rolling = brandReleases.find((r) => r.status === "rolling");
  const pressure = () => Math.round((2.5 + rand() * 0.3) * 10) / 10;

  return {
    batteryPercent: battery,
    rangeKm,
    odometerKm,
    location: { cityId: city.id, label: city.name, lat: city.lat, lng: city.lng },
    locked: gv.state.locked,
    climateOn: gv.state.climateOn,
    cabinTempC,
    targetTempC: gv.state.targetTemp,
    outsideTempC,
    charging: gv.state.charging,
    pluggedIn: gv.state.pluggedIn || gv.state.charging,
    chargePowerKw,
    minutesToFull,
    sentry: gv.state.sentry,
    tyrePressureBar: [pressure(), pressure(), pressure(), pressure()],
    softwareVersion: installed?.version ?? "—",
    updateAvailable: rolling ? rolling.version : null,
    lastSync: new Date(now).toISOString(),
    health: { batteryHealthPercent: Math.round(96 + rand() * 3.5), nextServiceKm: Math.max(500, 20000 - (odometerKm % 20000)) },
  };
}

export function applyCommand(gv: GarageVehicle, command: GarageCommand, payload?: { temp?: number }): GarageVehicle {
  const state = { ...gv.state, lastCommandAt: new Date().toISOString() };
  switch (command) {
    case "lock":
      state.locked = true;
      break;
    case "unlock":
      state.locked = false;
      break;
    case "climate_on":
      state.climateOn = true;
      break;
    case "climate_off":
      state.climateOn = false;
      break;
    case "charge_start":
      state.charging = true;
      state.pluggedIn = true;
      break;
    case "charge_stop":
      state.charging = false;
      break;
    case "sentry_on":
      state.sentry = true;
      break;
    case "sentry_off":
      state.sentry = false;
      break;
    case "set_temp":
      if (payload?.temp !== undefined) state.targetTemp = Math.min(30, Math.max(16, Math.round(payload.temp)));
      state.climateOn = true;
      break;
    case "flash":
      break;
  }
  return { ...gv, state };
}

export function isValidVin(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin.trim());
}

export function generateDemoVin(brand: "xiaomi" | "tesla", seed: string): string {
  const wmi = brand === "tesla" ? "LRW" : "HXM";
  const alphabet = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  const rand = seededRandom(hashString(seed + Date.now()));
  let out = wmi;
  while (out.length < 17) out += alphabet[Math.floor(rand() * alphabet.length)];
  return out;
}
