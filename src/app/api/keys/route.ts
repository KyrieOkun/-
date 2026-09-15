import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { created, fail, ok, parseBody } from "@/lib/api";
import type { GarageVehicle } from "@/lib/garage";
import { generateId } from "@/lib/utils";
import type { SharedKey } from "@/lib/orders";

const schema = z.object({
  garageVehicleId: z.string().min(1),
  holderName: z.string().trim().min(1).max(40),
  holderContact: z.string().trim().min(5).max(120),
  permission: z.enum(["drive", "unlock", "valet"]),
  days: z.number().int().min(1).max(365),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const keys = await store.list<SharedKey>("keys", user.id);
  const now = Date.now();
  const normalized = keys.map((k) => (k.status === "active" && new Date(k.expiresAt).getTime() < now ? { ...k, status: "expired" as const } : k));
  normalized.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok({ keys: normalized });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const gv = await store.get<GarageVehicle>("garage", parsed.data.garageVehicleId);
  if (!gv || gv.ownerId !== user.id) return fail("VEHICLE_NOT_FOUND", 404);
  const key: SharedKey = {
    id: generateId("KEY"),
    ownerId: user.id,
    garageVehicleId: gv.id,
    holderName: parsed.data.holderName,
    holderContact: parsed.data.holderContact,
    permission: parsed.data.permission,
    expiresAt: new Date(Date.now() + parsed.data.days * 86_400_000).toISOString(),
    createdAt: new Date().toISOString(),
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: "active",
  };
  await store.put("keys", key, { owner: user.id });
  return created({ key });
}

export const dynamic = "force-dynamic";
