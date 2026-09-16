import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { created, fail, ok, parseBody, rateLimit } from "@/lib/api";
import { computeStatus, generateDemoVin, isValidVin, type GarageVehicle } from "@/lib/garage";
import { getTrim, getVehicle } from "@/data/vehicles";
import { generateId } from "@/lib/utils";

const schema = z.object({
  vehicleSlug: z.string().min(1),
  trimId: z.string().optional(),
  vin: z.string().trim().optional(),
  nickname: z.string().trim().min(1).max(30),
  plate: z.string().trim().max(10).optional(),
  paintId: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const list = await store.list<GarageVehicle>("garage", user.id);
  list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return ok({ vehicles: list.map((gv) => ({ ...gv, status: computeStatus(gv) })) });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "garage", 20);
  if (limited) return limited;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const vehicle = getVehicle(parsed.data.vehicleSlug);
  if (!vehicle) return fail("Unknown vehicle", 404);
  const paintId = vehicle.paints.some((p) => p.id === parsed.data.paintId) ? parsed.data.paintId : vehicle.heroPaintId ?? vehicle.paints[0]?.id;
  const trim = getTrim(vehicle, parsed.data.trimId);
  const existing = await store.list<GarageVehicle>("garage", user.id);
  if (existing.length >= 6) return fail("GARAGE_FULL", 409);
  const vin = parsed.data.vin && parsed.data.vin.length > 0 ? parsed.data.vin.toUpperCase() : generateDemoVin(vehicle.brand);
  if (!isValidVin(vin)) return fail("INVALID_VIN", 422);
  if (existing.some((g) => g.vin === vin)) return fail("VIN_EXISTS", 409);
  const gv: GarageVehicle = {
    id: generateId("GV"),
    ownerId: user.id,
    vehicleSlug: vehicle.slug,
    trimId: trim.id,
    vin,
    nickname: parsed.data.nickname,
    plate: parsed.data.plate,
    paintId,
    createdAt: new Date().toISOString(),
    state: { locked: true, climateOn: false, targetTemp: 22, charging: false, pluggedIn: false, sentry: true },
  };
  // A VIN can only live in one garage site-wide (atomic reservation).
  if (!(await store.claimLookup("garage", "vin", vin, gv.id))) return fail("VIN_EXISTS", 409);
  await store.put("garage", gv, { owner: user.id });
  return created({ vehicle: { ...gv, status: computeStatus(gv) } });
}

export const dynamic = "force-dynamic";
