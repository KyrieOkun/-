import { z } from "zod";
import { fail, ok, parseBody, rateLimit } from "@/lib/api";
import { planTrip } from "@/lib/trip";

const schema = z.object({
  originId: z.string().min(1),
  destinationId: z.string().min(1),
  vehicleSlug: z.string().min(1),
  trimId: z.string().optional(),
  startSoc: z.number().min(5).max(100).default(90),
  minArrivalSoc: z.number().min(5).max(60).default(15),
  network: z.enum(["any", "tesla", "xiaomi", "partner"]).default("any"),
  season: z.enum(["mild", "summer", "winter"]).default("mild"),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "trip", 60);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const plan = planTrip(parsed.data);
  if (!plan.ok) return fail(plan.code, 422, plan);
  return ok(plan);
}

export const dynamic = "force-dynamic";
