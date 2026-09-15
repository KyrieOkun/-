import { cities, cityById, haversineKm, type City } from "@/data/cities";
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
  via: City[];
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
const ROAD_FACTOR = 1.12; // per-hop detour on top of dense waypoint routing
const MAX_EDGE_KM = 360;
const STATION_SNAP_KM = 70;
const RESERVE_SOC = 8;
const MAX_CHARGE_SOC = 85;
const MIN_USEFUL_LEG_KM = 40;

/** Node pairs that are close as the crow flies but separated by water. */
const BLOCKED_EDGES = new Set(
  [
    ["dalian", "yantai"],
    ["dalian", "weifang"],
    ["dalian", "qingdao"],
    ["dalian", "rizhao"],
    ["dalian", "tianjin"],
    ["dalian", "tangshan"],
    ["dalian", "cangzhou"],
    ["qinhuangdao", "yantai"],
    ["qinhuangdao", "dalian"],
    ["tianjin", "yantai"],
    ["tangshan", "yantai"],
    ["haikou", "beihai"],
    ["sanya", "beihai"],
    ["sanya", "zhanjiang"],
    ["shanghai", "rizhao"],
    ["nantong", "rizhao"],
    ["yancheng", "rizhao"],
  ].map(([a, b]) => `${a}|${b}`),
);

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

interface Graph {
  neighbours: Map<string, { id: string; km: number }[]>;
}

let cachedGraph: Graph | null = null;

function buildGraph(): Graph {
  if (cachedGraph) return cachedGraph;
  const neighbours = new Map<string, { id: string; km: number }[]>();
  for (const a of cities) {
    const list: { id: string; km: number }[] = [];
    for (const b of cities) {
      if (a.id === b.id) continue;
      const key = edgeKey(a.id, b.id);
      if (BLOCKED_EDGES.has(key) || BLOCKED_EDGES.has(`${b.id}|${a.id}`) || BLOCKED_EDGES.has(`${a.id}|${b.id}`)) continue;
      const km = haversineKm(a, b) * ROAD_FACTOR;
      if (km <= MAX_EDGE_KM * ROAD_FACTOR) list.push({ id: b.id, km });
    }
    neighbours.set(a.id, list);
  }
  cachedGraph = { neighbours };
  return cachedGraph;
}

/** Dijkstra over the city graph; returns the node path and cumulative km. */
export function shortestPath(originId: string, destinationId: string): { path: City[]; cumKm: number[] } | null {
  const { neighbours } = buildGraph();
  // Edge cost grows super-linearly with length so the search hops through
  // intermediate cities the way expressways actually do, instead of taking a
  // few very long straight edges that skip the charging infrastructure.
  const cost = new Map<string, number>([[originId, 0]]);
  const dist = new Map<string, number>([[originId, 0]]);
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  const queue: { id: string; c: number }[] = [{ id: originId, c: 0 }];
  while (queue.length) {
    queue.sort((a, b) => a.c - b.c);
    const { id, c } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    if (id === destinationId) break;
    for (const n of neighbours.get(id) ?? []) {
      const nc = c + n.km * (1 + n.km / 500);
      if (nc < (cost.get(n.id) ?? Infinity)) {
        cost.set(n.id, nc);
        dist.set(n.id, (dist.get(id) ?? 0) + n.km);
        prev.set(n.id, id);
        queue.push({ id: n.id, c: nc });
      }
    }
  }
  if (!cost.has(destinationId)) return null;
  const ids: string[] = [];
  let cur: string | undefined = destinationId;
  while (cur) {
    ids.unshift(cur);
    cur = prev.get(cur);
  }
  const path = ids.map((id) => cityById[id]);
  const cumKm = ids.map((id) => dist.get(id) ?? 0);
  return { path, cumKm };
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
  const route = shortestPath(origin.id, destination.id);
  if (!route) {
    return { ok: false, code: "NO_ROUTE", message: { zh: "暂无可规划的公路路线", en: "No routable road corridor between these cities" } };
  }
  const trim = getTrim(vehicle, input.trimId);
  const season = SEASON_FACTOR[input.season ?? "mild"];
  const ratedRangeKm = trim.evRangeKm ?? trim.rangeKm;
  const realRangeKm = ratedRangeKm * HIGHWAY_FACTOR * season;
  const kwhPerKm = trim.batteryKwh / realRangeKm;
  const totalKm = route.cumKm[route.cumKm.length - 1];
  const startSoc = clampSoc(input.startSoc);
  const minArrival = clampSoc(input.minArrivalSoc);
  const via = route.path.slice(1, -1);
  const notes: string[] = [];
  const vehicleSummary = { slug: vehicle.slug, name: vehicle.name, trim: trim.name, brand: vehicle.brand, powertrain: vehicle.powertrain };

  const socToKm = (soc: number) => (soc / 100) * realRangeKm;
  const kmToSoc = (km: number) => (km / realRangeKm) * 100;
  const driveMinutes = Math.round((totalKm / AVERAGE_SPEED_KMH) * 60);

  // Range-extended vehicles: electric first, then the range extender takes over.
  if (vehicle.powertrain === "erev") {
    const evKm = Math.max(0, socToKm(startSoc) - socToKm(minArrival));
    if (totalKm <= evKm) {
      return {
        ok: true,
        origin,
        destination,
        via,
        vehicle: vehicleSummary,
        distanceKm: Math.round(totalKm),
        driveMinutes,
        chargeMinutes: 0,
        totalMinutes: driveMinutes,
        energyKwh: round1(totalKm * kwhPerKm),
        consumptionKwhPer100: round1(kwhPerKm * 100),
        stops: [],
        arrivalSoc: Math.round(startSoc - kmToSoc(totalKm)),
        notes: ["DIRECT"],
      };
    }
    const fuelKm = totalKm - evKm;
    return {
      ok: true,
      origin,
      destination,
      via,
      vehicle: vehicleSummary,
      distanceKm: Math.round(totalKm),
      driveMinutes,
      chargeMinutes: 0,
      totalMinutes: driveMinutes,
      energyKwh: round1(evKm * kwhPerKm),
      consumptionKwhPer100: round1(kwhPerKm * 100),
      stops: [],
      arrivalSoc: minArrival,
      fuelLitres: round1(fuelKm * 0.072),
      notes: [`EREV:${Math.round(evKm)}:${Math.round(fuelKm)}`],
    };
  }

  // Candidate stations snapped to the nearest routed segment.
  const candidates = stations
    .filter((s) => (input.network === "any" ? true : s.network === input.network || s.network === "partner"))
    .map((s) => {
      const snap = snapToRoute(route, s);
      return { s, ...snap };
    })
    .filter((c) => c.offsetKm <= STATION_SNAP_KM && c.alongKm > MIN_USEFUL_LEG_KM && c.alongKm < totalKm - 20)
    .map((c) => ({ ...c, alongKm: c.alongKm + c.offsetKm * 0.5 }))
    .sort((a, b) => a.alongKm - b.alongKm);

  const stops: TripStop[] = [];
  let positionKm = 0;
  let soc = startSoc;
  let energyUsed = 0;
  let chargeMinutes = 0;
  let guard = 0;

  while (guard++ < 20) {
    const remainingKm = totalKm - positionKm;
    const reachableKm = socToKm(soc - RESERVE_SOC);
    const neededToFinishKm = remainingKm + socToKm(minArrival) - socToKm(RESERVE_SOC);
    if (reachableKm >= neededToFinishKm) {
      energyUsed += remainingKm * kwhPerKm;
      soc -= kmToSoc(remainingKm);
      break;
    }
    const ahead = candidates.filter((c) => c.alongKm > positionKm + MIN_USEFUL_LEG_KM && c.alongKm - positionKm <= reachableKm);
    if (ahead.length === 0 && reachableKm >= remainingKm) {
      // Physically reachable above the hard reserve, just short of the requested arrival buffer.
      energyUsed += remainingKm * kwhPerKm;
      soc -= kmToSoc(remainingKm);
      notes.push("LOW_ARRIVAL");
      break;
    }
    if (ahead.length === 0) {
      return {
        ok: false,
        code: "NO_ROUTE",
        message: {
          zh: "当前电量与筛选条件下沿途暂无可达充电站，请提高出发电量、放开网络偏好或选择续航更长的版本。",
          en: "No reachable charging station on this corridor with the current charge and filters. Increase starting charge, allow all networks or choose a longer-range trim.",
        },
        partial: { distanceKm: Math.round(totalKm), reachableKm: Math.round(positionKm + reachableKm) },
      };
    }
    const farthest = ahead[ahead.length - 1];
    const cluster = ahead.filter((c) => farthest.alongKm - c.alongKm <= 50);
    const chosen = cluster.reduce((best, c) => (c.s.maxKw > best.s.maxKw ? c : best), cluster[0]);

    const legKm = chosen.alongKm - positionKm;
    const arrivalSoc = soc - kmToSoc(legKm);
    energyUsed += legKm * kwhPerKm;
    positionKm = chosen.alongKm;

    const remainingAfterKm = totalKm - positionKm;
    const canFinishKm = remainingAfterKm + socToKm(minArrival);
    const targetKm = canFinishKm <= socToKm(MAX_CHARGE_SOC) ? canFinishKm : socToKm(MAX_CHARGE_SOC);
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

  if (season < 1) notes.push("WINTER");
  if (stops.length === 0) notes.push("DIRECT");

  return {
    ok: true,
    origin,
    destination,
    via,
    vehicle: vehicleSummary,
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

/** Projects a station onto the routed polyline; returns progress (km) and perpendicular offset (km). */
function snapToRoute(route: { path: City[]; cumKm: number[] }, point: { lat: number; lng: number }): { alongKm: number; offsetKm: number } {
  let best = { alongKm: 0, offsetKm: Infinity };
  for (let i = 0; i < route.path.length - 1; i++) {
    const a = route.path[i];
    const b = route.path[i + 1];
    const cosLat = Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
    const ax = a.lng * cosLat;
    const ay = a.lat;
    const dx = b.lng * cosLat - ax;
    const dy = b.lat - ay;
    const px = point.lng * cosLat - ax;
    const py = point.lat - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, (px * dx + py * dy) / len2));
    const projLat = ay + t * dy;
    const projLng = (ax + t * dx) / cosLat;
    const offsetKm = haversineKm({ lat: projLat, lng: projLng }, point);
    if (offsetKm < best.offsetKm) {
      best = { alongKm: route.cumKm[i] + t * (route.cumKm[i + 1] - route.cumKm[i]), offsetKm };
    }
  }
  return best;
}

function clampSoc(v: number): number {
  if (!Number.isFinite(v)) return 80;
  return Math.min(100, Math.max(5, Math.round(v)));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
