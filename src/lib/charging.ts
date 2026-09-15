import { hashString } from "./utils";

export interface LiveAvailability {
  available: number;
  busy: number;
  offline: number;
}

/** Live-ish availability: deterministic per station per 5-minute bucket. */
export function availabilityFor(stationId: string, stalls: number, now = Date.now()): LiveAvailability {
  const bucket = Math.floor(now / 300_000);
  const h = hashString(`${stationId}:${bucket}`);
  const offline = h % 11 === 0 ? 1 : 0;
  const busy = Math.min(stalls - offline, Math.floor((((h >>> 4) % 100) / 100) * stalls * 0.8));
  return { available: Math.max(0, stalls - busy - offline), busy, offline };
}
