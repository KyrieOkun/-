import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { stations } from "@/data/charging";
import { availabilityFor } from "@/lib/charging";

export async function GET(request: NextRequest) {
  const network = request.nextUrl.searchParams.get("network");
  const city = request.nextUrl.searchParams.get("city");
  const list = stations
    .filter((s) => (network && network !== "all" ? s.network === network : true))
    .filter((s) => (city ? s.cityId === city : true))
    .map((s) => ({ ...s, live: availabilityFor(s.id, s.stalls) }));
  return ok({ stations: list, count: list.length, updatedAt: new Date().toISOString() });
}

export const dynamic = "force-dynamic";
