import { cityById, haversineKm, roadDistanceKm, type City } from "@/data/cities";
import { stations, type Network, type Station } from "@/data/charging";
import { getTrim, getVehicle } from "@/data/vehicles";
import type { Trim, Vehicle } from "@/data/types";

export interface TripInput {
  originId: string;
  destinationId: string;
  vehicleSlug: string;
  trimId?: string;
  startSoc: number;
  minArrivalSoc: number;
  network: Network | "any";
  season?: "mild" | "summer" | "winter";
}

export interface TripStop {
  station: Station;
  distanceFromOriginKm: number;
  legDistanceKm: number;
  arrivalSoc: number;
  departSoc: number;
  energyKwh: number;
  chargeMinutes: number;
  costCny: number;
}

export interface TripPlan {
  ok: true;
  origin: City;
  destination: City;
  vehicle: { slug: string; name: Vehicle["name"]; trim: Trim["name"]; brand: Vehicle["brand"]; powertrain: Vehicle["powertrain"] };
  distanceKm: number;
  driveMinutes: number;
  chargeMinutes: number;
  totalMinutes: number;
  energyKwh: number;
  consumptionKwhPer100: number;
  stops: TripStop[];
  arrivalSoc: number;
  fuelLitres?: number;
  notes: string[];
}

export interface TripError {
  ok: false;
  code: "SAME_CITY" | "UNKNOWN_CITY" | "UNKNOWN_VEHICLE" | "NO_ROUTE";
  message: { zh: string; en: string };
  partial?: { distanceKm: number; reachableKm: number };
}

const HIGHWAY_FACTOR = 0.74; // CLTC → sustained 100 km/h real-world
const SEASON_FACTOR = { mild: 1, summer: 0.95, winter: 0.8 } as const;
const AVERAGE_SPEED_KMH = 92;
const CORRIDOR_HALF_WIDTH_KM = 70;
const RESERVE_SOC = 8;
const MAX_CHARGE_SOC = 85;
const MIN_USEFUL_LEG_KM = 40;

function projectOntoRoute(origin: City, destination: City, station: Station): { t: number; offsetKm: number } {
  // Equirectangular approximation is sufficient for corridor filtering.
  const cosLat = Math.cos(((origin.lat + destination.lat) / 2) * (Math.PI / 180));
  const ox = origin.lng * cosLat;
  const oy = origin.lat;
  const dx = destination.lng * cosLat - ox;
  const dy = destination.lat - oy;
  const sx = station.lng * cosLat - ox;
  const sy = station.lat - oy;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : (sx * dx + sy * dy) / len2;
  const px = ox + t * dx;
  const py = oy + t * dy;
  const offsetKm = haversineKm({ lat: py, lng: px / cosLat }, { lat: station.lat, lng: station.lng });
  return { t, offsetKm };
}

export function planTrip(input: TripInput): TripPlan | TripError {
  const origin = cityById[input.originId];
  const destination = cityById[input.destinationId];
  if (!origin || !destination) {
    return { ok: false, code: "UNKNOWN_CITY", message: { zh: "未知城市", en: "Unknown city" } };
  }
  if (origin.id === destination.id) {
    return { ok: false, code: "SAME_CITY", message: { zh: "出发地与目的地不能相同", en: "Origin and destination must differ" } };
  }
  const vehicle = getVehicle(input.vehicleSlug);
  if (!vehicle) {
    return { ok: false, code: "UNKNOWN_VEHICLE", message: { zh: "未知车型", en: "Unknown vehicle" } };
  }
  const trim = getTrim(vehicle, input.trimId);
  const season = SEASON_FACTOR[input.season ?? "mild"];
  const ratedRangeKm = trim.evRangeKm ?? trim.rangeKm;
  const realRangeKm = ratedRangeKm * HIGHWAY_FACTOR * season;
  const kwhPerKm = trim.batteryKwh / realRangeKm;
  const totalKm = roadDistanceKm(origin, destination);
  const startSoc = clampSoc(input.startSoc);
  const minArrival = clampSoc(input.minArrivalSoc);
  const notes: string[] = [];

  const socToKm = (soc: number) => (soc / 100) * realRangeKm;
  const kmToSoc = (km: number) => (km / realRangeKm) * 100;

  // Range-extended vehicles: electric first, then the range extender takes over.
  if (vehicle.powertrain === "erev") {
    const evKm = Math.max(0, socToKm(startSoc) - socToKm(minArrival));
    const driveMinutes = Math.round((totalKm / AVERAGE_SPEED_KMH) * 60);
    if (totalKm <= evKm) {
      return {
        ok: true,
        origin,
        destination,
        vehicle: { slug: vehicle.slug, name: vehicle.name, trim: trim.name, brand: vehicle.brand, powertrain: vehicle.powertrain },
        distanceKm: Math.round(totalKm),
        driveMinutes,
        chargeMinutes: 0,
        totalMinutes: driveMinutes,
        energyKwh: round1(totalKm * kwhPerKm),
        consumptionKwhPer100: round1(kwhPerKm * 100),
        stops: [],
        arrivalSoc: Math.round(startSoc - kmToSoc(totalKm)),
        notes: [],
      };
    }
    const fuelKm = totalKm - evKm;
    const fuelLitres = round1(fuelKm * 0.072);
    return {
      ok: true,
      origin,
      destination,
      vehicle: { slug: vehicle.slug, name: vehicle.name, trim: trim.name, brand: vehicle.brand, powertrain: vehicle.powertrain },
      distanceKm: Math.round(totalKm),
      driveMinutes,
      chargeMinutes: 0,
      totalMinutes: driveMinutes,
      energyKwh: round1(evKm * kwhPerKm),
      consumptionKwhPer100: round1(kwhPerKm * 100),
      stops: [],
      arrivalSoc: minArrival,
      fuelLitres,
      notes: [
        `EREV:${Math.round(evKm)}:${Math.round(fuelKm)}`,
      ],
    };
  }

  // Candidate stations along the corridor, ordered by progress along the route.
  const candidates = stations
    .filter((s) => (input.network === "any" ? true : s.network === input.network || s.network === "partner"))
    .map((s) => ({ s, ...projectOntoRoute(origin, destination, s) }))
    .filter((c) => c.t > 0.02 && c.t < 0.98 && c.offsetKm <= CORRIDOR_HALF_WIDTH_KM)
    .map((c) => ({ ...c, alongKm: c.t * totalKm + c.offsetKm * 0.6 }))
    .sort((a, b) => a.alongKm - b.alongKm);

  const stops: TripStop[] = [];
  let positionKm = 0;
  let soc = startSoc;
  let energyUsed = 0;
  let chargeMinutes = 0;
  let guard = 0;

  while (guard++ < 12) {
    const remainingKm = totalKm - positionKm;
    const reachableKm = socToKm(soc - RESERVE_SOC);
    const neededToFinishKm = remainingKm + socToKm(minArrival) - socToKm(RESERVE_SOC);
    if (reachableKm >= neededToFinishKm) {
      energyUsed += remainingKm * kwhPerKm;
      soc -= kmToSoc(remainingKm);
      break;
    }
    // Farthest reachable station ahead of current position.
    const ahead = candidates.filter((c) => c.alongKm > positionKm + MIN_USEFUL_LEG_KM && c.alongKm - positionKm <= reachableKm);
    if (ahead.length === 0) {
      return {
        ok: false,
        code: "NO_ROUTE",
        message: {
          zh: "当前电量与筛选条件下沿途暂无可达充电站，请提高出发电量或放开网络偏好。",
          en: "No reachable charging station on this corridor with the current charge and filters. Increase starting charge or allow all networks.",
        },
        partial: { distanceKm: Math.round(totalKm), reachableKm: Math.round(positionKm + reachableKm) },
      };
    }
    // Prefer the farthest station, but favour faster ones when several are within 50 km of each other.
    const farthest = ahead[ahead.length - 1];
    const cluster = ahead.filter((c) => farthest.alongKm - c.alongKm <= 50);
    const chosen = cluster.reduce((best, c) => (c.s.maxKw > best.s.maxKw ? c : best), cluster[0]);

    const legKm = chosen.alongKm - positionKm;
    const arrivalSoc = soc - kmToSoc(legKm);
    energyUsed += legKm * kwhPerKm;
    positionKm = chosen.alongKm;

    const remainingAfterKm = totalKm - positionKm;
    const nextAhead = candidates.filter((c) => c.alongKm > positionKm + MIN_USEFUL_LEG_KM);
    const canFinishKm = remainingAfterKm + socToKm(minArrival);
    // Charge enough to finish, otherwise to reach the farthest next station cluster within the max SoC.
    const targetKm = canFinishKm <= socToKm(MAX_CHARGE_SOC) ? canFinishKm : socToKm(MAX_CHARGE_SOC);
    void nextAhead;
    const departSoc = Math.min(MAX_CHARGE_SOC, Math.max(arrivalSoc + 10, kmToSoc(targetKm) + RESERVE_SOC));
    const energyKwh = ((departSoc - arrivalSoc) / 100) * trim.batteryKwh;
    const effectiveKw = Math.min(chosen.s.maxKw, trim.peakChargeKw ?? 150) * (departSoc > 70 ? 0.62 : 0.72);
    const minutes = Math.max(8, Math.round((energyKwh / effectiveKw) * 60 + 3));
    chargeMinutes += minutes;
    stops.push({
      station: chosen.s,
      distanceFromOriginKm: Math.round(positionKm),
      legDistanceKm: Math.round(legKm),
      arrivalSoc: Math.round(arrivalSoc),
      departSoc: Math.round(departSoc),
      energyKwh: round1(energyKwh),
      chargeMinutes: minutes,
      costCny: Math.round(energyKwh * chosen.s.pricePerKwh),
    });
    soc = departSoc;
  }

  const driveMinutes = Math.round((totalKm / AVERAGE_SPEED_KMH) * 60);
  if (season < 1) notes.push("WINTER");
  if (stops.length === 0) notes.push("DIRECT");

  return {
    ok: true,
    origin,
    destination,
    vehicle: { slug: vehicle.slug, name: vehicle.name, trim: trim.name, brand: vehicle.brand, powertrain: vehicle.powertrain },
    distanceKm: Math.round(totalKm),
    driveMinutes,
    chargeMinutes,
    totalMinutes: driveMinutes + chargeMinutes,
    energyKwh: round1(energyUsed),
    consumptionKwhPer100: round1(kwhPerKm * 100),
    stops,
    arrivalSoc: Math.round(soc),
    notes,
  };
}

function clampSoc(v: number): number {
  if (!Number.isFinite(v)) return 80;
  return Math.min(100, Math.max(5, Math.round(v)));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
