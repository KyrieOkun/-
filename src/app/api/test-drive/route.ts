import { z } from "zod";
import { created, fail, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { getVehicle } from "@/data/vehicles";
import { stores } from "@/data/site";
import { getCurrentUser } from "@/lib/auth";
import { generateId, isValidCNPhone, normalizePhone } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  phone: z.string().trim().refine(isValidCNPhone, "INVALID_PHONE").transform(normalizePhone),
  vehicleSlug: z.string().min(1),
  mode: z.enum(["store", "home"]),
  storeId: z.string().optional(),
  city: z.string().trim().max(40).optional(),
  address: z.string().trim().max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.string().min(1).max(20),
  note: z.string().trim().max(500).optional(),
  agree: z.literal(true),
}).superRefine((data, ctx) => {
  if (data.mode === "home" && (!data.address || data.address.length < 5)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "ADDRESS_REQUIRED" });
  const [y, m, d] = data.date.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d));
  const valid = day.getUTCFullYear() === y && day.getUTCMonth() === m - 1 && day.getUTCDate() === d;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (!valid || day.getTime() < todayUtc || day.getTime() > todayUtc + 90 * 86_400_000) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "DATE_OUT_OF_RANGE" });
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
