import { ok } from "@/lib/api";
import { store } from "@/lib/store";
import { vehicles } from "@/data/vehicles";

export async function GET() {
  return ok({
    status: "ok",
    time: new Date().toISOString(),
    store: store.driverName(),
    vehicles: vehicles.length,
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
  });
}

export const dynamic = "force-dynamic";
