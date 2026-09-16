import { z } from "zod";
import { created, fail, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { stores } from "@/data/site";
import { getCurrentUser } from "@/lib/auth";
import { generateId, isValidCNPhone } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  phone: z.string().trim().refine(isValidCNPhone, "INVALID_PHONE"),
  brand: z.enum(["xiaomi", "tesla"]),
  vehicleSlug: z.string().optional(),
  plate: z.string().trim().max(10).optional(),
  serviceType: z.enum(["maintenance", "repair", "bodywork", "tyres", "software", "mobile-charging", "pickup"]),
  storeId: z.string().optional(),
  valet: z.boolean().default(false),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.string().min(1).max(20),
  note: z.string().trim().max(500).optional(),
  agree: z.literal(true),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "service", 10);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  if (parsed.data.storeId && !stores.some((s) => s.id === parsed.data.storeId)) return fail("Unknown store", 422);
  const user = await getCurrentUser();
  const booking = { id: generateId("SV"), ownerId: user?.id, ...parsed.data, status: "confirmed", createdAt: new Date().toISOString() };
  await store.put("serviceBookings", booking, { owner: user?.id });
  return created({ booking });
}

export const dynamic = "force-dynamic";
