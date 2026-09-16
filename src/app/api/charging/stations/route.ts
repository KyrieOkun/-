import { NextRequest } from "next/server";
import { fail, ok, rateLimit } from "@/lib/api";
import { stations } from "@/data/charging";
import { availabilityFor } from "@/lib/charging";

const NETWORKS = new Set(["tesla", "xiaomi", "partner"]);

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "stations", 60);
  if (limited) return limited;
  const network = request.nextUrl.searchParams.get("network");
  const city = request.nextUrl.searchParams.get("city");
  if (network && network !== "all" && !NETWORKS.has(network)) return fail("Unknown network", 422);
  const list = stations
    .filter((s) => (network && network !== "all" ? s.network === network : true))
    .filter((s) => (city ? s.cityId === city : true))
    .map((s) => ({ ...s, live: availabilityFor(s.id, s.stalls) }));
  const res = ok({ stations: list, count: list.length, updatedAt: new Date().toISOString() });
  // Availability is pseudo-live per minute; let CDNs share it briefly.
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}

export const dynamic = "force-dynamic";
