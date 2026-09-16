import { z } from "zod";
import { created, fail, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { getVehicle } from "@/data/vehicles";
import { stores } from "@/data/site";
import { getCurrentUser } from "@/lib/auth";
import { generateId, isValidCNPhone } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  phone: z.string().trim().refine(isValidCNPhone, "INVALID_PHONE"),
  vehicleSlug: z.string().min(1),
  mode: z.enum(["store", "home"]),
  storeId: z.string().optional(),
  city: z.string().trim().max(40).optional(),
  address: z.string().trim().max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.string().min(1).max(20),
  note: z.string().trim().max(500).optional(),
  agree: z.literal(true),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "test-drive", 10);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const vehicle = getVehicle(parsed.data.vehicleSlug);
  if (!vehicle) return fail("Unknown vehicle", 404);
  if (parsed.data.mode === "store" && !stores.some((s) => s.id === parsed.data.storeId)) return fail("Unknown store", 422);
  const user = await getCurrentUser();
  const booking = {
    id: generateId("TD"),
    ownerId: user?.id,
    ...parsed.data,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  await store.put("testDrives", booking, { owner: user?.id });
  return created({ booking });
}

export const dynamic = "force-dynamic";
