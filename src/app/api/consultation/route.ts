import { z } from "zod";
import { created, fail, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { atelierPrograms } from "@/data/site";
import { getVehicle } from "@/data/vehicles";
import { getCurrentUser } from "@/lib/auth";
import { generateId, isValidCNPhone, normalizePhone } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  phone: z.string().trim().refine(isValidCNPhone, "INVALID_PHONE").transform(normalizePhone),
  vehicleSlug: z.string().optional(),
  programs: z.array(z.string().refine((id) => atelierPrograms.some((p) => p.id === id), "UNKNOWN_PROGRAM")).min(1).max(6),
  budget: z.enum(["lt50k", "50k-150k", "150k-300k", "gt300k"]).optional(),
  city: z.string().trim().max(40).optional(),
  note: z.string().trim().max(800).optional(),
  agree: z.literal(true),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "consultation", 10);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  if (parsed.data.vehicleSlug && !getVehicle(parsed.data.vehicleSlug)) return fail("Unknown vehicle", 422);
  const user = await getCurrentUser();
  const doc = { id: generateId("AT"), ownerId: user?.id, ...parsed.data, status: "new", createdAt: new Date().toISOString() };
  await store.put("consultations", doc, { owner: user?.id });
  return created({ consultation: doc });
}

export const dynamic = "force-dynamic";
