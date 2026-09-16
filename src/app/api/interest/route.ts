import { z } from "zod";
import { created, fail, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { getVehicle } from "@/data/vehicles";
import { generateId, isValidCNPhone, isValidEmail } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  contact: z.string().trim().min(5).max(120).refine((v) => isValidCNPhone(v) || isValidEmail(v), "INVALID_CONTACT"),
  vehicleSlug: z.string().min(1),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "interest", 10);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  if (!getVehicle(parsed.data.vehicleSlug)) return fail("Unknown vehicle", 404);
  const doc = { id: generateId("INT"), ...parsed.data, createdAt: new Date().toISOString() };
  await store.put("interests", doc);
  return created({ id: doc.id });
}

export const dynamic = "force-dynamic";
